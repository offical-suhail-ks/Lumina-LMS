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

async function createFacultyUser() {
  let conn;
  try {
    conn = await mariadb.createConnection(poolConfig);
    
    console.log('👤 Creating faculty user...');
    
    // Check if faculty user already exists
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      ['faculty', 'faculty@lumina.edu']
    );
    
    if (existing.length > 0) {
      console.log('ℹ️  Faculty user already exists');
      console.log('   You can use:');
      console.log('   Username: faculty');
      console.log('   Password: faculty');
      return;
    }
    
    // Create faculty user
    await conn.query(
      `INSERT INTO users (id, username, password, role, name, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['faculty-1', 'faculty', 'faculty', 'faculty', 'Dr. Sarah Johnson', 'faculty@lumina.edu']
    );
    
    console.log('✅ Faculty user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Username: faculty');
    console.log('   Password: faculty');
    console.log('   Email: faculty@lumina.edu');
    console.log('   Name: Dr. Sarah Johnson');
    console.log('');
    console.log('🎉 You can now log in to the faculty dashboard!');
    
  } catch (error) {
    console.error('❌ Error creating faculty user:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database does not exist. Run: npm run db:init');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Authentication failed. Check your .env file credentials.');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

createFacultyUser();

