/* eslint-env node */

/**
 * Test DNS resolution with different methods
 */

require('dotenv').config();
const dns = require('dns');
const { promisify } = require('util');

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('❌ DATABASE_URL not found');
  process.exit(1);
}

const testUrl = url.replace('postgresql://', 'http://');
const parsed = new URL(testUrl);
const hostname = parsed.hostname;

console.log('🔍 Testing DNS resolution for:', hostname);
console.log('');

// Set DNS servers
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

async function testDNS() {
  // Method 1: resolve4 (IPv4)
  console.log('Method 1: Trying IPv4 resolution...');
  try {
    const resolve4 = promisify(dns.resolve4);
    const addresses = await resolve4(hostname);
    console.log('✅ IPv4 addresses found:', addresses);
    return addresses[0];
  } catch (err) {
    console.log('❌ IPv4 resolution failed:', err.message);
  }
  
  // Method 2: resolve6 (IPv6)
  console.log('\nMethod 2: Trying IPv6 resolution...');
  try {
    const resolve6 = promisify(dns.resolve6);
    const addresses = await resolve6(hostname);
    console.log('✅ IPv6 addresses found:', addresses);
    return `[${addresses[0]}]`;
  } catch (err) {
    console.log('❌ IPv6 resolution failed:', err.message);
  }
  
  // Method 3: lookup (system resolver)
  console.log('\nMethod 3: Trying system lookup...');
  try {
    const lookup = promisify(dns.lookup);
    const result = await lookup(hostname, { family: 4, all: true });
    console.log('✅ System lookup result:', result);
    if (Array.isArray(result) && result.length > 0) {
      return result[0].address;
    }
  } catch (err) {
    console.log('❌ System lookup failed:', err.message);
  }
  
  console.log('\n❌ All DNS resolution methods failed!');
  console.log('\n💡 This confirms the Windows DNS issue.');
  console.log('   Solution: Use Connection Pooler from Supabase dashboard');
  return null;
}

testDNS().then(ip => {
  if (ip) {
    console.log('\n✅ DNS resolution successful!');
    console.log('   IP address:', ip);
    console.log('\n💡 You can use this IP in your connection, but it may change.');
    console.log('   Better solution: Use Connection Pooler connection string.');
  }
}).catch(console.error);

