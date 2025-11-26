/* eslint-env node */

require('dotenv').config();
const dns = require('dns').promises;

async function testDNS() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.log('❌ DATABASE_URL not found in .env');
    return;
  }

  try {
    const testUrl = url.replace('postgresql://', 'http://');
    const parsed = new URL(testUrl);
    const hostname = parsed.hostname;
    
    console.log('🔍 Testing DNS resolution for:', hostname);
    console.log('');
    
    try {
      const addresses = await dns.resolve4(hostname);
      console.log('✅ DNS resolution successful!');
      console.log('   IP addresses:', addresses.join(', '));
      console.log('');
      console.log('💡 The hostname resolves correctly.');
      console.log('   If connection still fails, check:');
      console.log('   1. Your Supabase project is active (not paused)');
      console.log('   2. Your IP is allowed in Supabase dashboard');
      console.log('   3. Firewall/network settings');
    } catch (err) {
      console.log('❌ DNS resolution failed!');
      console.log('   Error:', err.message);
      console.log('');
      console.log('💡 Possible issues:');
      console.log('   1. Check if the hostname is correct');
      console.log('   2. Verify your Supabase project is active');
      console.log('   3. Check your internet connection');
      console.log('   4. The project might be paused - check Supabase dashboard');
      console.log('');
      console.log('   To get the correct connection string:');
      console.log('   1. Go to your Supabase project dashboard');
      console.log('   2. Navigate to Settings > Database');
      console.log('   3. Copy the connection string from "Connection string" section');
    }
  } catch (err) {
    console.log('❌ Error parsing connection string:', err.message);
  }
}

testDNS();

