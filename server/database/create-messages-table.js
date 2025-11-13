/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function createMessagesTable() {
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
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        sender_id VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_role ENUM('admin', 'faculty', 'student', 'parent', 'accounting') NOT NULL,
        recipient_id VARCHAR(255) NULL,
        recipient_role ENUM('admin', 'faculty', 'student', 'parent', 'accounting') NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        read_by_sender BOOLEAN DEFAULT TRUE,
        read_by_recipient BOOLEAN DEFAULT FALSE,
        deleted_by_sender BOOLEAN DEFAULT FALSE,
        deleted_by_recipient BOOLEAN DEFAULT FALSE,
        is_announcement BOOLEAN DEFAULT FALSE,
        announcement_audience ENUM('all', 'students', 'faculty', 'parents') NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sender (sender_id),
        INDEX idx_recipient (recipient_id),
        INDEX idx_created_at (created_at),
        INDEX idx_read_by_recipient (read_by_recipient),
        INDEX idx_announcement (is_announcement, announcement_audience)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('🔨 Creating messages table...');
    await conn.query(createTableSQL);
    console.log('✅ Messages table created successfully\n');

    // Verify table exists
    const [result] = await conn.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'messages'",
      [DB_NAME]
    );

    if (result.count > 0) {
      console.log('✅ Verified: messages table exists in database');
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Messages table already exists');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    if (conn) await conn.end();
  }
}

createMessagesTable();

