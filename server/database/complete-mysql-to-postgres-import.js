/* eslint-env node */

const { query } = require('../src/db');

async function createAllEnums() {
  console.log('📋 Creating ENUM types...');
  
  const enums = [
    { name: 'user_role', values: ['admin', 'faculty', 'student', 'parent', 'accounting'] },
    { name: 'student_status', values: ['active', 'inactive', 'suspended'] },
    { name: 'payment_plan_type', values: ['full', 'installment', 'scholarship', 'waived'] },
    { name: 'task_type_enum', values: ['fee_setup', 'fee_update', 'payment_verification', 'refund', 'other'] },
    { name: 'task_status_enum', values: ['pending', 'in_progress', 'completed', 'cancelled'] },
    { name: 'priority_enum', values: ['low', 'medium', 'high', 'urgent'] },
    { name: 'achievement_type_enum', values: ['course_completion', 'assignment', 'quiz', 'attendance', 'participation', 'custom'] },
    { name: 'user_type_enum', values: ['user', 'student'] },
    { name: 'attendance_status_enum', values: ['present', 'absent', 'late', 'excused'] },
    { name: 'certificate_type_enum', values: ['course_completion', 'achievement', 'participation'] },
    { name: 'schedule_type_enum', values: ['daily', 'weekend', 'mwf', 'tts'] },
    { name: 'batch_timing_enum', values: ['morning', 'afternoon', 'regular'] },
    { name: 'application_status_enum', values: ['pending', 'fee_setup_pending', 'fee_setup_completed', 'under_review', 'accepted', 'rejected'] },
    { name: 'video_type_enum', values: ['youtube', 'vimeo', 'upload', 'embed'] },
    { name: 'forum_role_enum', values: ['admin', 'faculty', 'student', 'parent'] },
    { name: 'message_role_enum', values: ['admin', 'faculty', 'student', 'parent', 'accounting'] },
    { name: 'announcement_audience_enum', values: ['all', 'students', 'faculty', 'parents'] },
    { name: 'notification_type_enum', values: ['info', 'success', 'warning', 'error', 'assignment', 'grade', 'announcement', 'message'] },
    { name: 'payment_status_enum', values: ['pending', 'completed', 'failed', 'refunded'] },
    { name: 'quiz_type_enum', values: ['quiz', 'exam', 'assignment'] },
    { name: 'question_type_enum', values: ['multiple_choice', 'true_false', 'short_answer', 'essay'] },
    { name: 'quiz_status_enum', values: ['in_progress', 'submitted', 'graded'] },
    { name: 'employee_type_enum', values: ['faculty', 'staff', 'admin'] },
    { name: 'payment_frequency_enum', values: ['monthly', 'biweekly', 'weekly'] },
    { name: 'salary_status_enum', values: ['active', 'inactive', 'suspended'] },
    { name: 'salary_payment_method_enum', values: ['bank_transfer', 'check', 'cash', 'other'] },
    { name: 'salary_payment_status_enum', values: ['pending', 'processed', 'failed', 'cancelled'] },
  ];

  for (const enumType of enums) {
    try {
      await query(`
        DO $$ BEGIN
          CREATE TYPE ${enumType.name} AS ENUM (${enumType.values.map(v => `'${v}'`).join(', ')});
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log(`  ✓ ${enumType.name}`);
    } catch (error) {
      if (!error.message.includes('duplicate')) {
        console.log(`  ⚠️  ${enumType.name}: ${error.message}`);
      }
    }
  }
}

async function dropAllTables() {
  console.log('\n🗑️  Dropping existing tables (if any)...');
  
  // Drop tables in reverse dependency order
  const tables = [
    'quiz_answers', 'quiz_question_options', 'quiz_questions', 'quiz_attempts', 'quizzes',
    'salary_payments', 'salaries',
    'student_achievements', 'video_progress',
    'private_chat_messages', 'private_chat_threads',
    'payments', 'password_reset_tokens', 'notifications',
    'module_materials', 'messages',
    'forum_replies', 'forum_threads', 'forum_categories',
    'course_videos', 'course_tags', 'course_enrollments', 'course_modules',
    'class_schedules', 'chat_group_messages', 'chat_group_members', 'chat_groups',
    'certificates', 'calendar_events', 'attendance',
    'assignment_submissions', 'assignments',
    'analytics_events', 'activity_logs', 'achievements',
    'accounting_tasks', 'feature_flags',
    'students', 'courses', 'users'
  ];
  
  for (const table of tables) {
    try {
      await query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`  ✓ Dropped ${table}`);
    } catch (error) {
      // Ignore errors
    }
  }
}

async function createAllTables() {
  console.log('\n📊 Creating tables...');
  
  // Create trigger function for updated_at
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role user_role NOT NULL,
      department VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
  `);
  console.log('  ✓ users');

  // Courses table
  await query(`
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      instructor VARCHAR(255) NOT NULL,
      department VARCHAR(255),
      start_date DATE,
      end_date DATE,
      total_years INT,
      capacity INT DEFAULT 30,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_instructor ON courses(instructor);
    CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
  `);
  console.log('  ✓ courses');

  // Students table
  await query(`
    CREATE TABLE students (
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
      batch_timing batch_timing_enum,
      class_schedule schedule_type_enum,
      course_fee DECIMAL(10,2),
      payment_plan payment_plan_type,
      payment_plan_details TEXT,
      fee_due_date DATE,
      send_reminder BOOLEAN DEFAULT TRUE,
      offer_letter_sent BOOLEAN DEFAULT FALSE,
      offer_letter_sent_at TIMESTAMP,
      status student_status DEFAULT 'active',
      application_status application_status_enum DEFAULT 'pending',
      guardian_name VARCHAR(255),
      guardian_email VARCHAR(255),
      guardian_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_email ON students(email);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_course ON students(course_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_status ON students(status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_fee_due_date ON students(fee_due_date);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_application_status ON students(application_status);`);
  console.log('  ✓ students');

  // Accounting tasks
  await query(`
    CREATE TABLE IF NOT EXISTS accounting_tasks (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      task_type task_type_enum DEFAULT 'fee_setup',
      status task_status_enum DEFAULT 'pending',
      priority priority_enum DEFAULT 'medium',
      assigned_to VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      student_data JSONB,
      fee_details JSONB,
      notes TEXT,
      admin_remarks TEXT,
      accounting_remarks TEXT,
      completed_at TIMESTAMP,
      reviewed_at TIMESTAMP,
      completed_by VARCHAR(255),
      reviewed_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_student ON accounting_tasks(student_id);
    CREATE INDEX IF NOT EXISTS idx_status ON accounting_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_assigned_to ON accounting_tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_task_type ON accounting_tasks(task_type);
    CREATE INDEX IF NOT EXISTS idx_created_at ON accounting_tasks(created_at);
  `);
  console.log('  ✓ accounting_tasks');

  // Feature flags
  await query(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      id VARCHAR(255) PRIMARY KEY,
      feature_key VARCHAR(255) UNIQUE NOT NULL,
      feature_name VARCHAR(255) NOT NULL,
      description TEXT,
      is_enabled BOOLEAN DEFAULT TRUE,
      role_restrictions JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_feature_key ON feature_flags(feature_key);
    CREATE INDEX IF NOT EXISTS idx_is_enabled ON feature_flags(is_enabled);
  `);
  console.log('  ✓ feature_flags');

  // Achievements
  await query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      icon_url VARCHAR(500),
      points INT DEFAULT 0,
      achievement_type achievement_type_enum DEFAULT 'custom',
      criteria TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('  ✓ achievements');

  // Activity logs
  await query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      user_type user_type_enum NOT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id VARCHAR(255),
      description TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user ON activity_logs(user_id, user_type);
    CREATE INDEX IF NOT EXISTS idx_action ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS idx_entity ON activity_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_created ON activity_logs(created_at);
  `);
  console.log('  ✓ activity_logs');

  // Analytics events
  await query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id VARCHAR(255) PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      user_id VARCHAR(255),
      user_type user_type_enum,
      entity_type VARCHAR(100),
      entity_id VARCHAR(255),
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_event_type ON analytics_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_user ON analytics_events(user_id, user_type);
    CREATE INDEX IF NOT EXISTS idx_created ON analytics_events(created_at);
  `);
  console.log('  ✓ analytics_events');

  // Assignments
  await query(`
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
  `);
  console.log('  ✓ assignments');

  // Assignment submissions
  await query(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id VARCHAR(255) PRIMARY KEY,
      assignment_id VARCHAR(255) NOT NULL,
      student_id VARCHAR(255) NOT NULL,
      notes TEXT,
      artifact_name VARCHAR(255),
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      grade DECIMAL(5,2),
      feedback TEXT,
      graded_at TIMESTAMP,
      graded_by VARCHAR(255),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_assignment ON assignment_submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_student ON assignment_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_submitted_at ON assignment_submissions(submitted_at);
    CREATE INDEX IF NOT EXISTS idx_grade ON assignment_submissions(grade);
  `);
  console.log('  ✓ assignment_submissions');

  // Attendance
  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      faculty_id VARCHAR(255) NOT NULL,
      attendance_date DATE NOT NULL,
      status attendance_status_enum DEFAULT 'present',
      notes TEXT,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (student_id, attendance_date)
    );
    CREATE INDEX IF NOT EXISTS idx_student ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_faculty ON attendance(faculty_id);
    CREATE INDEX IF NOT EXISTS idx_date ON attendance(attendance_date);
    CREATE INDEX IF NOT EXISTS idx_status ON attendance(status);
  `);
  console.log('  ✓ attendance');

  // Calendar events
  await query(`
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
  `);
  console.log('  ✓ calendar_events');

  // Certificates
  await query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      course_id VARCHAR(255),
      certificate_type certificate_type_enum DEFAULT 'course_completion',
      title VARCHAR(255) NOT NULL,
      description TEXT,
      issued_date DATE NOT NULL,
      certificate_number VARCHAR(255) UNIQUE NOT NULL,
      verification_code VARCHAR(255) UNIQUE NOT NULL,
      issued_by VARCHAR(255) NOT NULL,
      pdf_path VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_student ON certificates(student_id);
    CREATE INDEX IF NOT EXISTS idx_course ON certificates(course_id);
    CREATE INDEX IF NOT EXISTS idx_certificate_number ON certificates(certificate_number);
    CREATE INDEX IF NOT EXISTS idx_verification_code ON certificates(verification_code);
  `);
  console.log('  ✓ certificates');

  // Chat groups
  await query(`
    CREATE TABLE IF NOT EXISTS chat_groups (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_name ON chat_groups(name);
  `);
  console.log('  ✓ chat_groups');

  // Chat group members
  await query(`
    CREATE TABLE IF NOT EXISTS chat_group_members (
      id SERIAL PRIMARY KEY,
      group_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
      UNIQUE (group_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user ON chat_group_members(user_id);
  `);
  console.log('  ✓ chat_group_members');

  // Chat group messages
  await query(`
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
  `);
  console.log('  ✓ chat_group_messages');

  // Class schedules
  await query(`
    CREATE TABLE IF NOT EXISTS class_schedules (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      schedule_type schedule_type_enum NOT NULL,
      batch_timing batch_timing_enum NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_student ON class_schedules(student_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_type ON class_schedules(schedule_type);
    CREATE INDEX IF NOT EXISTS idx_active ON class_schedules(is_active);
  `);
  console.log('  ✓ class_schedules');

  // Course enrollments
  await query(`
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
  `);
  console.log('  ✓ course_enrollments');

  // Course modules
  await query(`
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
  `);
  console.log('  ✓ course_modules');

  // Course tags
  await query(`
    CREATE TABLE IF NOT EXISTS course_tags (
      id SERIAL PRIMARY KEY,
      course_id VARCHAR(255) NOT NULL,
      tag VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE (course_id, tag)
    );
    CREATE INDEX IF NOT EXISTS idx_tag ON course_tags(tag);
  `);
  console.log('  ✓ course_tags');

  // Course videos
  await query(`
    CREATE TABLE IF NOT EXISTS course_videos (
      id VARCHAR(255) PRIMARY KEY,
      course_id VARCHAR(255) NOT NULL,
      module_id VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url VARCHAR(500),
      video_type video_type_enum,
      duration INT,
      thumbnail_url VARCHAR(500),
      order_index INT DEFAULT 0,
      is_preview BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_course ON course_videos(course_id);
    CREATE INDEX IF NOT EXISTS idx_module ON course_videos(module_id);
  `);
  console.log('  ✓ course_videos');

  // Forum categories
  await query(`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      course_id VARCHAR(255),
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_course ON forum_categories(course_id);
  `);
  console.log('  ✓ forum_categories');

  // Forum replies
  await query(`
    CREATE TABLE IF NOT EXISTS forum_replies (
      id VARCHAR(255) PRIMARY KEY,
      thread_id VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      author_role forum_role_enum NOT NULL,
      is_solution BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_thread ON forum_replies(thread_id);
    CREATE INDEX IF NOT EXISTS idx_author ON forum_replies(author_id);
    CREATE INDEX IF NOT EXISTS idx_created ON forum_replies(created_at);
  `);
  console.log('  ✓ forum_replies');

  // Forum threads
  await query(`
    CREATE TABLE IF NOT EXISTS forum_threads (
      id VARCHAR(255) PRIMARY KEY,
      category_id VARCHAR(255) NOT NULL,
      course_id VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author_id VARCHAR(255) NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      author_role forum_role_enum NOT NULL,
      is_pinned BOOLEAN DEFAULT FALSE,
      is_locked BOOLEAN DEFAULT FALSE,
      views INT DEFAULT 0,
      reply_count INT DEFAULT 0,
      last_reply_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_category ON forum_threads(category_id);
    CREATE INDEX IF NOT EXISTS idx_course ON forum_threads(course_id);
    CREATE INDEX IF NOT EXISTS idx_author ON forum_threads(author_id);
    CREATE INDEX IF NOT EXISTS idx_pinned ON forum_threads(is_pinned);
    CREATE INDEX IF NOT EXISTS idx_created ON forum_threads(created_at);
  `);
  console.log('  ✓ forum_threads');

  // Messages
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      sender_id VARCHAR(255) NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      sender_role message_role_enum NOT NULL,
      recipient_id VARCHAR(255),
      recipient_role message_role_enum,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      read_by_sender BOOLEAN DEFAULT TRUE,
      read_by_recipient BOOLEAN DEFAULT FALSE,
      deleted_by_sender BOOLEAN DEFAULT FALSE,
      deleted_by_recipient BOOLEAN DEFAULT FALSE,
      is_announcement BOOLEAN DEFAULT FALSE,
      announcement_audience announcement_audience_enum,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_recipient ON messages(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_read_by_recipient ON messages(read_by_recipient);
    CREATE INDEX IF NOT EXISTS idx_announcement ON messages(is_announcement, announcement_audience);
  `);
  console.log('  ✓ messages');

  // Module materials
  await query(`
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
  `);
  console.log('  ✓ module_materials');

  // Notifications
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      user_type user_type_enum NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type notification_type_enum DEFAULT 'info',
      link VARCHAR(500),
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user ON notifications(user_id, user_type);
    CREATE INDEX IF NOT EXISTS idx_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_created ON notifications(created_at);
  `);
  console.log('  ✓ notifications');

  // Password reset tokens
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      user_type user_type_enum NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_token ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_user ON password_reset_tokens(user_id, user_type);
    CREATE INDEX IF NOT EXISTS idx_expires_at ON password_reset_tokens(expires_at);
  `);
  console.log('  ✓ password_reset_tokens');

  // Payments
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      installment_number INT,
      total_installments INT,
      payment_method VARCHAR(50) DEFAULT 'card',
      payment_status payment_status_enum DEFAULT 'pending',
      transaction_id VARCHAR(255),
      payment_gateway VARCHAR(50) DEFAULT 'mock',
      notes TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_student ON payments(student_id);
    CREATE INDEX IF NOT EXISTS idx_status ON payments(payment_status);
    CREATE INDEX IF NOT EXISTS idx_created ON payments(created_at);
  `);
  console.log('  ✓ payments');

  // Private chat threads
  await query(`
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
  `);
  console.log('  ✓ private_chat_threads');

  // Private chat messages
  await query(`
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
  `);
  console.log('  ✓ private_chat_messages');

  // Quizzes
  await query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(255) PRIMARY KEY,
      course_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      quiz_type quiz_type_enum DEFAULT 'quiz',
      time_limit INT,
      total_points DECIMAL(10,2) DEFAULT 0.00,
      passing_score DECIMAL(5,2),
      allow_retake BOOLEAN DEFAULT FALSE,
      max_attempts INT DEFAULT 1,
      shuffle_questions BOOLEAN DEFAULT FALSE,
      show_results BOOLEAN DEFAULT TRUE,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_course ON quizzes(course_id);
    CREATE INDEX IF NOT EXISTS idx_created_by ON quizzes(created_by);
    CREATE INDEX IF NOT EXISTS idx_dates ON quizzes(start_date, end_date);
  `);
  console.log('  ✓ quizzes');

  // Quiz attempts
  await query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id VARCHAR(255) PRIMARY KEY,
      quiz_id VARCHAR(255) NOT NULL,
      student_id VARCHAR(255) NOT NULL,
      attempt_number INT DEFAULT 1,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      submitted_at TIMESTAMP,
      time_taken INT,
      score DECIMAL(10,2),
      percentage DECIMAL(5,2),
      passed BOOLEAN,
      status quiz_status_enum DEFAULT 'in_progress'
    );
    CREATE INDEX IF NOT EXISTS idx_quiz ON quiz_attempts(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_student ON quiz_attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_status ON quiz_attempts(status);
  `);
  console.log('  ✓ quiz_attempts');

  // Quiz questions
  await query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id VARCHAR(255) PRIMARY KEY,
      quiz_id VARCHAR(255) NOT NULL,
      question_text TEXT NOT NULL,
      question_type question_type_enum NOT NULL,
      points DECIMAL(10,2) DEFAULT 1.00,
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_quiz ON quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_order ON quiz_questions(order_index);
  `);
  console.log('  ✓ quiz_questions');

  // Quiz question options
  await query(`
    CREATE TABLE IF NOT EXISTS quiz_question_options (
      id VARCHAR(255) PRIMARY KEY,
      question_id VARCHAR(255) NOT NULL,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      order_index INT DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_question ON quiz_question_options(question_id);
  `);
  console.log('  ✓ quiz_question_options');

  // Quiz answers
  await query(`
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id VARCHAR(255) PRIMARY KEY,
      attempt_id VARCHAR(255) NOT NULL,
      question_id VARCHAR(255) NOT NULL,
      answer_text TEXT,
      selected_options TEXT,
      points_earned DECIMAL(10,2) DEFAULT 0.00,
      is_correct BOOLEAN,
      graded_at TIMESTAMP,
      graded_by VARCHAR(255)
    );
    CREATE INDEX IF NOT EXISTS idx_attempt ON quiz_answers(attempt_id);
    CREATE INDEX IF NOT EXISTS idx_question ON quiz_answers(question_id);
  `);
  console.log('  ✓ quiz_answers');

  // Salaries
  await query(`
    CREATE TABLE IF NOT EXISTS salaries (
      id VARCHAR(255) PRIMARY KEY,
      employee_id VARCHAR(255) NOT NULL,
      employee_type employee_type_enum NOT NULL,
      base_salary DECIMAL(10,2) NOT NULL,
      allowances DECIMAL(10,2) DEFAULT 0.00,
      deductions DECIMAL(10,2) DEFAULT 0.00,
      net_salary DECIMAL(10,2) NOT NULL,
      payment_frequency payment_frequency_enum DEFAULT 'monthly',
      bank_account VARCHAR(255),
      bank_name VARCHAR(255),
      tax_id VARCHAR(100),
      start_date DATE NOT NULL,
      end_date DATE,
      status salary_status_enum DEFAULT 'active',
      notes TEXT,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_employee ON salaries(employee_id);
    CREATE INDEX IF NOT EXISTS idx_status ON salaries(status);
    CREATE INDEX IF NOT EXISTS idx_employee_type ON salaries(employee_type);
  `);
  console.log('  ✓ salaries');

  // Salary payments
  await query(`
    CREATE TABLE IF NOT EXISTS salary_payments (
      id VARCHAR(255) PRIMARY KEY,
      salary_id VARCHAR(255) NOT NULL,
      payment_date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method salary_payment_method_enum DEFAULT 'bank_transfer',
      transaction_reference VARCHAR(255),
      status salary_payment_status_enum DEFAULT 'pending',
      processed_at TIMESTAMP,
      processed_by VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_salary ON salary_payments(salary_id);
    CREATE INDEX IF NOT EXISTS idx_payment_date ON salary_payments(payment_date);
    CREATE INDEX IF NOT EXISTS idx_status ON salary_payments(status);
  `);
  console.log('  ✓ salary_payments');

  // Student achievements
  await query(`
    CREATE TABLE IF NOT EXISTS student_achievements (
      id VARCHAR(255) PRIMARY KEY,
      student_id VARCHAR(255) NOT NULL,
      achievement_id VARCHAR(255) NOT NULL,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
      UNIQUE (student_id, achievement_id)
    );
    CREATE INDEX IF NOT EXISTS idx_student ON student_achievements(student_id);
  `);
  console.log('  ✓ student_achievements');

  // Video progress
  await query(`
    CREATE TABLE IF NOT EXISTS video_progress (
      id VARCHAR(255) PRIMARY KEY,
      video_id VARCHAR(255) NOT NULL,
      student_id VARCHAR(255) NOT NULL,
      progress_percentage DECIMAL(5,2) DEFAULT 0.00,
      watched_duration INT DEFAULT 0,
      is_completed BOOLEAN DEFAULT FALSE,
      last_watched_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (video_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_student ON video_progress(student_id);
  `);
  console.log('  ✓ video_progress');

  // Add triggers for updated_at
  const tablesWithUpdatedAt = [
    'users', 'courses', 'students', 'accounting_tasks', 'feature_flags',
    'assignments', 'assignment_submissions', 'attendance', 'calendar_events',
    'chat_groups', 'class_schedules', 'course_modules', 'forum_replies',
    'forum_threads', 'messages', 'payments', 'private_chat_threads',
    'quizzes', 'salaries', 'salary_payments', 'video_progress'
  ];

  for (const table of tablesWithUpdatedAt) {
    try {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    } catch (error) {
      // Ignore errors
    }
  }
}

async function importAllData() {
  console.log('\n📥 Importing data...');

  // Users
  await query(`
    INSERT INTO users (id, username, password, role, department, name, email, created_at, updated_at)
    VALUES 
      ('admin', 'admin', 'admin', 'admin', NULL, 'Elena Park', 'admin@lumina.edu', '2025-11-12 17:43:21', '2025-11-12 17:43:21'),
      ('faculty-1', 'faculty', 'faculty', 'faculty', 'Computing', 'Dr. Sarah Johnson', 'faculty@lumina.edu', '2025-11-12 18:37:14', '2025-11-12 21:12:58'),
      ('accounting-f591895d-555b-4bc1-a2f5-ba2f30e8f41b', 'Suhail', '1234', 'accounting', NULL, 'Suhail', 'mrc03802@gmail.com', '2025-11-13 09:05:35', '2025-11-13 09:05:35')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      password = EXCLUDED.password,
      role = EXCLUDED.role,
      department = EXCLUDED.department,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ users');

  // Courses
  await query(`
    INSERT INTO courses (id, title, description, instructor, department, start_date, end_date, total_years, capacity, created_at, updated_at)
    VALUES ('course-98190f41-3eac-4ec3-8b74-732cee3548be', 'Bsc Cyber Security', 'Testing', 'Cooper', 'Computing', '2025-10-20', '2025-12-20', 4, 30, '2025-11-12 19:00:53', '2025-11-12 21:19:17')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      instructor = EXCLUDED.instructor,
      department = EXCLUDED.department,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      total_years = EXCLUDED.total_years,
      capacity = EXCLUDED.capacity,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ courses');

  // Students
  await query(`
    INSERT INTO students (id, first_name, last_name, email, username, password, phone, date_of_birth, address, city, state, country, postal_code, course_id, year, cohort, batch_timing, class_schedule, course_fee, payment_plan, payment_plan_details, fee_due_date, send_reminder, offer_letter_sent, offer_letter_sent_at, status, application_status, guardian_name, guardian_email, guardian_phone, created_at, updated_at)
    VALUES 
      ('student-410e5d86-7f71-4a3b-9365-159baa0a02bc', 'Mishal', 'K', 'mishalpm367@gmail.com', 'mishalpm367@gmail.com', '1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'course-98190f41-3eac-4ec3-8b74-732cee3548be', '1st Year', NULL, 'morning', 'tts', NULL, NULL, NULL, NULL, TRUE, TRUE, '2025-11-13 09:42:43', 'active', 'accepted', NULL, NULL, NULL, '2025-11-13 09:41:30', '2025-11-13 10:37:36'),
      ('student-f6b5b915-de1b-47e1-9237-bc95c3a3d8f2', 'Mohamed Jamaludeen', 'Mohamed Nijamudeen', 'mohamedjamaludeen777@gmail.com', 'mohamedjamaludeen777@gmail.com', '1234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'course-98190f41-3eac-4ec3-8b74-732cee3548be', '1st Year', NULL, 'morning', 'mwf', 10000.00, 'installment', '"12 installments of $833.33 each, due on the 15th of each month"', NULL, TRUE, TRUE, '2025-11-17 06:54:25', 'active', 'accepted', NULL, NULL, NULL, '2025-11-17 06:53:33', '2025-11-17 06:54:25')
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      password = EXCLUDED.password,
      course_id = EXCLUDED.course_id,
      year = EXCLUDED.year,
      batch_timing = EXCLUDED.batch_timing,
      class_schedule = EXCLUDED.class_schedule,
      course_fee = EXCLUDED.course_fee,
      payment_plan = EXCLUDED.payment_plan,
      payment_plan_details = EXCLUDED.payment_plan_details,
      status = EXCLUDED.status,
      application_status = EXCLUDED.application_status,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ students');

  // Accounting tasks
  await query(`
    INSERT INTO accounting_tasks (id, student_id, task_type, status, priority, assigned_to, title, description, student_data, fee_details, notes, admin_remarks, accounting_remarks, completed_at, reviewed_at, completed_by, reviewed_by, created_at, updated_at)
    VALUES 
      ('task-4b1371b1-7a2a-4383-a09b-cbeccff0f49a', 'student-410e5d86-7f71-4a3b-9365-159baa0a02bc', 'fee_setup', 'completed', 'high', NULL, 'Fee Setup Required: Mishal K', 'New student enrollment requires fee details to be set up. Student: Mishal K (mishalpm367@gmail.com). Course: Bsc Cyber Security', '{"id":"student-410e5d86-7f71-4a3b-9365-159baa0a02bc","firstName":"Mishal","lastName":"K","email":"mishalpm367@gmail.com","username":"mishalpm367@gmail.com","phone":"0521438838","dateOfBirth":null,"address":"Al Mina st","city":null,"state":"Dubai","country":"United Arab Emirates","postalCode":null,"courseId":"course-98190f41-3eac-4ec3-8b74-732cee3548be","year":"1st Year","cohort":null,"status":"active","applicationStatus":"pending","courseFee":null,"paymentPlan":null,"paymentPlanDetails":null,"feeDueDate":null,"sendReminder":1,"createdAt":"2025-11-13T09:41:30.000Z","updatedAt":"2025-11-13T09:41:30.000Z","guardian":null,"password":"1234","course":{"id":"course-98190f41-3eac-4ec3-8b74-732cee3548be","title":"Bsc Cyber Security"}}'::jsonb, '{"courseFee":20000,"paymentPlan":"installment","paymentPlanDetails":"12 installments of $1666.67 each, due on the 14th of each month","feeDueDate":null,"sendReminder":true,"numberOfInstallments":12,"installmentDayOfMonth":14}'::jsonb, NULL, '20% off on fee ', '', '2025-11-13 09:42:43', NULL, NULL, NULL, '2025-11-13 09:41:30', '2025-11-13 09:42:43'),
      ('task-94bfe0c5-99f8-4941-96fa-aac9c458cb8c', 'student-f6b5b915-de1b-47e1-9237-bc95c3a3d8f2', 'fee_setup', 'completed', 'high', NULL, 'Fee Setup Required: Mohamed Jamaludeen Mohamed Nijamudeen', 'New student enrollment requires fee details to be set up. Student: Mohamed Jamaludeen Mohamed Nijamudeen (mohamedjamaludeen777@gmail.com). Course: Bsc Cyber Security', '{"id":"student-f6b5b915-de1b-47e1-9237-bc95c3a3d8f2","firstName":"Mohamed Jamaludeen","lastName":"Mohamed Nijamudeen","email":"mohamedjamaludeen777@gmail.com","username":"mohamedjamaludeen777@gmail.com","phone":null,"dateOfBirth":null,"address":null,"city":null,"state":null,"country":null,"postalCode":null,"courseId":"course-98190f41-3eac-4ec3-8b74-732cee3548be","year":"1st Year","cohort":null,"batchTiming":"morning","classSchedule":"mwf","status":"active","applicationStatus":"pending","courseFee":null,"paymentPlan":null,"paymentPlanDetails":null,"feeDueDate":null,"sendReminder":1,"createdAt":"2025-11-17T06:53:33.000Z","updatedAt":"2025-11-17T06:53:33.000Z","guardian":null,"password":"1234","course":{"id":"course-98190f41-3eac-4ec3-8b74-732cee3548be","title":"Bsc Cyber Security"}}'::jsonb, '{"courseFee":10000,"paymentPlan":"installment","paymentPlanDetails":"12 installments of $833.33 each, due on the 15th of each month","feeDueDate":null,"sendReminder":true,"numberOfInstallments":12,"installmentDayOfMonth":15}'::jsonb, NULL, '', '', '2025-11-17 06:54:25', NULL, NULL, NULL, '2025-11-17 06:53:33', '2025-11-17 06:54:25')
    ON CONFLICT (id) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      task_type = EXCLUDED.task_type,
      status = EXCLUDED.status,
      priority = EXCLUDED.priority,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      student_data = EXCLUDED.student_data,
      fee_details = EXCLUDED.fee_details,
      admin_remarks = EXCLUDED.admin_remarks,
      accounting_remarks = EXCLUDED.accounting_remarks,
      completed_at = EXCLUDED.completed_at,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ accounting_tasks');

  // Feature flags
  await query(`
    INSERT INTO feature_flags (id, feature_key, feature_name, description, is_enabled, role_restrictions, created_at, updated_at)
    VALUES 
      ('flag-achievements', 'achievements', 'Achievements', 'Show achievements and badges', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-analytics-view', 'analytics_view', 'Analytics View', 'Allow users to view analytics', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-assignment-upload', 'assignment_upload', 'Assignment Upload', 'Allow students to upload assignments', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-certificate-creation', 'certificate_creation', 'Certificate Creation', 'Allow creation of certificates', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-forum-creation', 'forum_creation', 'Forum Creation', 'Allow users to create forum threads', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-onboarding-tour', 'onboarding_tour', 'Onboarding Tour', 'Interactive tour to help users learn the platform', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:02:04'),
      ('flag-quiz-creation', 'quiz_creation', 'Quiz Creation', 'Allow creation of quizzes and exams', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13'),
      ('flag-video-upload', 'video_upload', 'Video Upload', 'Allow users to upload videos', TRUE, NULL, '2025-11-13 19:00:13', '2025-11-13 19:00:13')
    ON CONFLICT (id) DO UPDATE SET
      feature_key = EXCLUDED.feature_key,
      feature_name = EXCLUDED.feature_name,
      description = EXCLUDED.description,
      is_enabled = EXCLUDED.is_enabled,
      role_restrictions = EXCLUDED.role_restrictions,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ feature_flags');

  // Course modules
  await query(`
    INSERT INTO course_modules (id, course_id, title, description, duration_hours, order_index, created_at, updated_at)
    VALUES ('module-db45a90c-5b60-47db-a565-8957ddf762e9', 'course-98190f41-3eac-4ec3-8b74-732cee3548be', 'cpd', 'CPD', 120.50, 4, '2025-11-12 21:24:11', '2025-11-12 21:24:29')
    ON CONFLICT (id) DO UPDATE SET
      course_id = EXCLUDED.course_id,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      duration_hours = EXCLUDED.duration_hours,
      order_index = EXCLUDED.order_index,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ course_modules');

  // Module materials
  await query(`
    INSERT INTO module_materials (id, module_id, title, file_name, file_path, file_size, file_type, uploaded_by, created_at)
    VALUES ('material-f42ec820-7221-4ca5-804d-82c125d0b39b', 'module-db45a90c-5b60-47db-a565-8957ddf762e9', 'Test', 'sid.pdf', '/uploads/modules/f76f1b88-a38a-4fc5-ac01-fdb33febf85a-sid.pdf', 108513, 'application/pdf', 'faculty-1', '2025-11-12 21:29:57')
    ON CONFLICT (id) DO UPDATE SET
      module_id = EXCLUDED.module_id,
      title = EXCLUDED.title,
      file_name = EXCLUDED.file_name,
      file_path = EXCLUDED.file_path,
      file_size = EXCLUDED.file_size,
      file_type = EXCLUDED.file_type,
      uploaded_by = EXCLUDED.uploaded_by;
  `);
  console.log('  ✓ module_materials');

  // Attendance
  await query(`
    INSERT INTO attendance (id, student_id, faculty_id, attendance_date, status, notes, marked_at, created_at, updated_at)
    VALUES 
      ('attendance-5cc8baff-d46d-4e9a-b5e1-dcb8e69fdc02', 'student-410e5d86-7f71-4a3b-9365-159baa0a02bc', 'faculty-1', '2025-11-13', 'present', NULL, '2025-11-13 10:37:05', '2025-11-13 10:25:21', '2025-11-13 10:37:05'),
      ('attendance-c657cd15-8c97-45eb-a96e-baac0f72f48f', 'student-f6b5b915-de1b-47e1-9237-bc95c3a3d8f2', 'faculty-1', '2025-11-17', 'absent', NULL, '2025-11-17 06:58:10', '2025-11-17 06:57:52', '2025-11-17 06:58:10')
    ON CONFLICT (id) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      faculty_id = EXCLUDED.faculty_id,
      attendance_date = EXCLUDED.attendance_date,
      status = EXCLUDED.status,
      notes = EXCLUDED.notes,
      marked_at = EXCLUDED.marked_at,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ attendance');

  // Calendar events
  await query(`
    INSERT INTO calendar_events (id, title, description, event_date, event_time, assignment_id, created_at, updated_at)
    VALUES ('event-8b412071-eda3-433b-9f41-fd55b8e52c18', 'New', '123421', '2025-11-13', '10:49:00', NULL, '2025-11-12 17:48:52', '2025-11-12 17:48:52')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      event_date = EXCLUDED.event_date,
      event_time = EXCLUDED.event_time,
      assignment_id = EXCLUDED.assignment_id,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ calendar_events');

  // Chat groups
  await query(`
    INSERT INTO chat_groups (id, name, created_at, updated_at)
    VALUES ('group-813bc235-36a5-4c6a-984d-2303d6222079', 'Testing', '2025-11-13 11:13:08', '2025-11-13 11:13:08')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ chat_groups');

  // Chat group members
  await query(`
    INSERT INTO chat_group_members (group_id, user_id, joined_at)
    VALUES ('group-813bc235-36a5-4c6a-984d-2303d6222079', 'student-6250d542-3a83-4387-bc03-631489a9c070', '2025-11-13 11:13:08')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  `);
  console.log('  ✓ chat_group_members');

  // Forum threads
  await query(`
    INSERT INTO forum_threads (id, category_id, course_id, title, content, author_id, author_name, author_role, is_pinned, is_locked, views, reply_count, last_reply_at, created_at, updated_at)
    VALUES ('thread-84334829-27ce-4b1e-9407-124c9cac3880', '', '', 'sda', 'sdad', 'faculty-1', 'Dr. Sarah Johnson', 'faculty', FALSE, FALSE, 1, 0, NULL, '2025-11-13 18:33:31', '2025-11-13 18:33:31')
    ON CONFLICT (id) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      course_id = EXCLUDED.course_id,
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      author_id = EXCLUDED.author_id,
      author_name = EXCLUDED.author_name,
      author_role = EXCLUDED.author_role,
      views = EXCLUDED.views,
      reply_count = EXCLUDED.reply_count,
      updated_at = EXCLUDED.updated_at;
  `);
  console.log('  ✓ forum_threads');

  // Password reset tokens
  await query(`
    INSERT INTO password_reset_tokens (id, user_id, user_type, token, expires_at, used, created_at)
    VALUES ('reset-bc34fbd7-56ce-4ccc-aac0-0186b502cdae', 'student-6250d542-3a83-4387-bc03-631489a9c070', 'student', 'a6b95fb3-63e0-4b8d-99b9-dc0c363cedd1', '2025-11-13 18:59:39', FALSE, '2025-11-13 17:59:39')
    ON CONFLICT (id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      user_type = EXCLUDED.user_type,
      token = EXCLUDED.token,
      expires_at = EXCLUDED.expires_at,
      used = EXCLUDED.used;
  `);
  console.log('  ✓ password_reset_tokens');
}

async function main() {
  try {
    console.log('🚀 Starting complete MySQL to PostgreSQL migration...\n');
    
    await createAllEnums();
    await dropAllTables();
    await createAllTables();
    await importAllData();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - All ENUM types created');
    console.log('  - All tables created with indexes');
    console.log('  - All data imported');
    console.log('\n🎉 Your Supabase database is now ready!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, createAllEnums, createAllTables, importAllData };

