/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    allowPublicKeyRetrieval: true,
    connectTimeout: 5000,
  };

  console.log('🔌 Testing MariaDB connection...');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${process.env.DB_NAME || 'lms_platform'}\n`);

  let conn;
  try {
    // First, try to connect without database
    conn = await mariadb.createConnection(config);
    console.log('✅ Connected to MariaDB server\n');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'lms_platform';
    const [databases] = await conn.query('SHOW DATABASES LIKE ?', [dbName]);
    
    if (databases.length === 0) {
      console.log(`⚠️  Database '${dbName}' does not exist.`);
      console.log('   Run: npm run db:init\n');
    } else {
      console.log(`✅ Database '${dbName}' exists\n`);
    }

    // Try to use the database
    await conn.query(`USE ${dbName}`);
    console.log(`✅ Successfully connected to database '${dbName}'\n`);

    // Check tables
    const [tables] = await conn.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run: npm run db:init\n');
    } else {
      console.log(`✅ Found ${tables.length} tables in database\n`);
    }

    console.log('🎉 Connection test successful!');
  } catch (err) {
    console.error('❌ Connection failed!\n');
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Authentication failed. Wrong username or password.');
      console.error('   Check your .env file (DB_USER and DB_PASSWORD)\n');
    } else if (err.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED' || err.errno === 45025) {
      console.error('Authentication plugin error: auth_gssapi_client not supported');
      console.error('   Fix: npm run db:fix-auth');
      console.error('   Or manually run:');
      console.error(`   ALTER USER '${config.user}'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');`);
      console.error('   FLUSH PRIVILEGES;\n');
    } else if (err.code === 'ECONNREFUSED' || err.errno === -4078) {
      console.error('Cannot connect to MariaDB server.');
      console.error('   Make sure MariaDB is running');
      console.error(`   Check if MariaDB is listening on ${config.host}:${config.port}\n`);
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${process.env.DB_NAME || 'lms_platform'}' does not exist.`);
      console.error('   Run: npm run db:init\n');
    } else {
      console.error('Error:', err.message);
      if (err.code) {
        console.error(`   Code: ${err.code}`);
      }
      if (err.errno) {
        console.error(`   Errno: ${err.errno}`);
      }
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Verify MariaDB is running');
      console.error('   2. Check .env file configuration');
      console.error('   3. Run: npm run db:init');
      console.error('   4. Run: npm run db:fix-auth (if auth error)\n');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

testConnection();

