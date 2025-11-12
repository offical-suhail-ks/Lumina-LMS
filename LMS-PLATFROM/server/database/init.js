/* eslint-env node */

const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function initializeDatabase() {
  let conn;
  try {
    // Authentication handler to support different auth plugins
    const authSwitchHandler = (pluginName, pluginData, callback) => {
      // Handle unsupported auth plugins by using password authentication
      if (pluginName === 'auth_gssapi_client' || pluginName === 'mysql_clear_password') {
        // Use mysql_native_password or skip auth plugin
        callback(null, Buffer.alloc(0));
      } else {
        // For other plugins, use the default handler
        callback(null, pluginData);
      }
    };

    // Connect without database first to create it
    console.log('🔌 Connecting to MariaDB...');
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      allowPublicKeyRetrieval: true,
      authSwitchHandler: authSwitchHandler,
      permitLocalInfile: true,
    });

    console.log('✅ Connected to MariaDB');

    // Create database if it doesn't exist
    console.log(`📦 Creating database '${DB_NAME}' if it doesn't exist...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE ${DB_NAME}`);
    console.log(`✅ Database '${DB_NAME}' ready`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📄 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and clean up statements
    const statements = schema
      .split(';')
      .map(s => {
        // Remove comments (lines starting with --)
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
        // Filter out empty statements and comments
        const trimmed = s.trim();
        return (
          trimmed.length > 0 &&
          !trimmed.toLowerCase().startsWith('create database') &&
          !trimmed.toLowerCase().startsWith('use ') &&
          !trimmed.match(/^--/)
        );
      });

    // Disable foreign key checks temporarily for table creation
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log(`🔨 Executing ${statements.length} schema statements...`);
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await conn.query(statement);
          if (i < 5 || i % 5 === 0) {
            // Log first 5 and every 5th statement
            const preview = statement.substring(0, 60).replace(/\n/g, ' ');
            console.log(`   ✓ Statement ${i + 1}/${statements.length}: ${preview}...`);
          }
        } catch (error) {
          // Ignore "table already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate key')) {
            const preview = statement.substring(0, 100).replace(/\n/g, ' ');
            console.error(`   ✗ Error in statement ${i + 1}: ${preview}...`);
            console.error(`     ${error.message}`);
          }
        }
      }
    }

    // Re-enable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database schema created successfully');

    // Insert default admin user if not exists
    console.log('👤 Creating default admin user...');
    const [existingAdmin] = await conn.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (existingAdmin.length === 0) {
      await conn.query(
        'INSERT INTO users (id, username, password, role, name, email) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin', 'admin', 'admin', 'Elena Park', 'admin@lumina.edu']
      );
      console.log('✅ Default admin user created (username: admin, password: admin)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

// Run initialization
initializeDatabase();

