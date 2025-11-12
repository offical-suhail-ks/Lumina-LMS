/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lms_db',
  connectionLimit: 5,
});

async function migrateDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to database. Starting migration...');

    const columns = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students'
    `);
    
    const existingColumns = Array.isArray(columns) ? columns.map(c => c.COLUMN_NAME) : [];
    const columnsToAdd = [];

    if (!existingColumns.includes('phone')) {
      columnsToAdd.push('ADD COLUMN phone VARCHAR(50) NULL AFTER password');
    }
    if (!existingColumns.includes('date_of_birth')) {
      columnsToAdd.push('ADD COLUMN date_of_birth DATE NULL AFTER phone');
    }
    if (!existingColumns.includes('address')) {
      columnsToAdd.push('ADD COLUMN address TEXT NULL AFTER date_of_birth');
    }
    if (!existingColumns.includes('city')) {
      columnsToAdd.push('ADD COLUMN city VARCHAR(255) NULL AFTER address');
    }
    if (!existingColumns.includes('state')) {
      columnsToAdd.push('ADD COLUMN state VARCHAR(255) NULL AFTER city');
    }
    if (!existingColumns.includes('country')) {
      columnsToAdd.push('ADD COLUMN country VARCHAR(255) NULL AFTER state');
    }
    if (!existingColumns.includes('postal_code')) {
      columnsToAdd.push('ADD COLUMN postal_code VARCHAR(20) NULL AFTER country');
    }
    if (!existingColumns.includes('course_fee')) {
      columnsToAdd.push('ADD COLUMN course_fee DECIMAL(10,2) NULL AFTER cohort');
    }
    if (!existingColumns.includes('payment_plan')) {
      columnsToAdd.push('ADD COLUMN payment_plan ENUM(\'full\', \'installment\', \'scholarship\', \'waived\') NULL AFTER course_fee');
    }
    if (!existingColumns.includes('payment_plan_details')) {
      columnsToAdd.push('ADD COLUMN payment_plan_details TEXT NULL AFTER payment_plan');
    }
    if (!existingColumns.includes('offer_letter_sent')) {
      columnsToAdd.push('ADD COLUMN offer_letter_sent BOOLEAN DEFAULT FALSE AFTER payment_plan_details');
    }
    if (!existingColumns.includes('offer_letter_sent_at')) {
      columnsToAdd.push('ADD COLUMN offer_letter_sent_at TIMESTAMP NULL AFTER offer_letter_sent');
    }

    if (columnsToAdd.length > 0) {
      console.log(`Adding ${columnsToAdd.length} new columns...`);
      await conn.query(`ALTER TABLE students ${columnsToAdd.join(', ')}`);
      console.log('Migration completed successfully!');
    } else {
      console.log('All columns already exist. Migration not needed.');
    }

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
}

migrateDatabase()
  .then(() => {
    console.log('Database migration completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

