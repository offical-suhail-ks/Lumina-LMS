/* eslint-env node */

require('dotenv').config();
const { query } = require('./db');

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin user...\n');

    // Check if admin user exists
    const users = await query('SELECT id, username, password, role, name, email FROM users WHERE username = ?', ['admin']);

    if (users.length === 0) {
      console.log('❌ Admin user does not exist!\n');
      console.log('Creating admin user...\n');

      await query(
        'INSERT INTO users (id, username, password, role, name, email) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin', 'admin', 'admin', 'Elena Park', 'admin@lumina.edu']
      );

      console.log('✅ Admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin\n');
    } else {
      const admin = users[0];
      console.log('✅ Admin user exists:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password === 'admin' ? 'admin (default)' : '***'}\n`);

      // Test login
      console.log('🧪 Testing login...');
      const testUsers = await query(
        'SELECT id, username, password, role, name, email FROM users WHERE username = ? AND password = ?',
        ['admin', 'admin']
      );

      if (testUsers.length > 0) {
        console.log('✅ Login test successful! You can log in with:');
        console.log('   Username: admin');
        console.log('   Password: admin\n');
      } else {
        console.log('⚠️  Password mismatch! The password in database does not match "admin".\n');
        console.log('To reset password, run:');
        console.log('   UPDATE users SET password = "admin" WHERE username = "admin";\n');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist. Run: npm run db:init\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED') {
      console.error('\n💡 Authentication error. Run: npm run db:fix-auth\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Cannot connect to MariaDB. Make sure MariaDB is running.\n');
    } else {
      console.error('\n💡 Check your database connection in .env file\n');
    }
    process.exit(1);
  }
}

checkAdmin();

