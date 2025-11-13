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

async function migrateMessages() {
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

    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrate-add-mailbox.sql');
    console.log('📄 Reading migration file...');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and clean up statements
    const statements = migration
      .split(';')
      .map(s => {
        return s
          .split('\n')
          .map(line => {
            const commentIndex = line.indexOf('--');
            if (commentIndex >= 0) {
              return line.substring(0, commentIndex);
            }
            return line;
          })
          .join('\n')
          .trim();
      })
      .filter(s => {
        const trimmed = s.trim();
        return (
          trimmed.length > 0 &&
          !trimmed.toLowerCase().startsWith('create database') &&
          !trimmed.toLowerCase().startsWith('use ') &&
          !trimmed.match(/^--/)
        );
      });

    console.log(`🔨 Executing ${statements.length} migration statement(s)...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await conn.query(statement);
        const tableMatch = statement.match(/CREATE TABLE.*?(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : `Statement ${i + 1}`;
        console.log(`   ✓ Created ${tableName} table`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠ Table already exists (skipping)`);
        } else {
          console.error(`   ✗ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n✅ Messages table migration completed\n');
    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrateMessages();

