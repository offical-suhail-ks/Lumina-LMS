const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_platform',
  connectionLimit: 5,
});

async function createFeatureFlagsTable() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Database connected successfully');

    const sqlFile = path.join(__dirname, 'migrate-add-feature-flags.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await conn.query(statement);
      }
    }

    console.log('✅ Feature flags table created successfully');
    console.log('✅ Default feature flags inserted');
  } catch (error) {
    console.error('❌ Error creating feature flags table:', error);
    throw error;
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

createFeatureFlagsTable()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

