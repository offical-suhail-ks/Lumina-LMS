-- ============================================
-- Create Accounting User
-- ============================================
-- This SQL script creates a default accounting user
-- You can modify the credentials as needed

USE lms_platform;

-- Check if accounting user already exists
SELECT 'Checking for existing accounting user...' AS status;

-- Create accounting user (if not exists)
INSERT INTO users (id, username, password, role, name, email)
SELECT 
  'accounting-1',
  'accounting',
  'accounting',
  'accounting',
  'Accounting Team',
  'accounting@lumina.edu'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'accounting' OR email = 'accounting@lumina.edu'
);

-- Verify creation
SELECT 
  id,
  username,
  role,
  name,
  email,
  created_at
FROM users 
WHERE username = 'accounting' OR email = 'accounting@lumina.edu';

SELECT 'Accounting user created successfully!' AS status;
SELECT 'Login with: Username: accounting, Password: accounting' AS credentials;

