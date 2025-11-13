/* eslint-env node */

require('dotenv').config();
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'lms_platform';

async function migrateAttendance() {
  let conn;
  try {
    console.log('🔌 Connecting to MariaDB...');
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      allowPublicKeyRetrieval: true,
    });

    console.log('✅ Connected\n');

    // Check if columns already exist
    console.log('🔍 Checking if migration is needed...');
    const columns = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME IN ('batch_timing', 'class_schedule')
    `, [DB_NAME]);

    const existingColumns = (columns || []).map(c => c.COLUMN_NAME);

    if (existingColumns.includes('batch_timing') && existingColumns.includes('class_schedule')) {
      console.log('⚠️  Columns batch_timing and class_schedule already exist. Skipping...\n');
    } else {
      console.log('📝 Adding batch_timing and class_schedule to students table...\n');
      
      if (!existingColumns.includes('batch_timing')) {
        try {
          await conn.query(`
            ALTER TABLE students 
            ADD COLUMN batch_timing ENUM('morning', 'afternoon', 'regular') NULL AFTER cohort
          `);
          console.log('   ✅ Added batch_timing');
        } catch (error) {
          if (error.message.includes('Duplicate column')) {
            console.log('   ⚠️  batch_timing already exists');
          } else {
            throw error;
          }
        }
      }

      if (!existingColumns.includes('class_schedule')) {
        try {
          await conn.query(`
            ALTER TABLE students 
            ADD COLUMN class_schedule ENUM('daily', 'weekend', 'mwf', 'tts') NULL AFTER batch_timing
          `);
          console.log('   ✅ Added class_schedule');
        } catch (error) {
          if (error.message.includes('Duplicate column')) {
            console.log('   ⚠️  class_schedule already exists');
          } else {
            throw error;
          }
        }
      }
    }

    // Check if attendance table exists
    const tables = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'attendance'
    `, [DB_NAME]);

    if (!tables || tables.length === 0) {
      console.log('📝 Creating attendance table...\n');
      await conn.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id VARCHAR(255) PRIMARY KEY,
          student_id VARCHAR(255) NOT NULL,
          faculty_id VARCHAR(255) NOT NULL,
          attendance_date DATE NOT NULL,
          status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
          notes TEXT NULL,
          marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_student_date (student_id, attendance_date),
          INDEX idx_student (student_id),
          INDEX idx_faculty (faculty_id),
          INDEX idx_date (attendance_date),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ Created attendance table');
    } else {
      console.log('   ✓ attendance table already exists');
    }

    // Check if class_schedules table exists
    const scheduleTables = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'class_schedules'
    `, [DB_NAME]);

    if (!scheduleTables || scheduleTables.length === 0) {
      console.log('📝 Creating class_schedules table...\n');
      await conn.query(`
        CREATE TABLE IF NOT EXISTS class_schedules (
          id VARCHAR(255) PRIMARY KEY,
          student_id VARCHAR(255) NOT NULL,
          schedule_type ENUM('daily', 'weekend', 'mwf', 'tts') NOT NULL,
          batch_timing ENUM('morning', 'afternoon', 'regular') NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          INDEX idx_student (student_id),
          INDEX idx_schedule_type (schedule_type),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ Created class_schedules table');
    } else {
      console.log('   ✓ class_schedules table already exists');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrateAttendance();

