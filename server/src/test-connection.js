/* eslint-env node */

require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');
const { promisify } = require('util');

// Set DNS to prefer IPv4 and use reliable DNS servers
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (err) {
  // Continue with system DNS if setServers fails
}

// DNS resolution function
async function resolveHostname(hostname) {
  try {
    const resolve4 = promisify(dns.resolve4);
    const addresses = await resolve4(hostname);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  } catch (err) {
    try {
      const resolve6 = promisify(dns.resolve6);
      const addresses = await resolve6(hostname);
      if (addresses && addresses.length > 0) {
        return `[${addresses[0]}]`;
      }
    } catch (err6) {
      throw new Error(`DNS resolution failed: ${err.message}`);
    }
  }
  throw new Error(`No IP address found for ${hostname}`);
}

async function testConnection() {
  let poolConfig;
  
  if (process.env.DATABASE_URL) {
    try {
      // Parse connection string
      const url = process.env.DATABASE_URL;
      const testUrl = url.replace('postgresql://', 'http://');
      const parsed = new URL(testUrl);
      const hostname = parsed.hostname;
      
      // Check if it's a Direct connection that might have DNS issues
      const isDirectConnection = hostname.includes('db.') && hostname.includes('.supabase.co');
      
      if (isDirectConnection) {
        console.log('🔌 Testing PostgreSQL connection (using DATABASE_URL)...');
        console.log('   Detected Direct connection - resolving DNS...');
        
        try {
          const resolvedHost = await resolveHostname(hostname);
          console.log(`   ✅ Resolved ${hostname} to ${resolvedHost}`);
          
          poolConfig = {
            host: resolvedHost,
            port: parseInt(parsed.port || '5432', 10),
            user: parsed.username,
            password: parsed.password,
            database: parsed.pathname.replace('/', '') || 'postgres',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 20000,
          };
        } catch (dnsErr) {
          console.log(`   ⚠️  DNS resolution failed: ${dnsErr.message}`);
          console.log('   Trying with hostname directly...');
          
          poolConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 20000,
          };
        }
      } else {
        // Not a Direct connection, use connection string
        console.log('🔌 Testing PostgreSQL connection (using DATABASE_URL)...');
        poolConfig = {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        };
      }
    } catch (err) {
      console.log('🔌 Testing PostgreSQL connection (using DATABASE_URL)...');
      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      };
    }
  } else {
    poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgres',
    };
    console.log('🔌 Testing PostgreSQL connection...');
    console.log(`   Host: ${poolConfig.host}:${poolConfig.port}`);
    console.log(`   User: ${poolConfig.user}`);
    console.log(`   Database: ${poolConfig.database}\n`);
  }

  const pool = new Pool(poolConfig);
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL server\n');

    // Check if database exists (for non-connection-string configs)
    if (!process.env.DATABASE_URL) {
      const dbName = process.env.DB_NAME || 'postgres';
      const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbName]
      );
      
      if (result.rows.length === 0) {
        console.log(`⚠️  Database '${dbName}' does not exist.`);
        console.log('   Run: npm run db:init\n');
      } else {
        console.log(`✅ Database '${dbName}' exists\n`);
      }
    }

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. Run: npm run db:init\n');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables in database\n`);
    }

    console.log('🎉 Connection test successful!');
  } catch (err) {
    console.error('❌ Connection failed!\n');
    console.error('Full error details:');
    console.error('   Message:', err.message);
    if (err.code) {
      console.error(`   Error Code: ${err.code}`);
    }
    if (err.errno) {
      console.error(`   Errno: ${err.errno}`);
    }
    if (err.syscall) {
      console.error(`   Syscall: ${err.syscall}`);
    }
    console.error('');
    
    if (err.code === '28P01') {
      console.error('❌ Authentication failed. Wrong username or password.');
      console.error('   Check your .env file (DB_USER and DB_PASSWORD or DATABASE_URL)');
      console.error('   Make sure your Supabase password is correct in the connection string\n');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('❌ Cannot connect to PostgreSQL server.');
      if (poolConfig.host) {
        console.error(`   Trying to connect to: ${poolConfig.host}:${poolConfig.port}`);
      } else if (process.env.DATABASE_URL) {
        // Try to extract host from connection string for display
        try {
          const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
          console.error(`   Trying to connect to: ${url.hostname}:${url.port || 5432}`);
        } catch (e) {
          console.error('   Using connection string from DATABASE_URL');
        }
      }
      console.error('   Make sure PostgreSQL is running');
      console.error('   Check your network connection');
      console.error('   Verify your Supabase project is active\n');
    } else if (err.code === '3D000') {
      console.error(`❌ Database '${process.env.DB_NAME || 'postgres'}' does not exist.`);
      console.error('   Run: npm run db:init\n');
    } else if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
      console.error('❌ Connection timeout.');
      console.error('   Check your network connection');
      console.error('   Verify your Supabase project is accessible');
      console.error('   Check if your IP is allowed in Supabase dashboard\n');
    } else if (err.message.includes('SSL') || err.code === '23505') {
      console.error('❌ SSL/TLS connection error.');
      console.error('   Supabase requires SSL connections');
      console.error('   SSL is configured, but connection may be blocked');
      console.error('   Check your Supabase project settings\n');
    } else if (err.code === 'ENETUNREACH') {
      console.error('❌ Network unreachable (IPv6 connectivity issue).');
      console.error('');
      console.error('💡 SOLUTION: Use Connection Pooler instead of Direct connection');
      console.error('');
      console.error('   1. Go to: https://supabase.com/dashboard');
      console.error('   2. Your Project → Settings → Database');
      console.error('   3. Under "Connection string", click "Session" tab');
      console.error('   4. Copy that connection string (uses pooler.supabase.com)');
      console.error('   5. Update your .env file with the new connection string');
      console.error('   6. Run: npm run db:test');
      console.error('');
      console.error('   The Connection Pooler uses IPv4 and works on Windows.');
    } else {
      console.error('💡 Troubleshooting:');
      console.error('   1. Verify your DATABASE_URL connection string format:');
      console.error('      postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres');
      console.error('   2. Make sure [PASSWORD] is URL-encoded if it contains special characters');
      console.error('   3. Check your Supabase project is active and accessible');
      console.error('   4. Verify your IP is not blocked in Supabase dashboard');
      console.error('   5. For Direct connection issues on Windows, use Connection Pooler\n');
    }
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

testConnection();

