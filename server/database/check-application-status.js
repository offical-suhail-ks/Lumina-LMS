/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function checkColumn() {
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

    // Check if application_status column exists
    console.log('🔍 Checking students table columns...');
    const columns = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'students'
      ORDER BY ORDINAL_POSITION
    `, [DB_NAME]);

    console.log('\n📋 Students table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
    });

    const hasApplicationStatus = columns.some(col => col.COLUMN_NAME === 'application_status');
    
    if (hasApplicationStatus) {
      console.log('\n✅ application_status column EXISTS');
    } else {
      console.log('\n❌ application_status column DOES NOT EXIST');
      console.log('\n💡 Running migration...');
      
      // Run the migration
      await conn.query(`
        ALTER TABLE students 
        ADD COLUMN application_status ENUM('pending', 'fee_setup_pending', 'fee_setup_completed', 'under_review', 'accepted', 'rejected') DEFAULT 'pending' AFTER status
      `);
      
      console.log('✅ Column added successfully!');
    }

    // Check accounting_tasks columns
    console.log('\n🔍 Checking accounting_tasks table columns...');
    const accountingColumns = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'accounting_tasks'
      AND COLUMN_NAME IN ('admin_remarks', 'accounting_remarks', 'reviewed_by', 'reviewed_at')
      ORDER BY ORDINAL_POSITION
    `, [DB_NAME]);

    console.log('\n📋 Accounting tasks columns (relevant):');
    if (accountingColumns.length === 0) {
      console.log('   ⚠️  No relevant columns found');
    } else {
      accountingColumns.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
  } finally {
    if (conn) await conn.end();
  }
}

checkColumn();

