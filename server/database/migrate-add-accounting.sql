-- ============================================
-- Migration: Add Accounting Team Support
-- ============================================

-- Add 'accounting' role to users table
ALTER TABLE users MODIFY role ENUM('admin', 'faculty', 'student', 'parent', 'accounting') NOT NULL;

-- ============================================
-- ACCOUNTING TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_tasks (
  id VARCHAR(255) PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
  task_type ENUM('fee_setup', 'fee_update', 'payment_verification', 'refund', 'other') DEFAULT 'fee_setup',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  assigned_to VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  student_data JSON NULL,
  fee_details JSON NULL,
  notes TEXT NULL,
  completed_at TIMESTAMP NULL,
  completed_by VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_task_type (task_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALARY MANAGEMENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS salaries (
  id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  employee_type ENUM('faculty', 'staff', 'admin') NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0.00,
  deductions DECIMAL(10,2) DEFAULT 0.00,
  net_salary DECIMAL(10,2) NOT NULL,
  payment_frequency ENUM('monthly', 'biweekly', 'weekly') DEFAULT 'monthly',
  bank_account VARCHAR(255) NULL,
  bank_name VARCHAR(255) NULL,
  tax_id VARCHAR(100) NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  notes TEXT NULL,
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_employee (employee_id),
  INDEX idx_status (status),
  INDEX idx_employee_type (employee_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALARY PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS salary_payments (
  id VARCHAR(255) PRIMARY KEY,
  salary_id VARCHAR(255) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('bank_transfer', 'check', 'cash', 'other') DEFAULT 'bank_transfer',
  transaction_reference VARCHAR(255) NULL,
  status ENUM('pending', 'processed', 'failed', 'cancelled') DEFAULT 'pending',
  processed_at TIMESTAMP NULL,
  processed_by VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_salary (salary_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

