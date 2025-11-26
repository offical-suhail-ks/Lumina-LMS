-- LMS Platform Database Schema
-- PostgreSQL Compatible Version

-- Create ENUM types for PostgreSQL
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'student', 'parent', 'accounting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_plan_type AS ENUM ('full', 'installment', 'scholarship', 'waived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (for admin, faculty, etc.)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- Courses table (must be created before students due to foreign key)
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  total_years INT,
  capacity INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instructor ON courses(instructor);

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id VARCHAR(255) PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_hours DECIMAL(5,2),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_order ON course_modules(order_index);

-- Module materials table
CREATE TABLE IF NOT EXISTS module_materials (
  id VARCHAR(255) PRIMARY KEY,
  module_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size BIGINT,
  file_type VARCHAR(100),
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_module ON module_materials(module_id);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postal_code VARCHAR(20),
  course_id VARCHAR(255),
  year VARCHAR(50),
  cohort VARCHAR(255),
  status student_status DEFAULT 'active',
  course_fee DECIMAL(10,2),
  payment_plan payment_plan_type,
  payment_plan_details TEXT,
  offer_letter_sent BOOLEAN DEFAULT FALSE,
  offer_letter_sent_at TIMESTAMP,
  guardian_name VARCHAR(255),
  guardian_email VARCHAR(255),
  guardian_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_status ON students(status);

-- Course tags (many-to-many relationship)
CREATE TABLE IF NOT EXISTS course_tags (
  id SERIAL PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (course_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_tag ON course_tags(tag);

-- Course enrollments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id SERIAL PRIMARY KEY,
  course_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student ON course_enrollments(student_id);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_id VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_due_date ON assignments(due_date);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id VARCHAR(255) PRIMARY KEY,
  assignment_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  notes TEXT,
  artifact_name VARCHAR(255),
  grade DECIMAL(5,2),
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submitted_at ON assignment_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_grade ON assignment_submissions(grade);

-- Chat groups table
CREATE TABLE IF NOT EXISTS chat_groups (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_name ON chat_groups(name);

-- Chat group members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS chat_group_members (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user ON chat_group_members(user_id);

-- Chat group messages table
CREATE TABLE IF NOT EXISTS chat_group_messages (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group ON chat_group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON chat_group_messages(created_at);

-- Private chat threads table
CREATE TABLE IF NOT EXISTS private_chat_threads (
  id VARCHAR(255) PRIMARY KEY,
  participant1_id VARCHAR(255) NOT NULL,
  participant2_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_participant1 ON private_chat_threads(participant1_id);
CREATE INDEX IF NOT EXISTS idx_participant2 ON private_chat_threads(participant2_id);

-- Private chat messages table
CREATE TABLE IF NOT EXISTS private_chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  thread_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES private_chat_threads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_thread ON private_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON private_chat_messages(created_at);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  assignment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_assignment ON calendar_events(assignment_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_groups_updated_at BEFORE UPDATE ON chat_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_private_chat_threads_updated_at BEFORE UPDATE ON private_chat_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

