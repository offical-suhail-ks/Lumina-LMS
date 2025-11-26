/* eslint-env node */

/**
 * Test the fixed connection string
 */

require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

// Set DNS to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

// Fixed connection string with URL-encoded password
const fixedUrl = 'postgresql://postgres:Suhanasuhail%40123@db.ipvwbkpsusclfoovngid.supabase.co:5432/postgres';

console.log('🔌 Testing connection with fixed URL (password URL-encoded)...\n');

async function testConnection() {
  try {
    // Parse and use individual parameters (better for Windows DNS)
    const testUrl = fixedUrl.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    
    console.log('Connection Details:');
    console.log('  Host:', parsed.hostname);
    console.log('  Port:', parsed.port || '5432');
    console.log('  User:', parsed.username);
    console.log('  Database:', parsed.pathname.replace('/', '') || 'postgres');
    console.log('');
    
    const poolConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      user: parsed.username,
      password: parsed.password, // Already URL-decoded by URL parser
      database: parsed.pathname.replace('/', '') || 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };
    
    console.log('⏳ Connecting...');
    const pool = new Pool(poolConfig);
    const client = await pool.connect();
    
    console.log('✅ Connected successfully!\n');
    
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database Information:');
    console.log('  PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    console.log('  Current Database:', result.rows[0].current_database);
    console.log('  Current User:', result.rows[0].current_user);
    console.log('');
    console.log('🎉 Connection test successful!');
    console.log('');
    console.log('📋 Your .env file should contain:');
    console.log('DATABASE_URL=' + fixedUrl);
    console.log('');
    console.log('💡 The password @ symbol is encoded as %40');
    
    client.release();
    await pool.end();
    
  } catch (err) {
    console.log('❌ Connection failed!\n');
    console.log('Error Details:');
    console.log('  Message:', err.message);
    console.log('  Code:', err.code || 'N/A');
    console.log('');
    
    if (err.code === 'ENOTFOUND') {
      console.log('💡 DNS Resolution Failed');
      console.log('   This is the Windows DNS issue we discussed.');
      console.log('   Even with the correct password encoding, the Direct connection');
      console.log('   hostname may not resolve on Windows.');
      console.log('');
      console.log('📋 SOLUTION: Use Connection Pooler instead');
      console.log('   1. Go to Supabase Dashboard → Settings → Database');
      console.log('   2. Copy the "Session" pooler connection string');
      console.log('   3. Make sure to URL-encode the password @ as %40');
      console.log('   4. Update your .env file');
    } else if (err.code === '28P01') {
      console.log('💡 Authentication Failed');
      console.log('   Password might still be incorrect.');
      console.log('   Make sure @ is encoded as %40 in the connection string.');
    } else {
      console.log('💡 Other error - check the message above');
    }
    
    process.exit(1);
  }
}

testConnection();

