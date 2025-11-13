/* eslint-env node */

const mariadb = require('mariadb');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_platform',
  allowPublicKeyRetrieval: true,
};

async function createAccountingUser() {
  let conn;
  try {
    conn = await mariadb.createConnection(poolConfig);
    
    console.log('👤 Creating accounting user...');
    
    // Check if accounting user already exists
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['accounting', 'accounting@lumina.edu']
    );
    
    if (existing.length > 0) {
      console.log('ℹ️  Accounting user already exists');
      console.log('   You can use:');
      console.log('   Username: accounting');
      console.log('   Password: accounting');
      return;
    }
    
    // Create accounting user
    await conn.query(
      `INSERT INTO users (id, username, password, role, name, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['accounting-1', 'accounting', 'accounting', 'accounting', 'Accounting Team', 'accounting@lumina.edu']
    );
    
    console.log('✅ Accounting user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Username: accounting');
    console.log('   Password: accounting');
    console.log('   Email: accounting@lumina.edu');
    console.log('   Name: Accounting Team');
    console.log('');
    console.log('🎉 You can now log in to the accounting dashboard!');
    console.log('');
    console.log('💡 Features available:');
    console.log('   - Manage student fee setup tasks');
    console.log('   - Set up course fees and payment plans');
    console.log('   - Manage employee salaries');
    console.log('   - Track salary payments');
    
  } catch (error) {
    console.error('❌ Error creating accounting user:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist. Run: npm run db:init');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Authentication failed. Check your .env file credentials.');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('💡 User with this username or email already exists.');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

createAccountingUser();

