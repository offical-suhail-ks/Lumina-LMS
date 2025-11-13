-- Add missing columns to assignment_submissions table
ALTER TABLE assignment_submissions
ADD COLUMN IF NOT EXISTS grade DECIMAL(5,2) NULL,
ADD COLUMN IF NOT EXISTS feedback TEXT NULL,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS graded_by VARCHAR(255) NULL;

-- Add index on grade column
CREATE INDEX IF NOT EXISTS idx_grade ON assignment_submissions(grade);

