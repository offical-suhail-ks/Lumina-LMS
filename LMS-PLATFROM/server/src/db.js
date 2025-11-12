/* eslint-env node */

const mariadb = require('mariadb');
require('dotenv').config();

// Authentication handler to support different auth plugins
// This handles cases where MariaDB uses unsupported authentication plugins
const authSwitchHandler = (pluginName, pluginData, callback) => {
  // For unsupported plugins, try to use password-based auth
  if (pluginName === 'auth_gssapi_client' || pluginName === 'mysql_clear_password') {
    // Return empty buffer to skip plugin-specific auth
    callback(null, Buffer.alloc(0));
  } else if (pluginName === 'mysql_native_password' || pluginName === 'caching_sha2_password') {
    // For supported plugins, use the provided data
    const password = Buffer.from(process.env.DB_PASSWORD || '');
    callback(null, password);
  } else {
    // Default: try to use password
    callback(null, pluginData);
  }
};

// Create connection pool with better error handling
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_platform',
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
  authSwitchHandler: authSwitchHandler,
  permitLocalInfile: true,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  // Don't fail if database doesn't exist yet (for initialization)
  multipleStatements: false,
};

const pool = mariadb.createPool(poolConfig);

// Test connection with better error messages
async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database does not exist. Please run: npm run db:init');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED') {
      console.error('❌ Authentication failed. Please fix authentication plugin:');
      console.error('   Run: npm run db:fix-auth');
      console.error('   Or manually: ALTER USER \'root\'@\'localhost\' IDENTIFIED VIA mysql_native_password USING PASSWORD(\'your_password\');');
    } else if (err.code === 'ECONNREFUSED' || err.errno === -4078) {
      console.error('❌ Cannot connect to MariaDB. Make sure MariaDB is running.');
      console.error(`   Trying to connect to: ${poolConfig.host}:${poolConfig.port}`);
    } else {
      console.error('❌ Database connection error:', err.message);
      if (err.code) {
        console.error(`   Error code: ${err.code}`);
      }
      console.error('💡 Troubleshooting:');
      console.error('   1. Make sure MariaDB is running');
      console.error('   2. Check your .env file has correct DB credentials');
      console.error('   3. Run: npm run db:init (if database doesn\'t exist)');
      console.error('   4. Run: npm run db:fix-auth (if authentication error)');
    }
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Test connection on startup
testConnection().catch(() => {
  // Error already logged
});

// Helper function to execute queries
const query = async (sql, params = []) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

// Helper function for transactions
const transaction = async callback => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { pool, query, transaction };

