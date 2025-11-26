/* eslint-env node */

/**
 * Database configuration file
 * Note: This file is not currently used - db.js is the main database connection file
 * Kept for potential future use or alternative configuration
 */

const { Pool } = require('pg');
require('dotenv').config();

// Parse connection string or use individual environment variables
let poolConfig;

if (process.env.DATABASE_URL) {
  try {
    // Parse connection string and use individual parameters
    // This works better on Windows with DNS resolution issues
    const url = process.env.DATABASE_URL;
    const testUrl = url.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    
    poolConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace('/', '') || 'postgres',
      ssl: { rejectUnauthorized: false }, // Always use SSL for Supabase
      max: 10, // connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
    
    // Set DNS to prefer IPv4 (helps on Windows)
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
  } catch (err) {
    // Fallback to connection string if parsing fails
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    };
  }
} else {
  // Use individual environment variables
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    max: 10, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(poolConfig);

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('⚠️  Database pool error (config/database.js):', err.message);
  // Don't crash the app, the pool will try to reconnect
});

const getConnection = async () => {
  try {
    return await pool.connect();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

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

const query = async (sql, params) => {
  let client;
  try {
    client = await pool.connect();
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    const { sql: convertedSql, params: convertedParams } = convertPlaceholders(sql, params);
    const result = await client.query(convertedSql, convertedParams);
    
    // For compatibility with existing code, return rows array for SELECT queries
    // and a result-like object for INSERT/UPDATE/DELETE
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('WITH')) {
      return result.rows;
    } else {
      // For INSERT/UPDATE/DELETE, return object with affectedRows (rowCount) for compatibility
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        affectedRows: result.rowCount, // MySQL/MariaDB compatibility
        insertId: result.rows[0]?.id || null, // For INSERT queries with RETURNING
      };
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  pool,
  getConnection,
  query,
};

