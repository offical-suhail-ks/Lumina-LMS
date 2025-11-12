/* eslint-env node */

const { query } = require('../src/db');

async function migrateAddDepartments() {
  try {
    console.log('Adding department columns to courses and users tables...');

    // Check if courses.department exists
    const courseColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'courses' 
      AND COLUMN_NAME = 'department'
    `);

    if (courseColumns && courseColumns.length === 0) {
      console.log('Adding department column to courses table...');
      await query(`
        ALTER TABLE courses
        ADD COLUMN department VARCHAR(255) NULL
        AFTER instructor
      `);
      console.log('✓ Added department column to courses table.');
    } else {
      console.log('✓ Column department already exists in courses table.');
    }

    // Check if users.department exists
    const userColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'department'
    `);

    if (userColumns && userColumns.length === 0) {
      console.log('Adding department column to users table...');
      await query(`
        ALTER TABLE users
        ADD COLUMN department VARCHAR(255) NULL
        AFTER role
      `);
      console.log('✓ Added department column to users table.');
    } else {
      console.log('✓ Column department already exists in users table.');
    }

    // Add indexes
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department)`);
      console.log('✓ Added index on courses.department');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
      console.log('✓ Index on courses.department already exists');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_users_department ON users(department)`);
      console.log('✓ Added index on users.department');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
      console.log('✓ Index on users.department already exists');
    }

    console.log('✓ Migration completed successfully.');
  } catch (error) {
    console.error('Error adding department columns:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateAddDepartments()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateAddDepartments;

