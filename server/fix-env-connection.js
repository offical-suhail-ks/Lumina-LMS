/* eslint-env node */

/**
 * Fix the .env file connection string - remove brackets from region
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('🔧 Fixing .env file connection string...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Check current DATABASE_URL
const urlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (urlMatch) {
  const currentUrl = urlMatch[1].trim();
  console.log('Current DATABASE_URL:');
  console.log('  ' + currentUrl.replace(/:[^:@]+@/, ':****@'));
  console.log('');
  
  // Check if it has brackets around region
  if (currentUrl.includes('[ap-southeast-2]') || currentUrl.includes('aws-0-[')) {
    console.log('⚠️  Found brackets around region - removing them...');
    
    // Remove brackets from region
    const fixedUrl = currentUrl
      .replace('aws-0-[ap-southeast-2]', 'aws-0-ap-southeast-2')
      .replace(/aws-0-\[([^\]]+)\]/g, 'aws-0-$1'); // Generic fix for any region
    
    console.log('Fixed DATABASE_URL:');
    console.log('  ' + fixedUrl.replace(/:[^:@]+@/, ':****@'));
    console.log('');
    
    // Update the .env file
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${fixedUrl}`
    );
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env file updated successfully!');
    console.log('');
    console.log('Now test the connection:');
    console.log('  npm run db:test');
  } else if (currentUrl.includes('pooler.supabase.com')) {
    console.log('✅ Connection string looks correct (uses pooler)');
    console.log('   No brackets found - format is correct');
    console.log('');
    console.log('If connection still fails, the .env might not be reloaded.');
    console.log('Try: npm run db:test');
  } else {
    console.log('⚠️  Still using Direct connection format');
    console.log('   Make sure you copied the Session pooler connection string');
  }
} else {
  console.log('❌ DATABASE_URL not found in .env file');
}

