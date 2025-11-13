-- Feature flags table for admin to control visibility of features
CREATE TABLE IF NOT EXISTS feature_flags (
  id VARCHAR(255) PRIMARY KEY,
  feature_key VARCHAR(255) UNIQUE NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  role_restrictions JSON NULL COMMENT 'JSON array of roles that can access this feature. NULL means all roles.',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feature_key (feature_key),
  INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default feature flags
INSERT INTO feature_flags (id, feature_key, feature_name, description, is_enabled) VALUES
('flag-onboarding-tour', 'onboarding_tour', 'Onboarding Tour', 'Interactive tour to help users learn the platform', TRUE),
('flag-video-upload', 'video_upload', 'Video Upload', 'Allow users to upload videos', TRUE),
('flag-quiz-creation', 'quiz_creation', 'Quiz Creation', 'Allow creation of quizzes and exams', TRUE),
('flag-forum-creation', 'forum_creation', 'Forum Creation', 'Allow users to create forum threads', TRUE),
('flag-certificate-creation', 'certificate_creation', 'Certificate Creation', 'Allow creation of certificates', TRUE),
('flag-assignment-upload', 'assignment_upload', 'Assignment Upload', 'Allow students to upload assignments', TRUE),
('flag-analytics-view', 'analytics_view', 'Analytics View', 'Allow users to view analytics', TRUE),
('flag-achievements', 'achievements', 'Achievements', 'Show achievements and badges', TRUE)
ON DUPLICATE KEY UPDATE feature_name=VALUES(feature_name), description=VALUES(description);

