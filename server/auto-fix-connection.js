/* eslint-env node */

/**
 * Automatically detect connection issues and suggest Connection Pooler
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔍 Analyzing your connection configuration...\n');

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
const testUrl = url.replace('postgresql://', 'http://');
const parsed = new URL(testUrl);
const hostname = parsed.hostname;

console.log('Current Configuration:');
console.log('  Hostname:', hostname);
console.log('  Type:', hostname.includes('pooler.supabase.com') ? 'Connection Pooler ✅' : 'Direct Connection ⚠️');
console.log('');

if (hostname.includes('pooler.supabase.com')) {
  console.log('✅ You are already using Connection Pooler!');
  console.log('   This should work on Windows.');
  console.log('');
  console.log('If connection still fails, check:');
  console.log('  1. Password is correct');
  console.log('  2. Project is active in Supabase');
  console.log('  3. IP restrictions in Supabase dashboard');
} else if (hostname.includes('db.') && hostname.includes('.supabase.co')) {
  console.log('⚠️  You are using Direct connection format');
  console.log('   This format has IPv6 connectivity issues on Windows.');
  console.log('');
  console.log('📋 SOLUTION: Switch to Connection Pooler');
  console.log('');
  console.log('Step 1: Get Connection Pooler String');
  console.log('  1. Go to: https://supabase.com/dashboard');
  console.log('  2. Your Project → Settings → Database');
  console.log('  3. Under "Connection string", click "Session" tab');
  console.log('  4. Copy the connection string');
  console.log('');
  console.log('Step 2: Update .env File');
  console.log('  Replace your DATABASE_URL with the Session pooler connection string');
  console.log('');
  console.log('The new connection string will look like:');
  console.log('  postgresql://postgres.ipvwbkpsusclfoovngid:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres');
  console.log('');
  console.log('💡 Note: Make sure to keep your password the same');
  console.log('   (URL-encode special characters if needed)');
  console.log('');
  console.log('Step 3: Test Connection');
  console.log('  npm run db:test');
} else {
  console.log('❓ Unknown connection format');
  console.log('   Hostname:', hostname);
}

