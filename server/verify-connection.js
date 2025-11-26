/* eslint-env node */

require('dotenv').config();
const { Pool } = require('pg');

async function verifyConnection() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.log('❌ DATABASE_URL not found in .env');
    return;
  }

  console.log('🔍 Verifying Supabase connection...\n');
  
  // Parse the connection string to show what we're connecting to
  try {
    const testUrl = url.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    
    console.log('Connection Details:');
    console.log('  Host:', parsed.hostname);
    console.log('  Port:', parsed.port || '5432');
    console.log('  User:', parsed.username);
    console.log('  Database:', parsed.pathname.replace('/', '') || 'postgres');
    console.log('  Has Password:', parsed.password ? 'Yes ✓' : 'No ✗');
    console.log('');
    
    // Check if password might need URL encoding
    if (parsed.password) {
      const decoded = decodeURIComponent(parsed.password);
      if (decoded !== parsed.password) {
        console.log('⚠️  Password appears to be URL-encoded (this is correct)');
      }
      // Check for special characters that might cause issues
      const specialChars = /[#@$%&+=\s]/;
      if (specialChars.test(decoded)) {
        console.log('⚠️  Password contains special characters - make sure it\'s properly URL-encoded');
        console.log('   Special characters should be encoded (e.g., # = %23, @ = %40, space = %20)');
      }
    }
    console.log('');
  } catch (err) {
    console.log('❌ Error parsing connection string:', err.message);
    return;
  }

  // Try to connect
  console.log('🔌 Attempting connection...\n');
  
  // Force IPv6 family if needed (Supabase might only have IPv6)
  const poolConfig = {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000, // 15 seconds
    // Try to force IPv6 resolution
    // Note: pg library uses Node's dns module which should handle IPv6
  };
  
  // Set DNS family preference (if Node.js supports it)
  if (process.env.NODE_OPTIONS && !process.env.NODE_OPTIONS.includes('--dns-result-order')) {
    console.log('💡 Tip: If connection fails, try setting NODE_OPTIONS=--dns-result-order=ipv4first');
    console.log('   Or: NODE_OPTIONS=--dns-result-order=verbatim\n');
  }

  const pool = new Pool(poolConfig);
  let client;
  
  try {
    console.log('⏳ Connecting (this may take a few seconds)...');
    client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test a simple query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database Information:');
    console.log('  PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    console.log('  Current Database:', result.rows[0].current_database);
    console.log('  Current User:', result.rows[0].current_user);
    console.log('');
    console.log('🎉 Connection test successful!');
    
  } catch (err) {
    console.log('❌ Connection failed!\n');
    console.log('Error Details:');
    console.log('  Message:', err.message);
    console.log('  Code:', err.code || 'N/A');
    console.log('');
    
    if (err.code === 'ENOTFOUND') {
      console.log('💡 DNS Resolution Failed');
      console.log('   This means the hostname cannot be found. Possible causes:');
      console.log('   1. Your Supabase project is PAUSED - check your dashboard');
      console.log('   2. The hostname is incorrect (but you confirmed it\'s correct)');
      console.log('   3. Network/firewall blocking the connection');
      console.log('   4. DNS server issues');
      console.log('');
      console.log('   Action: Go to https://supabase.com/dashboard and check:');
      console.log('   - Is your project active (not paused)?');
      console.log('   - Does the hostname match exactly?');
      console.log('   - Are there any IP restrictions enabled?');
    } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      console.log('💡 Connection Timeout');
      console.log('   The server is not responding. Check:');
      console.log('   1. Your internet connection');
      console.log('   2. Firewall settings');
      console.log('   3. Supabase project status');
    } else if (err.code === '28P01') {
      console.log('💡 Authentication Failed');
      console.log('   Wrong password. Make sure:');
      console.log('   1. Password is correct');
      console.log('   2. Special characters are URL-encoded');
      console.log('   3. No extra spaces in the connection string');
    } else {
      console.log('💡 Other Error');
      console.log('   Check the error message above for details');
    }
    
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

verifyConnection();

