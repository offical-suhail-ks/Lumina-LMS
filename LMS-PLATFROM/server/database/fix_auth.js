/* eslint-env node */

const mariadb = require('mariadb');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixAuthentication() {
  console.log('🔧 MariaDB Authentication Plugin Fixer\n');
  console.log('This script will change your MariaDB user to use mysql_native_password plugin.\n');

  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
  const DB_USER = process.env.DB_USER || 'root';

  console.log(`Connecting to MariaDB at ${DB_HOST}:${DB_PORT}...`);
  console.log(`User: ${DB_USER}\n`);

  const password = await question('Enter your MariaDB password: ');
  const newPassword = await question('Enter new password (or press Enter to keep current): ');

  let conn;
  try {
    // Try to connect without database first
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: password,
      allowPublicKeyRetrieval: true,
    });

    console.log('✅ Connected to MariaDB\n');

    // Change authentication plugin
    const finalPassword = newPassword.trim() || password;
    const host = DB_HOST === 'localhost' ? 'localhost' : '%';

    console.log(`Changing authentication plugin for user '${DB_USER}@${host}'...`);
    
    // Try different methods based on MariaDB version
    try {
      await conn.query(`ALTER USER '${DB_USER}'@'${host}' IDENTIFIED VIA mysql_native_password USING PASSWORD(?)`, [finalPassword]);
    } catch (error) {
      // Fallback method
      await conn.query(`ALTER USER '${DB_USER}'@'${host}' IDENTIFIED BY ?`, [finalPassword]);
    }

    await conn.query('FLUSH PRIVILEGES');

    console.log('✅ Authentication plugin changed successfully!');
    console.log('\nYou can now restart your server.\n');

    // Verify
    const [userInfo] = await conn.query(
      "SELECT user, host, plugin FROM mysql.user WHERE user = ? AND host = ?",
      [DB_USER, host]
    );
    
    if (userInfo) {
      console.log('Current user settings:');
      console.log(`  User: ${userInfo.user}`);
      console.log(`  Host: ${userInfo.host}`);
      console.log(`  Plugin: ${userInfo.plugin}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual fix:');
    console.log('1. Connect to MariaDB using command line:');
    console.log('   mysql -u root -p');
    console.log('2. Run these commands:');
    console.log(`   ALTER USER '${DB_USER}'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');`);
    console.log('   FLUSH PRIVILEGES;');
    console.log('\nOr use the SQL file: database/fix_auth.sql');
  } finally {
    if (conn) await conn.end();
    rl.close();
  }
}

fixAuthentication();

