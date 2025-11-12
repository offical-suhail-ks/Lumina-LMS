-- Migration: Add total_years column to courses table
-- Run this if your courses table doesn't have the total_years column

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS total_years INT NULL
AFTER end_date;

-- Verify the column was added
-- DESCRIBE courses;

