/* eslint-env node */

const { Pool } = require('pg');
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

// Set DNS to prefer IPv4 and use reliable DNS servers
dns.setDefaultResultOrder('ipv4first');
// Use Google and Cloudflare DNS for better resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (err) {
  // If setServers fails, continue with system DNS
}

// Custom DNS resolver function
async function resolveHostname(hostname) {
  try {
    // Try IPv4 first
    const resolve4 = promisify(dns.resolve4);
    const addresses = await resolve4(hostname);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    // IPv4 failed, try IPv6
    try {
      const resolve6 = promisify(dns.resolve6);
      const addresses = await resolve6(hostname);
      if (addresses && addresses.length > 0) {
        return `[${addresses[0]}]`; // IPv6 needs brackets
      }
    } catch (err6) {
      // Both failed
      throw new Error(`DNS resolution failed: ${err.message}`);
    }
  }
  throw new Error(`No IP address found for ${hostname}`);
}

// Parse connection string and create pool config
function createPoolConfig() {
  if (process.env.DATABASE_URL) {
    try {
      // Parse connection string
      const url = process.env.DATABASE_URL;
      const testUrl = url.replace('postgresql://', 'http://');
      const parsed = new URL(testUrl);
      
      const hostname = parsed.hostname;
      
      // Check if it's a Direct connection (db.*.supabase.co) that might have DNS issues
      const isDirectConnection = hostname.includes('db.') && hostname.includes('.supabase.co');
      
      if (isDirectConnection) {
        // For Direct connections, we'll resolve DNS lazily on first connection
        // Return a config that will be updated after DNS resolution
        return {
          host: hostname, // Will be replaced with IP after resolution
          port: parseInt(parsed.port || '5432', 10),
          user: parsed.username,
          password: parsed.password,
          database: parsed.pathname.replace('/', '') || 'postgres',
          ssl: { rejectUnauthorized: false },
          max: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 20000, // Increased for DNS resolution
          _needsDnsResolution: true, // Flag to indicate we need to resolve
          _originalHostname: hostname,
        };
      } else {
        // Not a Direct connection, use normal configuration
        return {
          host: hostname,
          port: parseInt(parsed.port || '5432', 10),
          user: parsed.username,
          password: parsed.password,
          database: parsed.pathname.replace('/', '') || 'postgres',
          ssl: { rejectUnauthorized: false },
          max: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 15000,
        };
      }
    } catch (err) {
      // Fallback to connection string if parsing fails
      console.warn('⚠️  Could not parse DATABASE_URL, using connection string directly');
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      };
    }
  } else {
    // Use individual environment variables
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
}

let poolConfig = createPoolConfig();
let pool;
let dnsResolved = false;

// Initialize pool with DNS resolution if needed
async function initializePool() {
  if (pool) return pool;
  
  if (poolConfig._needsDnsResolution && !dnsResolved) {
    try {
      const resolvedHost = await resolveHostname(poolConfig._originalHostname);
      console.log(`✅ Resolved ${poolConfig._originalHostname} to ${resolvedHost}`);
      poolConfig.host = resolvedHost;
      delete poolConfig._needsDnsResolution;
      delete poolConfig._originalHostname;
      dnsResolved = true;
    } catch (dnsErr) {
      console.warn(`⚠️  DNS resolution failed: ${dnsErr.message}`);
      console.warn('   Attempting connection with hostname (may fail on Windows)');
      console.warn('   💡 Consider using Connection Pooler from Supabase dashboard');
      // Continue with hostname - might work if DNS resolves at connection time
      delete poolConfig._needsDnsResolution;
      delete poolConfig._originalHostname;
      dnsResolved = true;
    }
  }
  
  pool = new Pool(poolConfig);
  
  // Handle pool errors gracefully
  pool.on('error', (err) => {
    console.error('⚠️  Unexpected database pool error:', err.message);
    // Don't crash the app, just log the error
    // The pool will automatically try to reconnect
  });
  
  return pool;
}

// Initialize pool immediately (non-blocking)
initializePool().catch(err => {
  console.error('⚠️  Pool initialization warning:', err.message);
  // Create pool anyway with original config
  pool = new Pool(poolConfig);
  pool.on('error', (err) => {
    console.error('⚠️  Database pool error:', err.message);
  });
});

// Test connection with better error messages
async function testConnection() {
  const poolInstance = await initializePool();
  let client;
  try {
    client = await poolInstance.connect();
    await client.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (err) {
    if (err.code === '3D000') {
      console.error('❌ Database does not exist. Please check your database name.');
    } else if (err.code === '28P01') {
      console.error('❌ Authentication failed. Please check your database credentials.');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('❌ Cannot connect to PostgreSQL. Make sure the database server is running.');
      if (poolConfig.host) {
        console.error(`   Trying to connect to: ${poolConfig.host}:${poolConfig.port}`);
      } else {
        console.error('   Using connection string from DATABASE_URL');
      }
    } else {
      console.error('❌ Database connection error:', err.message);
      if (err.code) {
        console.error(`   Error code: ${err.code}`);
      }
      console.error('💡 Troubleshooting:');
      console.error('   1. Make sure PostgreSQL is running');
      console.error('   2. Check your .env file has correct DB credentials or DATABASE_URL');
      console.error('   3. Verify your Supabase connection string is correct');
    }
    return false;
  } finally {
    if (client) client.release();
  }
}

// Test connection on startup
testConnection().catch(() => {
  // Error already logged
});

// Convert MySQL-style ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql, params) {
  if (!params || params.length === 0) {
    return { sql, params };
  }
  
  // Simple conversion: replace ? with $1, $2, etc.
  // This handles most cases but may fail if ? appears in strings/comments
  let paramIndex = 1;
  const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  return { sql: convertedSql, params };
}

// Helper function to execute queries
// Returns result.rows for SELECT queries, and full result object for INSERT/UPDATE/DELETE
const query = async (sql, params = []) => {
  const poolInstance = await initializePool();
  let client;
  try {
    client = await poolInstance.connect();
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    const { sql: convertedSql, params: convertedParams } = convertPlaceholders(sql, params);
    const result = await client.query(convertedSql, convertedParams);
    
    // For compatibility with existing code, return rows array for SELECT queries
    // and a result-like object for INSERT/UPDATE/DELETE
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('WITH')) {
      return result.rows || [];
    } else if (sqlUpper.startsWith('CREATE') || sqlUpper.startsWith('DROP') || sqlUpper.startsWith('ALTER')) {
      // For DDL statements, return empty result
      return [];
    } else {
      // For INSERT/UPDATE/DELETE, return object with affectedRows (rowCount) for compatibility
      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0,
        affectedRows: result.rowCount || 0, // MySQL/MariaDB compatibility
        insertId: result.rows?.[0]?.id || null, // For INSERT queries with RETURNING
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Helper function for transactions
const transaction = async callback => {
  const poolInstance = await initializePool();
  const client = await poolInstance.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Export pool getter function
const getPool = async () => {
  return await initializePool();
};

// Export pool as a getter that returns the initialized pool
module.exports = { 
  get pool() {
    // Return the pool if it exists, otherwise return a promise that resolves to the pool
    return pool || initializePool();
  },
  query, 
  transaction, 
  getPool 
};

