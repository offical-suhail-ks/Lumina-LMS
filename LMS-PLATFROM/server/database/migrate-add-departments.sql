-- Migration: Add department columns to courses and users tables
-- Run this to add department support

-- Add department column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL
AFTER instructor;

-- Add department column to users table (for faculty)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS department VARCHAR(255) NULL
AFTER role;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Verify the columns were added
-- DESCRIBE courses;
-- DESCRIBE users;

