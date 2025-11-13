-- ============================================
-- Migration: Add Attendance System
-- ============================================

-- Add batch timing and class schedule to students table
ALTER TABLE students 
ADD COLUMN batch_timing ENUM('morning', 'afternoon', 'regular') NULL AFTER cohort,
ADD COLUMN class_schedule ENUM('daily', 'weekend', 'mwf', 'tts') NULL AFTER batch_timing;

-- Create attendance table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create class schedules table (to track which days have classes)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

