-- ============================================
-- Course Modules Database Queries
-- ============================================

-- ============================================
-- TABLE CREATION (if not already created)
-- ============================================

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  duration_hours DECIMAL(5,2) NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course (course_id),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Module materials table
CREATE TABLE IF NOT EXISTS module_materials (
  id VARCHAR(255) PRIMARY KEY,
  module_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  file_size BIGINT NULL,
  file_type VARCHAR(100) NULL,
  uploaded_by VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SELECT QUERIES
-- ============================================

-- Get all modules for a specific course (ordered by order_index)
SELECT 
  m.id, 
  m.course_id as courseId, 
  m.title, 
  m.description, 
  m.duration_hours as durationHours, 
  m.order_index as orderIndex,
  m.created_at as createdAt, 
  m.updated_at as updatedAt
FROM course_modules m
WHERE m.course_id = ?
ORDER BY m.order_index ASC, m.created_at ASC;

-- Get a single module by ID
SELECT 
  m.id, 
  m.course_id as courseId, 
  m.title, 
  m.description, 
  m.duration_hours as durationHours, 
  m.order_index as orderIndex,
  m.created_at as createdAt, 
  m.updated_at as updatedAt
FROM course_modules m
WHERE m.id = ?;

-- Get all modules with their course information
SELECT 
  m.id, 
  m.course_id, 
  m.title as module_title,
  m.description as module_description,
  m.duration_hours,
  m.order_index,
  c.title as course_title,
  c.instructor
FROM course_modules m
INNER JOIN courses c ON m.course_id = c.id
ORDER BY c.title, m.order_index;

-- Get all materials for a specific module
SELECT 
  mat.id, 
  mat.module_id as moduleId, 
  mat.title, 
  mat.file_name as fileName,
  mat.file_path as filePath, 
  mat.file_size as fileSize, 
  mat.file_type as fileType,
  mat.uploaded_by as uploadedBy, 
  mat.created_at as createdAt
FROM module_materials mat
WHERE mat.module_id = ?
ORDER BY mat.created_at ASC;

-- Get all modules with their materials count
SELECT 
  m.id,
  m.course_id,
  m.title,
  m.description,
  m.duration_hours,
  m.order_index,
  COUNT(mat.id) as materials_count
FROM course_modules m
LEFT JOIN module_materials mat ON m.id = mat.module_id
WHERE m.course_id = ?
GROUP BY m.id
ORDER BY m.order_index ASC;

-- Get modules with all their materials (nested)
SELECT 
  m.id as module_id,
  m.title as module_title,
  m.description as module_description,
  m.duration_hours,
  m.order_index,
  mat.id as material_id,
  mat.title as material_title,
  mat.file_name,
  mat.file_path,
  mat.file_size,
  mat.file_type,
  mat.uploaded_by,
  mat.created_at as material_created_at
FROM course_modules m
LEFT JOIN module_materials mat ON m.id = mat.module_id
WHERE m.course_id = ?
ORDER BY m.order_index ASC, mat.created_at ASC;

-- Get total duration of all modules in a course
SELECT 
  c.id as course_id,
  c.title as course_title,
  COUNT(m.id) as total_modules,
  COALESCE(SUM(m.duration_hours), 0) as total_duration_hours
FROM courses c
LEFT JOIN course_modules m ON c.id = m.course_id
WHERE c.id = ?
GROUP BY c.id, c.title;

-- ============================================
-- INSERT QUERIES
-- ============================================

-- Create a new module
INSERT INTO course_modules (
  id, 
  course_id, 
  title, 
  description, 
  duration_hours, 
  order_index
) VALUES (?, ?, ?, ?, ?, ?);

-- Add a material to a module
INSERT INTO module_materials (
  id, 
  module_id, 
  title, 
  file_name, 
  file_path, 
  file_size, 
  file_type, 
  uploaded_by
) VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- ============================================
-- UPDATE QUERIES
-- ============================================

-- Update a module
UPDATE course_modules SET
  title = COALESCE(?, title),
  description = ?,
  duration_hours = ?,
  order_index = COALESCE(?, order_index),
  updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- Update module order
UPDATE course_modules SET
  order_index = ?
WHERE id = ?;

-- Update material information
UPDATE module_materials SET
  title = COALESCE(?, title),
  file_name = COALESCE(?, file_name),
  file_path = COALESCE(?, file_path),
  file_size = COALESCE(?, file_size),
  file_type = COALESCE(?, file_type)
WHERE id = ?;

-- ============================================
-- DELETE QUERIES
-- ============================================

-- Delete a module (will cascade delete all materials)
DELETE FROM course_modules WHERE id = ?;

-- Delete a specific material
DELETE FROM module_materials WHERE id = ?;

-- Delete all materials for a module
DELETE FROM module_materials WHERE module_id = ?;

-- ============================================
-- USEFUL ANALYTICS QUERIES
-- ============================================

-- Get course statistics including modules
SELECT 
  c.id,
  c.title,
  c.instructor,
  COUNT(DISTINCT m.id) as total_modules,
  COUNT(DISTINCT mat.id) as total_materials,
  COALESCE(SUM(m.duration_hours), 0) as total_duration_hours,
  COALESCE(SUM(mat.file_size), 0) as total_storage_bytes
FROM courses c
LEFT JOIN course_modules m ON c.id = m.course_id
LEFT JOIN module_materials mat ON m.id = mat.module_id
WHERE c.id = ?
GROUP BY c.id, c.title, c.instructor;

-- Get modules with most materials
SELECT 
  m.id,
  m.title,
  m.course_id,
  c.title as course_title,
  COUNT(mat.id) as materials_count
FROM course_modules m
INNER JOIN courses c ON m.course_id = c.id
LEFT JOIN module_materials mat ON m.id = mat.module_id
GROUP BY m.id, m.title, m.course_id, c.title
ORDER BY materials_count DESC
LIMIT 10;

-- Get recently added modules
SELECT 
  m.id,
  m.title,
  m.course_id,
  c.title as course_title,
  m.created_at
FROM course_modules m
INNER JOIN courses c ON m.course_id = c.id
ORDER BY m.created_at DESC
LIMIT 10;

-- Get recently uploaded materials
SELECT 
  mat.id,
  mat.title,
  mat.file_name,
  mat.file_size,
  mat.uploaded_by,
  mat.created_at,
  m.title as module_title,
  c.title as course_title
FROM module_materials mat
INNER JOIN course_modules m ON mat.module_id = m.id
INNER JOIN courses c ON m.course_id = c.id
ORDER BY mat.created_at DESC
LIMIT 20;

-- ============================================
-- SEARCH QUERIES
-- ============================================

-- Search modules by title
SELECT 
  m.id,
  m.title,
  m.description,
  m.duration_hours,
  m.order_index,
  c.title as course_title
FROM course_modules m
INNER JOIN courses c ON m.course_id = c.id
WHERE m.title LIKE ? OR m.description LIKE ?
ORDER BY m.order_index;

-- Search materials by title or filename
SELECT 
  mat.id,
  mat.title,
  mat.file_name,
  mat.file_size,
  mat.file_type,
  m.title as module_title,
  c.title as course_title
FROM module_materials mat
INNER JOIN course_modules m ON mat.module_id = m.id
INNER JOIN courses c ON m.course_id = c.id
WHERE mat.title LIKE ? OR mat.file_name LIKE ?
ORDER BY mat.created_at DESC;

-- ============================================
-- EXAMPLE USAGE
-- ============================================

-- Example: Get all modules for course 'course-123' with their materials
-- Replace 'course-123' with actual course ID
SELECT 
  m.id as module_id,
  m.title as module_title,
  m.description as module_description,
  m.duration_hours,
  m.order_index,
  mat.id as material_id,
  mat.title as material_title,
  mat.file_name,
  mat.file_path,
  mat.file_size,
  mat.file_type
FROM course_modules m
LEFT JOIN module_materials mat ON m.id = mat.module_id
WHERE m.course_id = 'course-123'
ORDER BY m.order_index ASC, mat.created_at ASC;

