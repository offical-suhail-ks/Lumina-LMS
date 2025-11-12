/* eslint-env node */

const { query } = require('../src/db');

async function migrateDatabase() {
  try {
    console.log('Creating payments table...');

    // Check if payments table exists
    const tables = await query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments'`
    );

    if (tables && tables.length > 0) {
      // Check if table has the correct structure (check for 'id' column)
      const columns = await query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments' AND COLUMN_NAME = 'id'`
      );

      if (columns && columns.length > 0) {
        console.log('Payments table already exists with correct structure. Migration not needed.');
        return;
      }

      // Table exists but has wrong structure - drop and recreate
      console.log('Payments table exists but has incorrect structure. Dropping and recreating...');
      await query('DROP TABLE IF EXISTS payments');
    }

    // Create payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        student_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        installment_number INT NULL,
        total_installments INT NULL,
        payment_method VARCHAR(50) DEFAULT 'card',
        payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(255) NULL,
        payment_gateway VARCHAR(50) DEFAULT 'mock',
        notes TEXT NULL,
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_status (payment_status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✓ Payments table created successfully!');
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

