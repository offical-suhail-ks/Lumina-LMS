/* eslint-env node */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use direct connection for initialization
let pool;
async function getPool() {
  if (pool) return pool;
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not found in .env');
  }
  
  const testUrl = url.replace('postgresql://', 'http://');
  const parsed = new URL(testUrl);
  
  pool = new Pool({
    host: parsed.hostname,
    port: parseInt(parsed.port || '5432', 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace('/', '') || 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  
  return pool;
}

async function query(sql, params = []) {
  const poolInstance = await getPool();
  const client = await poolInstance.connect();
  try {
    // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
    let convertedSql = sql;
    if (params && params.length > 0) {
      let paramIndex = 1;
      convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }
    const result = await client.query(convertedSql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    // Test connection
    await query('SELECT 1');
    console.log('✅ Connected to PostgreSQL\n');

    // Read PostgreSQL-compatible schema file
    const schemaPath = path.join(__dirname, 'schema-postgres.sql');
    console.log('📄 Reading PostgreSQL schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL statements properly handling dollar-quoted strings
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';
    
    const lines = schema.split('\n');
    for (const line of lines) {
      // Remove comments
      const commentIndex = line.indexOf('--');
      const cleanLine = commentIndex >= 0 ? line.substring(0, commentIndex) : line;
      
      // Check for dollar-quoted strings
      const dollarQuoteMatch = cleanLine.match(/\$(\w*)\$/g);
      if (dollarQuoteMatch) {
        for (const match of dollarQuoteMatch) {
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarTag = match;
          } else if (match === dollarTag) {
            inDollarQuote = false;
            dollarTag = '';
          }
        }
      }
      
      currentStatement += cleanLine + '\n';
      
      // If we hit a semicolon and we're not in a dollar-quoted string, end the statement
      if (cleanLine.includes(';') && !inDollarQuote) {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0 && 
            !trimmed.toLowerCase().startsWith('create database') &&
            !trimmed.toLowerCase().startsWith('use ') &&
            !trimmed.match(/^--/)) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`🔨 Executing ${statements.length} schema statements...\n`);

    // Execute statements
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          // Extract table name for logging
          const tableMatch = statement.match(/CREATE TABLE.*?(\w+)/i);
          const tableName = tableMatch ? tableMatch[1] : `Statement ${i + 1}`;
          if (i < 10 || i % 5 === 0) {
            console.log(`   ✓ ${tableName}`);
          }
        } catch (error) {
          // Ignore "table already exists" errors
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('relation') ||
              error.message.includes('does not exist')) {
            const preview = statement.substring(0, 60).replace(/\n/g, ' ');
            console.error(`   ✗ Error in statement ${i + 1}: ${preview}...`);
            console.error(`     ${error.message}`);
          }
        }
      }
    }

    console.log('\n✅ Database schema created successfully\n');

    // Insert default admin user if not exists
    console.log('👤 Creating default admin user...');
    try {
      const existingAdmin = await query('SELECT id FROM users WHERE username = $1', ['admin']);
      if (existingAdmin.length === 0) {
        await query(
          'INSERT INTO users (id, username, password, role, name, email) VALUES ($1, $2, $3, $4, $5, $6)',
          ['admin', 'admin', 'admin', 'admin', 'Elena Park', 'admin@lumina.edu']
        );
        console.log('✅ Default admin user created (username: admin, password: admin)');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
    } catch (error) {
      console.error('⚠️  Error creating admin user:', error.message);
      console.error('   You may need to create it manually');
    }

    console.log('\n🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();

