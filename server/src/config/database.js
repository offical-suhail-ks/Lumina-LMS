/* eslint-env node */

/**
 * Database configuration file
 * Note: This file is not currently used - db.js is the main database connection file
 * Kept for potential future use or alternative configuration
 */

const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_platform',
  connectionLimit: 10,
});

const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const query = async (sql, params) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  pool,
  getConnection,
  query,
};

