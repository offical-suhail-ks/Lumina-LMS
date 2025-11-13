/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_platform',
};

async function migrate() {
  let conn;
  try {
    console.log('🔐 Starting password reset migration...');
    conn = await mariadb.createConnection(dbConfig);

    const sqlFile = path.join(__dirname, 'migrate-add-password-reset.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await conn.query(statement);
        console.log('   ✓ Executed statement');
      } catch (error) {
        if (error.message.includes('Duplicate column') || error.message.includes('already exists')) {
          console.log('   ⚠️  Table/column already exists, skipping...');
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Password reset migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();

