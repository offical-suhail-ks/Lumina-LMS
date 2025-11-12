/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

async function checkCalendarTable() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_platform',
    allowPublicKeyRetrieval: true,
  };

  let conn;
  try {
    conn = await mariadb.createConnection(config);
    console.log('✅ Connected to database\n');

    // Check calendar_events table structure
    console.log('📋 Calendar Events table structure:');
    const columns = await conn.query('DESCRIBE calendar_events');
    for (const col of columns) {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }

    // Check existing events
    const events = await conn.query('SELECT * FROM calendar_events');
    console.log(`\n📅 Found ${events.length} events in database`);
    if (events.length > 0) {
      console.log('Events:');
      events.forEach(event => {
        console.log(`  - ${event.title} on ${event.event_date}`);
      });
    }

    // Test insert
    console.log('\n🧪 Testing insert...');
    const testId = `test-event-${Date.now()}`;
    await conn.query(
      'INSERT INTO calendar_events (id, title, description, event_date, event_time, assignment_id) VALUES (?, ?, ?, ?, ?, ?)',
      [testId, 'Test Event', 'This is a test', '2025-11-15', '10:00:00', null]
    );
    console.log('✅ Test insert successful');

    // Clean up test
    await conn.query('DELETE FROM calendar_events WHERE id = ?', [testId]);
    console.log('✅ Test event deleted');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
  } finally {
    if (conn) await conn.end();
  }
}

checkCalendarTable();

