/* eslint-env node */

/**
 * This script helps diagnose Supabase connection issues
 * The most common cause is a paused project
 */

console.log('🔍 Supabase Connection Diagnostic\n');
console.log('Based on the DNS resolution test:');
console.log('  ✓ Hostname resolves (nslookup works)');
console.log('  ✗ Node.js cannot resolve (ENOTFOUND error)');
console.log('');
console.log('This pattern typically indicates:');
console.log('  1. ⚠️  Your Supabase project is PAUSED');
console.log('  2. Node.js DNS resolution issue');
console.log('  3. Network/firewall blocking Node.js');
console.log('');
console.log('📋 ACTION REQUIRED:');
console.log('');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Check your project status:');
console.log('   - If it shows "Paused" → Click "Restore" or "Resume"');
console.log('   - Wait 2-3 minutes for the project to fully start');
console.log('3. Verify the connection string:');
console.log('   - Settings → Database → Connection string → URI tab');
console.log('   - Make sure you\'re using "Direct connection"');
console.log('4. Check IP restrictions:');
console.log('   - Settings → Database → Network Restrictions');
console.log('   - Make sure your IP is allowed (or disable temporarily)');
console.log('');
console.log('🔄 After restoring the project, run:');
console.log('   npm run db:test');
console.log('');
console.log('💡 Alternative: Try Connection Pooling');
console.log('   If Direct connection doesn\'t work, try Session or Transaction pooler');
console.log('   from the same Connection string section in Supabase dashboard');

