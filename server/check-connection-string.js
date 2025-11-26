/* eslint-env node */

/**
 * Check if your connection string has the region and is in the correct format
 */

require('dotenv').config();

const url = process.env.DATABASE_URL;

if (!url) {
  console.log('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🔍 Analyzing your connection string...\n');

try {
  const testUrl = url.replace('postgresql://', 'http://');
  const parsed = new URL(testUrl);
  const hostname = parsed.hostname;
  
  console.log('Connection String Analysis:');
  console.log('  Hostname:', hostname);
  console.log('  Port:', parsed.port || '5432');
  console.log('  User:', parsed.username);
  console.log('  Database:', parsed.pathname.replace('/', '') || 'postgres');
  console.log('');
  
  // Check if it's a pooler connection
  if (hostname.includes('pooler.supabase.com')) {
    console.log('✅ You are using Connection Pooler format!');
    console.log('');
    
    // Extract region
    const regionMatch = hostname.match(/aws-0-([^.]+)/);
    if (regionMatch) {
      const region = regionMatch[1];
      console.log('✅ Region found:', region);
      console.log('');
      console.log('🎉 Your connection string looks correct!');
      console.log('   It includes the region and uses pooler format.');
      console.log('');
      console.log('💡 If connection still fails, check:');
      console.log('   1. Password is correctly URL-encoded');
      console.log('   2. Connection string was copied exactly from Supabase');
      console.log('   3. Your Supabase project is active');
    } else {
      console.log('⚠️  Could not extract region from hostname');
      console.log('   But hostname format looks correct (pooler.supabase.com)');
    }
  } else if (hostname.includes('db.') && hostname.includes('.supabase.co')) {
    console.log('⚠️  You are using Direct connection format');
    console.log('   This format has DNS resolution issues on Windows');
    console.log('');
    console.log('📋 SOLUTION:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Your Project → Settings → Database');
    console.log('   3. Under "Connection string", click "Session" tab');
    console.log('   4. Copy that connection string (it will have pooler.supabase.com)');
    console.log('   5. The region is already included in that connection string!');
    console.log('   6. Update your .env file');
  } else {
    console.log('❓ Unknown connection string format');
    console.log('   Hostname:', hostname);
    console.log('');
    console.log('💡 Make sure you copied the connection string from:');
    console.log('   Supabase Dashboard → Settings → Database → Connection string → Session tab');
  }
  
} catch (err) {
  console.log('❌ Error parsing connection string:', err.message);
  console.log('');
  console.log('💡 Make sure your DATABASE_URL is in the format:');
  console.log('   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres');
}

