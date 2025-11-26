/* eslint-env node */

/**
 * Fix connection string with special characters in password
 */

require('dotenv').config();

console.log('🔍 Checking your connection string...\n');

// Your current connection string
const currentUrl = 'postgresql://postgres:Suhanasuhail@123@db.ipvwbkpsusclfoovngid.supabase.co:5432/postgres';

console.log('Current connection string:');
console.log('  ' + currentUrl.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('');

// The problem: @ in password breaks the URL parsing
// Password: Suhanasuhail@123
// The @ symbol needs to be URL-encoded as %40

const fixedPassword = 'Suhanasuhail%40123'; // @ encoded as %40
const fixedUrl = 'postgresql://postgres:' + fixedPassword + '@db.ipvwbkpsusclfoovngid.supabase.co:5432/postgres';

console.log('✅ Fixed connection string:');
console.log('  ' + fixedUrl.replace(/:[^:@]+@/, ':****@'));
console.log('');

// Verify the fix
try {
  const testUrl = fixedUrl.replace('postgresql://', 'http://');
  const parsed = new URL(testUrl);
  
  console.log('Connection Details:');
  console.log('  Host:', parsed.hostname);
  console.log('  Port:', parsed.port || '5432');
  console.log('  User:', parsed.username);
  console.log('  Database:', parsed.pathname.replace('/', '') || 'postgres');
  console.log('  Password decoded:', decodeURIComponent(parsed.password));
  console.log('');
  console.log('✅ Connection string format is correct!');
  console.log('');
  
  console.log('📋 Update your .env file with:');
  console.log('');
  console.log('DATABASE_URL=' + fixedUrl);
  console.log('');
  
} catch (err) {
  console.log('❌ Error:', err.message);
}

