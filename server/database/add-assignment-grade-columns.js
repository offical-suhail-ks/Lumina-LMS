/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function addGradeColumns() {
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

    // Check if columns exist
    const columns = await conn.query('DESCRIBE assignment_submissions');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('grade')) {
      console.log('📝 Adding grade column...');
      await conn.query('ALTER TABLE assignment_submissions ADD COLUMN grade DECIMAL(5,2) NULL');
      console.log('   ✓ Added grade column');
    } else {
      console.log('   ⚠ grade column already exists');
    }

    if (!columnNames.includes('feedback')) {
      console.log('📝 Adding feedback column...');
      await conn.query('ALTER TABLE assignment_submissions ADD COLUMN feedback TEXT NULL');
      console.log('   ✓ Added feedback column');
    } else {
      console.log('   ⚠ feedback column already exists');
    }

    if (!columnNames.includes('graded_at')) {
      console.log('📝 Adding graded_at column...');
      await conn.query('ALTER TABLE assignment_submissions ADD COLUMN graded_at TIMESTAMP NULL');
      console.log('   ✓ Added graded_at column');
    } else {
      console.log('   ⚠ graded_at column already exists');
    }

    if (!columnNames.includes('graded_by')) {
      console.log('📝 Adding graded_by column...');
      await conn.query('ALTER TABLE assignment_submissions ADD COLUMN graded_by VARCHAR(255) NULL');
      console.log('   ✓ Added graded_by column');
    } else {
      console.log('   ⚠ graded_by column already exists');
    }

    // Add index if it doesn't exist
    try {
      await conn.query('CREATE INDEX idx_grade ON assignment_submissions(grade)');
      console.log('   ✓ Added index on grade column');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('   ⚠ Index on grade already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

addGradeColumns();

