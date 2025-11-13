/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function migrateApplicationStatus() {
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

    // Check if application_status column already exists
    console.log('🔍 Checking if migration is needed...');
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'application_status'
    `, [DB_NAME]);

    if (columns && columns.length > 0) {
      console.log('⚠️  Column application_status already exists. Skipping migration.\n');
      console.log('🎉 Migration check complete!');
      return;
    }

    console.log('📝 Running migration...\n');

    // Read and execute migration SQL
    const migrationPath = path.join(__dirname, 'migrate-add-application-status.sql');
    console.log('📄 Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      try {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        await conn.query(statement);
        console.log(`   ✓ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Check if error is because column already exists
        if (error.message.includes('Duplicate column name')) {
          console.log(`   ⚠ Statement ${i + 1}: Column already exists, skipping...`);
        } else {
          console.error(`   ✗ Error in statement ${i + 1}: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('🎉 All columns added:');
    console.log('   - students.application_status');
    console.log('   - accounting_tasks.admin_remarks');
    console.log('   - accounting_tasks.accounting_remarks');
    console.log('   - accounting_tasks.reviewed_by');
    console.log('   - accounting_tasks.reviewed_at');
    console.log('   - Index on students.application_status');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrateApplicationStatus();

