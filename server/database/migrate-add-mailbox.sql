-- ============================================
-- Migration: Add Mailbox/Message System
-- ============================================

-- Messages table for mailbox system
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role ENUM('admin', 'faculty', 'student', 'parent', 'accounting') NOT NULL,
  recipient_id VARCHAR(255) NULL, -- NULL for broadcast messages
  recipient_role ENUM('admin', 'faculty', 'student', 'parent', 'accounting') NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read_by_sender BOOLEAN DEFAULT TRUE,
  read_by_recipient BOOLEAN DEFAULT FALSE,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,
  is_announcement BOOLEAN DEFAULT FALSE, -- If true, sent to all users or specific role
  announcement_audience ENUM('all', 'students', 'faculty', 'parents') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sender (sender_id),
  INDEX idx_recipient (recipient_id),
  INDEX idx_created_at (created_at),
  INDEX idx_read_by_recipient (read_by_recipient),
  INDEX idx_announcement (is_announcement, announcement_audience)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

