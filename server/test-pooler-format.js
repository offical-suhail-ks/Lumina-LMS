/* eslint-env node */

/**
 * Test if using pooler format helps with DNS resolution
 */

require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

console.log('🔍 Testing Connection Pooler Format\n');

// Set DNS to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

const url = process.env.DATABASE_URL;

if (!url) {
  console.log('❌ DATABASE_URL not found');
  process.exit(1);
}

// Check if it's already a pooler connection
if (url.includes('pooler.supabase.com')) {
  console.log('✅ You are already using Connection Pooler format!');
  console.log('   If connection still fails, check:');
  console.log('   1. Password is correctly URL-encoded');
  console.log('   2. Connection string is copied exactly from Supabase dashboard');
  console.log('   3. Your Supabase project is active\n');
} else {
  console.log('⚠️  You are using Direct connection format');
  console.log('   This format has DNS resolution issues on Windows\n');
  console.log('📋 SOLUTION: Switch to Connection Pooler\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Your Project → Settings → Database');
  console.log('3. Under "Connection string", click "Session" tab');
  console.log('4. Copy that connection string (uses pooler.supabase.com)');
  console.log('5. Update your .env file with the new connection string');
  console.log('6. Run: npm run db:test\n');
  
  // Try to convert to pooler format (this is just a guess, user should get real one)
  console.log('💡 The pooler connection string format should be:');
  const testUrl = url.replace('postgresql://', 'http://');
  const parsed = new URL(testUrl);
  const projectRef = parsed.hostname.split('.')[1]; // Extract project ref
  console.log(`   postgresql://postgres.${projectRef}:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`);
  console.log('\n   ⚠️  But you MUST get the actual connection string from Supabase dashboard!');
  console.log('   The region and exact format may differ.\n');
}

// Test current connection
async function testConnection() {
  console.log('🔌 Testing current connection...\n');
  
  try {
    const testUrl = url.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    
    const poolConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace('/', '') || 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };
    
    const pool = new Pool(poolConfig);
    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_database()');
    
    console.log('✅ Connection successful!');
    console.log('   Database:', result.rows[0].current_database);
    console.log('   Version:', result.rows[0].version.split(',')[0]);
    console.log('\n🎉 Your connection is working!\n');
    
    client.release();
    await pool.end();
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('   Code:', err.code || 'N/A');
    console.log('\n💡 This confirms you need to use Connection Pooler format.');
    console.log('   Follow the steps above to get the pooler connection string.\n');
    process.exit(1);
  }
}

testConnection();

