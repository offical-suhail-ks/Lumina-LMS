/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function createPasswordResetTable() {
  let conn;
  try {
    console.log('🔌 Connecting to MariaDB...');
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      allowPublicKeyRetrieval: true,
    });

    console.log('✅ Connected\n');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_type ENUM('user', 'student') NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user (user_id, user_type),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('🔨 Creating password_reset_tokens table...');
    await conn.query(createTableSQL);
    console.log('✅ password_reset_tokens table created successfully\n');

    // Verify table exists
    const [result] = await conn.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'password_reset_tokens'",
      [DB_NAME]
    );

    if (result.count > 0) {
      console.log('✅ Verified: password_reset_tokens table exists in database');
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ password_reset_tokens table already exists');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    if (conn) await conn.end();
  }
}

createPasswordResetTable();

