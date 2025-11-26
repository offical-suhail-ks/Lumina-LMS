/* eslint-env node */

/**
 * Test connection using IPv6 address directly
 * This bypasses DNS resolution issues
 */

require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns').promises;

async function testIPv6Connection() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.log('❌ DATABASE_URL not found');
    return;
  }

  console.log('🔍 Testing IPv6 connection method...\n');
  
  try {
    // Parse connection string
    const testUrl = url.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    const hostname = parsed.hostname;
    
    console.log('Step 1: Resolving hostname to IPv6...');
    const addresses = await dns.resolve6(hostname);
    
    if (addresses.length === 0) {
      console.log('❌ No IPv6 addresses found');
      return;
    }
    
    console.log(`✅ Found IPv6 address: ${addresses[0]}\n`);
    
    // Replace hostname with IPv6 address in connection string
    const ipv6Url = url.replace(hostname, `[${addresses[0]}]`);
    console.log('Step 2: Attempting connection with IPv6 address...\n');
    
    const poolConfig = {
      connectionString: ipv6Url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };

    const pool = new Pool(poolConfig);
    let client;
    
    try {
      client = await pool.connect();
      console.log('✅ Connected successfully using IPv6!\n');
      
      const result = await client.query('SELECT version(), current_database()');
      console.log('Database Info:');
      console.log('  Version:', result.rows[0].version.split(',')[0]);
      console.log('  Database:', result.rows[0].current_database);
      console.log('\n🎉 Connection test successful!');
      console.log('\n💡 Note: Using IPv6 address directly works, but for production');
      console.log('   you should fix the DNS resolution issue or ensure your');
      console.log('   Supabase project is active.');
      
    } catch (err) {
      console.log('❌ Connection failed even with IPv6 address');
      console.log('   Error:', err.message);
      console.log('   Code:', err.code || 'N/A');
      console.log('\n💡 This suggests the project might be paused or');
      console.log('   there are other connection restrictions.');
    } finally {
      if (client) client.release();
      await pool.end();
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      console.log('\n💡 Cannot resolve IPv6 address.');
      console.log('   This confirms the DNS resolution issue.');
      console.log('   Please check if your Supabase project is active.');
    }
  }
}

testIPv6Connection();

