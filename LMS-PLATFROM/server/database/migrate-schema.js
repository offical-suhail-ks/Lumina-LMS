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

async function migrateSchema() {
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

    // Drop old tables if they exist
    console.log('🗑️  Dropping old tables...');
    const tablesToDrop = [
      'assignment_submissions',
      'private_chat_messages',
      'private_chat_threads',
      'chat_group_messages',
      'chat_group_members',
      'chat_groups',
      'course_enrollments',
      'course_tags',
      'assignments',
      'students',
      'courses',
      'users',
    ];

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tablesToDrop) {
      try {
        await conn.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`   ✓ Dropped ${table}`);
      } catch (error) {
        console.log(`   ⚠ ${table}: ${error.message}`);
      }
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old tables dropped\n');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📄 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema
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

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log(`🔨 Creating ${statements.length} tables...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await conn.query(statement);
        const tableMatch = statement.match(/CREATE TABLE.*?(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : `Table ${i + 1}`;
        console.log(`   ✓ Created ${tableName}`);
      } catch (error) {
        console.error(`   ✗ Error: ${error.message}`);
      }
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Schema migration completed\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    await conn.query(
      'INSERT INTO users (id, username, password, role, name, email) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'admin', 'admin', 'admin', 'Elena Park', 'admin@lumina.edu']
    );
    console.log('✅ Admin user created (username: admin, password: admin)\n');

    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrateSchema();

