/* eslint-env node */

const fs = require('node:fs/promises');
const path = require('node:path');
const { query } = require('../src/db');

async function migrateAddTotalYears() {
  try {
    console.log('Checking total_years column in courses table...');
    
    // Check if column already exists
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'courses' 
      AND COLUMN_NAME = 'total_years'
    `);

    if (columns && columns.length > 0) {
      console.log('✓ Column total_years already exists in courses table.');
      return;
    }

    console.log('Adding total_years column to courses table...');

    // Add the column
    await query(`
      ALTER TABLE courses
      ADD COLUMN total_years INT NULL
      AFTER end_date
    `);

    console.log('✓ Successfully added total_years column to courses table.');
  } catch (error) {
    // If column already exists, that's fine
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Column total_years already exists in courses table.');
      return;
    }
    console.error('Error adding total_years column:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateAddTotalYears()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateAddTotalYears;

