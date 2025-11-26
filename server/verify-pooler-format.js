/* eslint-env node */

/**
 * Verify the Connection Pooler format is correct
 */

require('dotenv').config();

const url = process.env.DATABASE_URL;

if (!url) {
  console.log('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔍 Verifying Connection Pooler format...\n');

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
  
  // Check for common issues
  const issues = [];
  
  if (hostname.includes('[') || hostname.includes(']')) {
    issues.push('❌ Found brackets [ ] in hostname - remove them!');
    issues.push('   Should be: aws-0-ap-southeast-2.pooler.supabase.com');
    issues.push('   Not: aws-0-[ap-southeast-2].pooler.supabase.com');
  }
  
  if (hostname.includes('db.') && hostname.includes('.supabase.co')) {
    issues.push('❌ Still using Direct connection (db.*.supabase.co)');
    issues.push('   Need to use Connection Pooler (pooler.supabase.com)');
  }
  
  if (!hostname.includes('pooler.supabase.com')) {
    issues.push('❌ Not using Connection Pooler format');
    issues.push('   Should contain: pooler.supabase.com');
  }
  
  if (issues.length === 0) {
    console.log('✅ Connection string format looks correct!');
    console.log('   Using Connection Pooler format');
    console.log('   No brackets found');
    console.log('');
    console.log('💡 If connection still fails:');
    console.log('   1. Make sure password is correct');
    console.log('   2. Verify project is active in Supabase');
    console.log('   3. Check IP restrictions in Supabase dashboard');
  } else {
    console.log('⚠️  Issues found:\n');
    issues.forEach(issue => console.log(issue));
    console.log('');
    console.log('📋 Correct format:');
    console.log('   postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres');
    console.log('');
    console.log('   Note: No brackets around the region!');
  }
  
} catch (err) {
  console.log('❌ Error parsing connection string:', err.message);
  console.log('');
  console.log('💡 Make sure your DATABASE_URL is in the format:');
  console.log('   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres');
  console.log('   (Remove brackets from region)');
}

