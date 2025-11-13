-- ============================================
-- Migration: Add All Missing Features
-- ============================================

-- ============================================
-- QUIZ/EXAM SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  quiz_type ENUM('quiz', 'exam', 'assignment') DEFAULT 'quiz',
  time_limit INT NULL COMMENT 'Time limit in minutes',
  total_points DECIMAL(10,2) DEFAULT 0,
  passing_score DECIMAL(5,2) NULL COMMENT 'Passing percentage',
  allow_retake BOOLEAN DEFAULT FALSE,
  max_attempts INT DEFAULT 1,
  shuffle_questions BOOLEAN DEFAULT FALSE,
  show_results BOOLEAN DEFAULT TRUE,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course (course_id),
  INDEX idx_created_by (created_by),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') NOT NULL,
  points DECIMAL(10,2) DEFAULT 1,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quiz (quiz_id),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quiz_question_options (
  id VARCHAR(255) PRIMARY KEY,
  question_id VARCHAR(255) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(255) PRIMARY KEY,
  quiz_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  attempt_number INT DEFAULT 1,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  time_taken INT NULL COMMENT 'Time taken in seconds',
  score DECIMAL(10,2) NULL,
  percentage DECIMAL(5,2) NULL,
  passed BOOLEAN NULL,
  status ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
  INDEX idx_quiz (quiz_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quiz_answers (
  id VARCHAR(255) PRIMARY KEY,
  attempt_id VARCHAR(255) NOT NULL,
  question_id VARCHAR(255) NOT NULL,
  answer_text TEXT NULL,
  selected_options TEXT NULL COMMENT 'JSON array of option IDs',
  points_earned DECIMAL(10,2) DEFAULT 0,
  is_correct BOOLEAN NULL,
  graded_at TIMESTAMP NULL,
  graded_by VARCHAR(255) NULL,
  INDEX idx_attempt (attempt_id),
  INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DISCUSSION FORUMS
-- ============================================
CREATE TABLE IF NOT EXISTS forum_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  course_id VARCHAR(255) NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_threads (
  id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255) NOT NULL,
  course_id VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role ENUM('admin', 'faculty', 'student', 'parent') NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_reply_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_course (course_id),
  INDEX idx_author (author_id),
  INDEX idx_pinned (is_pinned),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_replies (
  id VARCHAR(255) PRIMARY KEY,
  thread_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role ENUM('admin', 'faculty', 'student', 'parent') NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_thread (thread_id),
  INDEX idx_author (author_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CERTIFICATES
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(255) PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
  course_id VARCHAR(255) NULL,
  certificate_type ENUM('course_completion', 'achievement', 'participation') DEFAULT 'course_completion',
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  issued_date DATE NOT NULL,
  certificate_number VARCHAR(255) UNIQUE NOT NULL,
  verification_code VARCHAR(255) UNIQUE NOT NULL,
  issued_by VARCHAR(255) NOT NULL,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_certificate_number (certificate_number),
  INDEX idx_verification_code (verification_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_type ENUM('user', 'student') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'message') DEFAULT 'info',
  link VARCHAR(500) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_type),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ACTIVITY LOGS / AUDIT TRAIL
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_type ENUM('user', 'student') NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(255) NULL,
  description TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_type),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIDEO/AUDIO CONTENT
-- ============================================
CREATE TABLE IF NOT EXISTS course_videos (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  module_id VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  video_url VARCHAR(500) NULL,
  video_type ENUM('youtube', 'vimeo', 'upload', 'embed') NULL,
  duration INT NULL COMMENT 'Duration in seconds',
  thumbnail_url VARCHAR(500) NULL,
  order_index INT DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course (course_id),
  INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_progress (
  id VARCHAR(255) PRIMARY KEY,
  video_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  watched_duration INT DEFAULT 0 COMMENT 'Watched duration in seconds',
  is_completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_video_student (video_id, student_id),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANALYTICS / STATISTICS
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) NULL,
  user_type ENUM('user', 'student') NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(255) NULL,
  metadata TEXT NULL COMMENT 'JSON data',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_user (user_id, user_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ACHIEVEMENTS / BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  icon_url VARCHAR(500) NULL,
  points INT DEFAULT 0,
  achievement_type ENUM('course_completion', 'assignment', 'quiz', 'attendance', 'participation', 'custom') DEFAULT 'custom',
  criteria TEXT NULL COMMENT 'JSON criteria',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_achievements (
  id VARCHAR(255) PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
  achievement_id VARCHAR(255) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_achievement (student_id, achievement_id),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

