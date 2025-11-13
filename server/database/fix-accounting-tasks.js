/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function fixAccountingTasks() {
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

    // Check existing columns
    const columns = await conn.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'accounting_tasks'
    `, [DB_NAME]);

    const existingColumns = columns.map(c => c.COLUMN_NAME);

    console.log('📝 Adding missing columns to accounting_tasks...\n');

    // Add admin_remarks if it doesn't exist
    if (!existingColumns.includes('admin_remarks')) {
      try {
        await conn.query(`
          ALTER TABLE accounting_tasks 
          ADD COLUMN admin_remarks TEXT NULL AFTER notes
        `);
        console.log('   ✅ Added admin_remarks');
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log('   ⚠️  admin_remarks already exists');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ✓ admin_remarks already exists');
    }

    // Add accounting_remarks if it doesn't exist
    if (!existingColumns.includes('accounting_remarks')) {
      try {
        await conn.query(`
          ALTER TABLE accounting_tasks 
          ADD COLUMN accounting_remarks TEXT NULL AFTER admin_remarks
        `);
        console.log('   ✅ Added accounting_remarks');
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log('   ⚠️  accounting_remarks already exists');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ✓ accounting_remarks already exists');
    }

    // Add reviewed_by if it doesn't exist
    if (!existingColumns.includes('reviewed_by')) {
      try {
        await conn.query(`
          ALTER TABLE accounting_tasks 
          ADD COLUMN reviewed_by VARCHAR(255) NULL AFTER completed_by
        `);
        console.log('   ✅ Added reviewed_by');
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log('   ⚠️  reviewed_by already exists');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ✓ reviewed_by already exists');
    }

    // Add reviewed_at if it doesn't exist
    if (!existingColumns.includes('reviewed_at')) {
      try {
        await conn.query(`
          ALTER TABLE accounting_tasks 
          ADD COLUMN reviewed_at TIMESTAMP NULL AFTER completed_at
        `);
        console.log('   ✅ Added reviewed_at');
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log('   ⚠️  reviewed_at already exists');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ✓ reviewed_at already exists');
    }

    // Add index for application_status if it doesn't exist
    try {
      const indexes = await conn.query(`
        SHOW INDEXES FROM students WHERE Key_name = 'idx_application_status'
      `);
      
      if (indexes.length === 0) {
        await conn.query(`
          ALTER TABLE students 
          ADD INDEX idx_application_status (application_status)
        `);
        console.log('\n   ✅ Added index on students.application_status');
      } else {
        console.log('\n   ✓ Index idx_application_status already exists');
      }
    } catch (error) {
      console.log(`   ⚠️  Index error: ${error.message}`);
    }

    console.log('\n✅ All columns added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

fixAccountingTasks();

