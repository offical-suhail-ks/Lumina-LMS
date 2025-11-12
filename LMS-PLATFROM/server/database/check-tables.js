/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

async function checkTables() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_platform',
    allowPublicKeyRetrieval: true,
  };

  let conn;
  try {
    conn = await mariadb.createConnection(config);
    console.log('✅ Connected to database\n');

    // Check tables
    const tables = await conn.query('SHOW TABLES');
    console.log(`Found ${tables.length} tables:\n`);
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    }

    // Check users table structure
    if (tables.some(t => Object.values(t)[0] === 'users')) {
      console.log('\n📋 Users table structure:');
      const columns = await conn.query('DESCRIBE users');
      for (const col of columns) {
        console.log(`  - ${col.Field} (${col.Type})`);
      }

      // Check for admin user
      const users = await conn.query('SELECT * FROM users WHERE username = ?', ['admin']);
      if (users.length > 0) {
        console.log('\n✅ Admin user exists:');
        console.log(`   Username: ${users[0].username}`);
        console.log(`   Password: ${users[0].password}`);
        console.log(`   Role: ${users[0].role}`);
      } else {
        console.log('\n⚠️  Admin user does not exist');
      }
    } else {
      console.log('\n❌ Users table does not exist!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (conn) await conn.end();
  }
}

checkTables();

