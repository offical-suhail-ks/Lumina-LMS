/* eslint-env node */

const { query } = require('../src/db');

async function migrateDatabase() {
  try {
    console.log('Adding fee due date and reminder columns to students table...');

    // Check if fee_due_date column exists
    const feeDueDateColumn = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       AND COLUMN_NAME = 'fee_due_date'`
    );

    if (feeDueDateColumn && feeDueDateColumn.length > 0) {
      console.log('✓ Column fee_due_date already exists.');
    } else {
      await query(`
        ALTER TABLE students
        ADD COLUMN fee_due_date DATE NULL
        AFTER payment_plan_details
      `);
      console.log('✓ Added fee_due_date column to students table.');
    }

    // Check if send_reminder column exists
    const sendReminderColumn = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       AND COLUMN_NAME = 'send_reminder'`
    );

    if (sendReminderColumn && sendReminderColumn.length > 0) {
      console.log('✓ Column send_reminder already exists.');
    } else {
      await query(`
        ALTER TABLE students
        ADD COLUMN send_reminder BOOLEAN DEFAULT TRUE
        AFTER fee_due_date
      `);
      console.log('✓ Added send_reminder column to students table.');
    }

    // Add index for fee_due_date for faster queries
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_fee_due_date ON students(fee_due_date)`);
      console.log('✓ Added index on fee_due_date');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
      console.log('✓ Index on fee_due_date already exists');
    }

    console.log('✓ Migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

migrateDatabase()
  .then(() => {
    console.log('Database migration completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

