/* eslint-env node */

/**
 * Test alternative connection methods
 * Since the database is active, we'll try different approaches
 */

require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

async function testAlternativeConnections() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.log('❌ DATABASE_URL not found');
    return;
  }

  console.log('🔍 Testing alternative connection methods...\n');
  
  // Parse the connection string
  const testUrl = url.replace('postgresql://', 'http://');
  const parsed = new URL(testUrl);
  
  const hostname = parsed.hostname;
  const port = parsed.port || '5432';
  const user = parsed.username;
  const password = parsed.password;
  const database = parsed.pathname.replace('/', '') || 'postgres';
  
  console.log('Connection Details:');
  console.log('  Host:', hostname);
  console.log('  Port:', port);
  console.log('  User:', user);
  console.log('  Database:', database);
  console.log('');
  
  // Method 1: Try with custom DNS lookup
  console.log('Method 1: Using custom DNS lookup...');
  try {
    // Set DNS lookup to use IPv4 first, then IPv6
    dns.setDefaultResultOrder('ipv4first');
    
    const poolConfig1 = {
      host: hostname,
      port: parseInt(port, 10),
      user: user,
      password: password,
      database: database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };
    
    const pool1 = new Pool(poolConfig1);
    const client1 = await pool1.connect();
    const result1 = await client1.query('SELECT version()');
    console.log('✅ Method 1 SUCCESS! Using individual parameters with IPv4-first DNS\n');
    client1.release();
    await pool1.end();
    
    console.log('🎉 Connection successful! Use this configuration in your db.js file.');
    return;
  } catch (err) {
    console.log('❌ Method 1 failed:', err.message);
    console.log('');
  }
  
  // Method 2: Try with IPv6 explicitly
  console.log('Method 2: Trying IPv6 resolution...');
  try {
    const addresses = await dns.promises.resolve6(hostname);
    if (addresses.length > 0) {
      const ipv6Host = `[${addresses[0]}]`;
      const poolConfig2 = {
        host: ipv6Host,
        port: parseInt(port, 10),
        user: user,
        password: password,
        database: database,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      };
      
      const pool2 = new Pool(poolConfig2);
      const client2 = await pool2.connect();
      const result2 = await client2.query('SELECT version()');
      console.log('✅ Method 2 SUCCESS! Using IPv6 address directly\n');
      client2.release();
      await pool2.end();
      return;
    }
  } catch (err) {
    console.log('❌ Method 2 failed:', err.message);
    console.log('');
  }
  
  // Method 3: Try with connection string but different DNS settings
  console.log('Method 3: Trying connection string with DNS workaround...');
  try {
    // Force IPv4 lookup
    const originalLookup = dns.lookup;
    dns.lookup = function(hostname, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      options.family = 4; // Force IPv4
      return originalLookup(hostname, options, callback);
    };
    
    const poolConfig3 = {
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    };
    
    const pool3 = new Pool(poolConfig3);
    const client3 = await pool3.connect();
    const result3 = await client3.query('SELECT version()');
    console.log('✅ Method 3 SUCCESS! Using connection string with IPv4 DNS\n');
    client3.release();
    await pool3.end();
    
    // Restore original lookup
    dns.lookup = originalLookup;
    return;
  } catch (err) {
    console.log('❌ Method 3 failed:', err.message);
    console.log('');
    // Restore original lookup
    dns.lookup = dns.lookup;
  }
  
  console.log('❌ All connection methods failed.');
  console.log('\n💡 Recommendations:');
  console.log('1. Try using Session or Transaction pooler connection string from Supabase');
  console.log('2. Check Windows firewall/antivirus settings');
  console.log('3. Try running as administrator');
  console.log('4. Check if your network supports IPv6');
}

testAlternativeConnections().catch(console.error);

