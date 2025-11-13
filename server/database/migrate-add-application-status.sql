-- ============================================
-- Migration: Add Application Status and Remarks
-- ============================================

-- Add application_status to students table
ALTER TABLE students 
ADD COLUMN application_status ENUM('pending', 'fee_setup_pending', 'fee_setup_completed', 'under_review', 'accepted', 'rejected') DEFAULT 'pending' AFTER status;

-- Add admin_remarks to accounting_tasks table
ALTER TABLE accounting_tasks 
ADD COLUMN admin_remarks TEXT NULL AFTER notes;

-- Add accounting_remarks to accounting_tasks table
ALTER TABLE accounting_tasks 
ADD COLUMN accounting_remarks TEXT NULL AFTER admin_remarks;

-- Add reviewed_by and reviewed_at to accounting_tasks
ALTER TABLE accounting_tasks 
ADD COLUMN reviewed_by VARCHAR(255) NULL AFTER completed_by,
ADD COLUMN reviewed_at TIMESTAMP NULL AFTER completed_at;

-- Add index for application_status
ALTER TABLE students 
ADD INDEX idx_application_status (application_status);

