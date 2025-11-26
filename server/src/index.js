/* eslint-env node */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const { sendStudentWelcomeEmail, sendStudentOfferLetter, sendPaymentReminder } = require('./mailer');
const authService = require('./services/authService');
const studentService = require('./services/studentService');
const courseService = require('./services/courseService');
const assignmentService = require('./services/assignmentService');
const calendarService = require('./services/calendarService');
const facultyService = require('./services/facultyService');
const moduleService = require('./services/moduleService');
const paymentService = require('./services/paymentService');
const accountingService = require('./services/accountingService');
const accountingUserService = require('./services/accountingUserService');
const attendanceService = require('./services/attendanceService');
const mailboxService = require('./services/mailboxService');
const passwordResetService = require('./services/passwordResetService');
const quizService = require('./services/quizService');
const forumService = require('./services/forumService');
const certificateService = require('./services/certificateService');
const notificationService = require('./services/notificationService');
const analyticsService = require('./services/analyticsService');
const videoService = require('./services/videoService');
const achievementService = require('./services/achievementService');
const activityLogService = require('./services/activityLogService');
const featureFlagService = require('./services/featureFlagService');
const { query } = require('./db');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads/modules');
const videosDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuid()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuid()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 4000;

app.get('/', (_req, res) => {
  res.json({
    name: 'Lumina LMS API',
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'PostgreSQL',
    endpoints: [
      'POST /auth/login',
      'GET /students',
      'POST /students',
      'PUT /students/:id',
      'DELETE /students/:id',
      'GET /courses',
      'GET /courses/:id',
      'POST /courses',
      'PUT /courses/:id',
      'DELETE /courses/:id',
      'GET /assignments',
      'POST /assignments',
      'PUT /assignments/:id',
      'POST /assignments/:id/submit',
    ],
  });
});

// Authentication
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password, email } = req.body ?? {};
    const loginIdentifier = username || email;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }

    const user = await authService.login(loginIdentifier, password);

    if (!user) {
      console.log(`Login failed for: ${loginIdentifier}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: uuid(),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Full error:', error);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    // PostgreSQL error codes
    if (error.code === '3D000') {
      return res.status(500).json({ 
        message: 'Database not initialized. Please run: node database/init-postgres.js' 
      });
    }
    if (error.code === '28P01' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        message: 'Database connection failed. Please check your database configuration.' 
      });
    }
    // Check for column not found errors
    if (error.message && (error.message.includes('column') || error.message.includes('does not exist'))) {
      return res.status(500).json({ 
        message: 'Database schema error. Please run migrations.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Students endpoints
app.get('/students', async (_req, res) => {
  try {
    const students = await studentService.getAll();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

app.post('/students', async (req, res) => {
  try {
    const { 
      firstName, lastName, email, password, 
      phone, dateOfBirth, address, city, state, country, postalCode,
      courseId, year, cohort, batchTiming, classSchedule,
      guardian, adminRemarks
    } = req.body ?? {};

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const student = await studentService.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      country,
      postalCode,
      courseId,
      year,
      cohort,
      batchTiming,
      classSchedule,
      guardian,
    });

    // Create accounting task instead of sending offer letter
    // The accounting team will handle fee setup and then send the offer letter
    try {
      const course = courseId ? await courseService.getById(courseId) : null;
      
      await accountingService.createTask({
        studentId: student.id,
        taskType: 'fee_setup',
        priority: 'high',
        title: `Fee Setup Required: ${student.firstName} ${student.lastName}`,
        description: `New student enrollment requires fee details to be set up. Student: ${student.firstName} ${student.lastName} (${student.email})${course ? `. Course: ${course.title}` : ''}`,
        studentData: {
          ...student,
          password: password, // Include password for offer letter generation later
          course: course ? { id: course.id, title: course.title } : null,
        },
        adminRemarks: adminRemarks || null,
      });
    } catch (error) {
      console.error('Failed to create accounting task:', error);
      // Continue even if task creation fails
    }

    // Don't send password in response
    const { password: _, ...studentResponse } = student;
    res.status(201).json(studentResponse);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // PostgreSQL unique violation or MySQL duplicate
      return res.status(409).json({ message: 'Student with this email already exists' });
    }
    res.status(500).json({ message: 'Failed to create student' });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentService.update(id, req.body);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { password: _, ...studentResponse } = student;
    res.json(studentResponse);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await studentService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Faculty management endpoints
app.get('/faculty', async (_req, res) => {
  try {
    const faculty = await facultyService.getAll();
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Failed to fetch faculty' });
  }
});

app.post('/faculty', async (req, res) => {
  try {
    const { name, email, username, password, phone, department, office, officeHours, specialization } = req.body ?? {};

    if (!name || !email || !username) {
      return res.status(400).json({ message: 'Name, email, and username are required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const faculty = await facultyService.create({
      name,
      email,
      username,
      password,
      phone: phone || null,
      department: department || null,
      office: office || null,
      officeHours: officeHours || null,
      specialization: specialization || null,
    });

    // Don't send password in response
    const { password: _, ...facultyResponse } = faculty;
    res.status(201).json(facultyResponse);
  } catch (error) {
    console.error('Error creating faculty:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // PostgreSQL unique violation or MySQL duplicate
      return res.status(409).json({ message: 'Faculty with this email or username already exists' });
    }
    res.status(500).json({ message: 'Failed to create faculty' });
  }
});

app.put('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await facultyService.update(id, req.body);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Failed to update faculty' });
  }
});

app.delete('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await facultyService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    res.json({ message: 'Faculty member deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ message: 'Failed to delete faculty' });
  }
});

// Accounting user management endpoints
app.get('/accounting-users', async (_req, res) => {
  try {
    const users = await accountingUserService.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching accounting users:', error);
    res.status(500).json({ message: 'Failed to fetch accounting users' });
  }
});

app.post('/accounting-users', async (req, res) => {
  try {
    const { name, email, username, password } = req.body ?? {};

    if (!name || !email || !username) {
      return res.status(400).json({ message: 'Name, email, and username are required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await accountingUserService.create({
      name,
      email,
      username,
      password,
    });

    // Don't send password in response
    const { password: _, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating accounting user:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // PostgreSQL unique violation or MySQL duplicate
      return res.status(409).json({ message: 'Accounting user with this email or username already exists' });
    }
    res.status(500).json({ message: 'Failed to create accounting user' });
  }
});

app.put('/accounting-users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await accountingUserService.update(id, req.body);

    if (!user) {
      return res.status(404).json({ message: 'Accounting user not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating accounting user:', error);
    res.status(500).json({ message: 'Failed to update accounting user' });
  }
});

app.delete('/accounting-users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await accountingUserService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Accounting user not found' });
    }

    res.json({ message: 'Accounting user deleted successfully' });
  } catch (error) {
    console.error('Error deleting accounting user:', error);
    res.status(500).json({ message: 'Failed to delete accounting user' });
  }
});

// Courses endpoints
app.get('/courses', async (_req, res) => {
  try {
    const courses = await courseService.getAll();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

app.get('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.getById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

app.post('/courses', async (req, res) => {
  try {
    const { title, description, instructor, department, startDate, endDate, totalYears, tags, capacity, enrolled } = req.body ?? {};

    if (!title || !instructor) {
      return res.status(400).json({ message: 'Title and instructor are required' });
    }

    const course = await courseService.create({
      title,
      description,
      instructor,
      department,
      startDate,
      endDate,
      totalYears,
      tags,
      capacity,
      enrolled,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

app.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseService.update(id, req.body);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

app.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await courseService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// Course enrollment endpoints
app.post('/courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // Check if course exists
    const course = await courseService.getById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const [existing] = await query(
      'SELECT id FROM course_enrollments WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if (existing) {
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }

    // Check capacity
    const enrolledCount = course.enrolled?.length || 0;
    if (course.capacity && enrolledCount >= course.capacity) {
      return res.status(400).json({ message: 'Course is at full capacity' });
    }

    // Enroll student
    await query(
      'INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)',
      [courseId, studentId]
    );

    res.status(201).json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // PostgreSQL unique violation or MySQL duplicate
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
});

app.delete('/courses/:courseId/enroll/:studentId', async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    const result = await query(
      'DELETE FROM course_enrollments WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if (!result.affectedRows || result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    res.status(500).json({ message: 'Failed to unenroll from course' });
  }
});

app.get('/students/:studentId/courses', async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await query(
      `SELECT 
        ce.course_id as courseId, ce.enrolled_at as enrolledAt,
        c.id, c.title, c.description, c.instructor, c.department,
        c.start_date as startDate, c.end_date as endDate, c.total_years as totalYears,
        c.capacity, c.created_at as createdAt, c.updated_at as updatedAt
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ?
      ORDER BY ce.enrolled_at DESC`,
      [studentId]
    );

    // Get tags for each course
    for (const course of enrollments) {
      const tags = await query('SELECT tag FROM course_tags WHERE course_id = ?', [course.courseId]);
      course.tags = tags.map(t => t.tag);
    }

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Failed to fetch student courses' });
  }
});

// Assignments endpoints
app.get('/assignments', async (_req, res) => {
  try {
    const assignments = await assignmentService.getAll();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
});

app.post('/assignments', async (req, res) => {
  try {
    const { title, courseId, dueDate, description } = req.body ?? {};

    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and courseId are required' });
    }

    const assignment = await assignmentService.create({
      title,
      courseId,
      dueDate,
      description,
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
});

app.put('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await assignmentService.update(id, req.body);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
});

app.post('/assignments/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, notes } = req.body ?? {};

    // Check if assignment exists
    const assignment = await assignmentService.getById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!studentId) {
      return res.status(400).json({ message: 'Missing studentId' });
    }

    const submission = await assignmentService.submit(id, {
      studentId,
      notes,
      artifactName: req.file?.originalname ?? null,
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Failed to submit assignment' });
  }
});

// Grade submission endpoint
app.post('/assignments/submissions/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback, gradedBy } = req.body ?? {};

    if (!grade) {
      return res.status(400).json({ message: 'Grade is required' });
    }

    const gradedSubmission = await assignmentService.gradeSubmission(id, {
      grade: parseFloat(grade),
      feedback: feedback || null,
      gradedBy: gradedBy || null,
    });

    if (!gradedSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(gradedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Failed to grade submission' });
  }
});

// Calendar events endpoints
app.get('/calendar/events', async (_req, res) => {
  try {
    const events = await calendarService.getAll();
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});

app.get('/calendar/events/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const events = await calendarService.getByDate(date);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
});

app.post('/calendar/events', async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, assignmentId } = req.body ?? {};

    if (!title || !eventDate) {
      return res.status(400).json({ message: 'Title and event date are required' });
    }

    const event = await calendarService.create({
      title,
      description,
      eventDate,
      eventTime,
      assignmentId,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Failed to create calendar event' });
  }
});

app.delete('/calendar/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await calendarService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ message: 'Failed to delete calendar event' });
  }
});

// Course modules endpoints
app.get('/courses/:courseId/modules', async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await moduleService.getAllByCourse(courseId);
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Failed to fetch modules' });
  }
});

app.post('/courses/:courseId/modules', upload.single('file'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, durationHours, orderIndex } = req.body ?? {};

    if (!title) {
      return res.status(400).json({ message: 'Module title is required' });
    }

    const module = await moduleService.create({
      courseId,
      title,
      description: description || null,
      durationHours: durationHours ? parseFloat(durationHours) : null,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
    });

    res.status(201).json(module);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Failed to create module' });
  }
});

app.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, durationHours, orderIndex } = req.body ?? {};

    const module = await moduleService.update(id, {
      title,
      description,
      durationHours: durationHours ? parseFloat(durationHours) : null,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : null,
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Failed to update module' });
  }
});

app.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await moduleService.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Failed to delete module' });
  }
});

// Module materials endpoints
app.post('/modules/:moduleId/materials', upload.single('file'), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title } = req.body ?? {};
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: 'Material title is required' });
    }

    // In a real app, save file to disk/storage and get path
    // For now, we'll store file info
    const material = await moduleService.addMaterial(moduleId, {
      title,
      fileName: file?.originalname || null,
      filePath: file ? `/uploads/modules/${file.filename}` : null,
      fileSize: file?.size || null,
      fileType: file?.mimetype || null,
      uploadedBy: req.body.uploadedBy || null,
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({ message: 'Failed to add material' });
  }
});

app.delete('/modules/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await moduleService.deleteMaterial(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: 'Failed to delete material' });
  }
});

// Payment endpoints
app.get('/students/:studentId/payments', async (req, res) => {
  try {
    const { studentId } = req.params;
    const summary = await paymentService.getPaymentSummary(studentId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ message: 'Failed to fetch payment summary' });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const {
      studentId,
      amount,
      installmentNumber,
      totalInstallments,
      paymentMethod,
      cardNumber,
      cardHolder,
      expiryDate,
      cvv,
    } = req.body ?? {};

    if (!studentId || !amount) {
      return res.status(400).json({ message: 'Student ID and amount are required' });
    }

    // Mock payment gateway processing
    // In a real app, this would integrate with Stripe, PayPal, etc.
    const mockProcessPayment = () => {
      // Simulate payment processing delay
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock validation - accept any card number ending in even digit
          const lastDigit = cardNumber?.slice(-1);
          const isValid = lastDigit && !isNaN(lastDigit) && parseInt(lastDigit) % 2 === 0;

          if (isValid) {
            resolve({
              success: true,
              transactionId: `txn_${uuid()}`,
              message: 'Payment processed successfully',
            });
          } else {
            resolve({
              success: false,
              transactionId: null,
              message: 'Payment failed. Please check your card details.',
            });
          }
        }, 1500); // Simulate 1.5 second processing time
      });
    };

    const paymentResult = await mockProcessPayment();

    if (paymentResult.success) {
      const payment = await paymentService.create({
        studentId,
        amount: parseFloat(amount),
        installmentNumber: installmentNumber || null,
        totalInstallments: totalInstallments || null,
        paymentMethod: paymentMethod || 'card',
        transactionId: paymentResult.transactionId,
        paymentGateway: 'mock',
        notes: `Payment via mock gateway. Card: ****${cardNumber?.slice(-4)}`,
      });

      res.status(201).json({
        success: true,
        payment,
        message: paymentResult.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: paymentResult.message,
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Payment reminder endpoints
app.post('/payments/send-reminders', async (req, res) => {
  try {
    const { daysBefore = 7 } = req.body ?? {};
    const daysBeforeNum = parseInt(daysBefore, 10);
    
    // Get all students with due dates and send_reminder enabled
    const students = await query(
      `SELECT 
        s.id, s.first_name as firstName, s.last_name as lastName, s.email, s.username,
        s.course_fee as courseFee, s.fee_due_date as feeDueDate, s.send_reminder as sendReminder
      FROM students s
      WHERE s.fee_due_date IS NOT NULL 
        AND s.send_reminder = 1
        AND s.status = 'active'
        AND DATEDIFF(s.fee_due_date, CURDATE()) <= ?
        AND DATEDIFF(s.fee_due_date, CURDATE()) >= 0
      ORDER BY s.fee_due_date ASC`,
      [daysBeforeNum]
    );

    let sentCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Get payment summary for the student
        const paymentSummary = await paymentService.getPaymentSummary(student.id);
        
        // Only send reminder if there's remaining balance
        if (paymentSummary.remainingAmount > 0) {
          await sendPaymentReminder(student, paymentSummary);
          sentCount++;
        }
      } catch (error) {
        console.error(`Error sending reminder to ${student.email}:`, error);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Reminders sent: ${sentCount}, Errors: ${errorCount}`,
      sent: sentCount,
      errors: errorCount,
      total: students.length,
    });
  } catch (error) {
    console.error('Error sending payment reminders:', error);
    res.status(500).json({ message: 'Failed to send payment reminders' });
  }
});

// Manual reminder for specific student
app.post('/students/:studentId/send-payment-reminder', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await studentService.getById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.feeDueDate) {
      return res.status(400).json({ message: 'Student does not have a fee due date set' });
    }

    const paymentSummary = await paymentService.getPaymentSummary(studentId);

    if (paymentSummary.remainingAmount <= 0) {
      return res.status(400).json({ message: 'Student has no remaining balance' });
    }

    await sendPaymentReminder(student, paymentSummary);

    res.json({
      success: true,
      message: 'Payment reminder sent successfully',
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    res.status(500).json({ message: 'Failed to send payment reminder' });
  }
});

// Accounting endpoints
app.get('/accounting/tasks', async (req, res) => {
  try {
    const { status, assignedTo, taskType } = req.query;
    const tasks = await accountingService.getAllTasks({
      status,
      assignedTo,
      taskType,
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching accounting tasks:', error);
    res.status(500).json({ message: 'Failed to fetch accounting tasks' });
  }
});

app.get('/accounting/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await accountingService.getTaskById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching accounting task:', error);
    res.status(500).json({ message: 'Failed to fetch accounting task' });
  }
});

app.put('/accounting/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await accountingService.updateTask(id, req.body);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating accounting task:', error);
    res.status(500).json({ message: 'Failed to update accounting task' });
  }
});

app.post('/accounting/tasks/:id/send-to-admin', async (req, res) => {
  try {
    const { id } = req.params;
    const { completedBy, feeDetails, accountingRemarks } = req.body;

    const task = await accountingService.sendToAdmin(id, completedBy, feeDetails, accountingRemarks);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error sending task to admin:', error);
    res.status(500).json({ message: 'Failed to send task to admin' });
  }
});

app.post('/accounting/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { completedBy, feeDetails, accountingRemarks } = req.body;

    const task = await accountingService.completeTask(id, completedBy, feeDetails, accountingRemarks);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error completing accounting task:', error);
    res.status(500).json({ message: 'Failed to complete accounting task' });
  }
});

app.post('/accounting/tasks/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy, action, adminRemarks } = req.body; // action: 'accept' or 'reject' or 'send_back'

    const task = await accountingService.getTaskById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (action === 'accept') {
      // Update student status to accepted
      await query(
        `UPDATE students SET application_status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [task.studentId]
      );

      // Send offer letter
      if (task.studentData) {
        try {
          const course = task.studentData.course ? await courseService.getById(task.studentData.course.id) : null;
          await sendStudentOfferLetter(task.studentData, course);
          
          // Update offer letter sent status
          await query(
            'UPDATE students SET offer_letter_sent = TRUE, offer_letter_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
            [task.studentId]
          );
        } catch (error) {
          console.error('Failed to send offer letter:', error);
        }
      }

      // Mark task as completed
      await accountingService.updateTask(id, {
        status: 'completed',
        reviewedBy,
        adminRemarks,
      });
    } else if (action === 'send_back') {
      // Send back to accounting with remarks
      await query(
        `UPDATE students SET application_status = 'fee_setup_pending', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [task.studentId]
      );

      await accountingService.updateTask(id, {
        status: 'pending',
        reviewedBy,
        adminRemarks,
      });
    } else if (action === 'reject') {
      // Reject application
      await query(
        `UPDATE students SET application_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [task.studentId]
      );

      await accountingService.updateTask(id, {
        status: 'cancelled',
        reviewedBy,
        adminRemarks,
      });
    }

    const updatedTask = await accountingService.getTaskById(id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error reviewing task:', error);
    res.status(500).json({ message: 'Failed to review task' });
  }
});

// Salary management endpoints
app.get('/accounting/salaries', async (req, res) => {
  try {
    const { employeeId, status, employeeType } = req.query;
    const salaries = await accountingService.getAllSalaries({
      employeeId,
      status,
      employeeType,
    });
    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: 'Failed to fetch salaries' });
  }
});

app.get('/accounting/salaries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await accountingService.getSalaryById(id);

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Error fetching salary:', error);
    res.status(500).json({ message: 'Failed to fetch salary' });
  }
});

app.post('/accounting/salaries', async (req, res) => {
  try {
    const salary = await accountingService.createSalary(req.body);
    res.status(201).json(salary);
  } catch (error) {
    console.error('Error creating salary:', error);
    res.status(500).json({ message: 'Failed to create salary' });
  }
});

app.put('/accounting/salaries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await accountingService.updateSalary(id, req.body);

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ message: 'Failed to update salary' });
  }
});

// Salary payment endpoints
app.get('/accounting/salaries/:salaryId/payments', async (req, res) => {
  try {
    const { salaryId } = req.params;
    const payments = await accountingService.getSalaryPayments(salaryId);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching salary payments:', error);
    res.status(500).json({ message: 'Failed to fetch salary payments' });
  }
});

app.post('/accounting/salaries/:salaryId/payments', async (req, res) => {
  try {
    const { salaryId } = req.params;
    const payment = await accountingService.createSalaryPayment({
      ...req.body,
      salaryId,
    });
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating salary payment:', error);
    res.status(500).json({ message: 'Failed to create salary payment' });
  }
});

app.put('/accounting/salary-payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await accountingService.updateSalaryPayment(id, req.body);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error updating salary payment:', error);
    res.status(500).json({ message: 'Failed to update salary payment' });
  }
});

// Attendance endpoints
// Get department students for faculty (only those with class today)
app.get('/attendance/department-students', async (req, res) => {
  try {
    const { facultyId } = req.query;
    
    if (!facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required' });
    }
    
    const students = await attendanceService.getDepartmentStudents(facultyId);
    res.json(students);
  } catch (error) {
    console.error('Error fetching department students:', error);
    res.status(500).json({ message: 'Failed to fetch department students' });
  }
});

// Get attendance by date
app.get('/attendance', async (req, res) => {
  try {
    const { date, facultyId } = req.query;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    const attendance = await attendanceService.getAttendanceByDate(attendanceDate, facultyId || null);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Mark attendance (single or bulk)
app.post('/attendance', async (req, res) => {
  try {
    const { studentId, facultyId, attendanceDate, status, notes, attendanceList } = req.body;
    
    if (!facultyId || !attendanceDate) {
      return res.status(400).json({ message: 'Faculty ID and attendance date are required' });
    }
    
    if (attendanceList && Array.isArray(attendanceList)) {
      // Bulk attendance
      const results = await attendanceService.markBulkAttendance(attendanceList, facultyId, attendanceDate);
      res.status(201).json(results);
    } else {
      // Single attendance
      if (!studentId || !status) {
        return res.status(400).json({ message: 'Student ID and status are required' });
      }
      
      const attendance = await attendanceService.markAttendance({
        studentId,
        facultyId,
        attendanceDate,
        status,
        notes,
      });
      res.status(201).json(attendance);
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// Get student attendance summary
app.get('/attendance/student/:studentId/summary', async (req, res) => {
  try {
    const { studentId } = req.params;
    const summary = await attendanceService.getStudentAttendanceSummary(studentId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
});

// Get all attendance (admin view)
app.get('/attendance/all', async (req, res) => {
  try {
    const { studentId, facultyId, startDate, endDate, status } = req.query;
    
    const attendance = await attendanceService.getAllAttendance({
      studentId: studentId || null,
      facultyId: facultyId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || null,
    });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Mailbox endpoints
app.get('/mailbox/inbox', async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    if (!userId || !userRole) {
      return res.status(400).json({ message: 'userId and userRole are required' });
    }
    const inbox = await mailboxService.getInbox(userId, userRole);
    res.json(inbox);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Failed to fetch inbox' });
  }
});

app.get('/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const message = await mailboxService.getMessageById(id, userId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Failed to fetch message' });
  }
});

app.post('/mailbox/send', async (req, res) => {
  try {
    const {
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientRole,
      subject,
      body,
      isAnnouncement,
      announcementAudience,
    } = req.body;

    if (!senderId || !senderName || !senderRole || !subject || !body) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!isAnnouncement && !recipientId) {
      return res.status(400).json({ message: 'recipientId is required for personal messages' });
    }

    if (isAnnouncement && !announcementAudience) {
      return res.status(400).json({ message: 'announcementAudience is required for announcements' });
    }

    const message = await mailboxService.sendMessage({
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientRole,
      subject,
      body,
      isAnnouncement: isAnnouncement || false,
      announcementAudience,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

app.post('/mailbox/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    await mailboxService.markAsRead(id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

app.post('/mailbox/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    await mailboxService.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

app.delete('/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const result = await mailboxService.deleteMessage(id, userId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.json(result);
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

app.get('/mailbox/sent', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const messages = await mailboxService.getSentMessages(userId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Failed to fetch sent messages' });
  }
});

app.get('/mailbox/unread-count', async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    if (!userId || !userRole) {
      return res.status(400).json({ message: 'userId and userRole are required' });
    }
    const count = await mailboxService.getUnreadCount(userId, userRole);
    res.json(count);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Password Reset endpoints
app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await passwordResetService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const result = await passwordResetService.resetPassword(token, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

app.get('/auth/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const result = await passwordResetService.verifyResetToken(token);
    if (!result.valid) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
});

// ============================================
// QUIZ/EXAM ENDPOINTS
// ============================================
app.post('/quizzes', async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

app.get('/quizzes/course/:courseId', async (req, res) => {
  try {
    const quizzes = await quizService.getQuizzesByCourse(req.params.courseId);
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

app.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    quiz.questions = await quizService.getQuestionsByQuiz(req.params.id);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

app.post('/quizzes/:quizId/questions', async (req, res) => {
  try {
    const question = await quizService.addQuestion({
      ...req.body,
      quizId: req.params.quizId,
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Failed to add question' });
  }
});

app.post('/quizzes/questions/:questionId/options', async (req, res) => {
  try {
    const option = await quizService.addQuestionOption({
      ...req.body,
      questionId: req.params.questionId,
    });
    res.status(201).json(option);
  } catch (error) {
    console.error('Error adding option:', error);
    res.status(500).json({ message: 'Failed to add option' });
  }
});

app.post('/quizzes/:quizId/start', async (req, res) => {
  try {
    const attempt = await quizService.startAttempt(req.params.quizId, req.body.studentId);
    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: error.message || 'Failed to start quiz' });
  }
});

app.post('/quizzes/attempts/:attemptId/answers', async (req, res) => {
  try {
    const answer = await quizService.submitAnswer(req.params.attemptId, req.body.questionId, req.body);
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
});

app.post('/quizzes/attempts/:attemptId/submit', async (req, res) => {
  try {
    const attempt = await quizService.submitAttempt(req.params.attemptId, req.body.timeTaken);
    res.json(attempt);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

app.get('/quizzes/attempts/:attemptId/results', async (req, res) => {
  try {
    const results = await quizService.getAttemptResults(req.params.attemptId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

// ============================================
// FORUM ENDPOINTS
// ============================================
app.post('/forum/categories', async (req, res) => {
  try {
    const category = await forumService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

app.get('/forum/categories/course/:courseId', async (req, res) => {
  try {
    const categories = await forumService.getCategoriesByCourse(req.params.courseId);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

app.post('/forum/threads', async (req, res) => {
  try {
    const thread = await forumService.createThread(req.body);
    res.status(201).json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ message: 'Failed to create thread' });
  }
});

app.get('/forum/threads/category/:categoryId', async (req, res) => {
  try {
    const threads = await forumService.getThreadsByCategory(req.params.categoryId);
    res.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ message: 'Failed to fetch threads' });
  }
});

app.get('/forum/threads/:id', async (req, res) => {
  try {
    const thread = await forumService.getThreadById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    thread.replies = await forumService.getRepliesByThread(req.params.id);
    res.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Failed to fetch thread' });
  }
});

app.post('/forum/replies', async (req, res) => {
  try {
    const reply = await forumService.createReply(req.body);
    res.status(201).json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Failed to create reply' });
  }
});

app.post('/forum/replies/:id/solution', async (req, res) => {
  try {
    const reply = await forumService.markAsSolution(req.params.id);
    res.json(reply);
  } catch (error) {
    console.error('Error marking solution:', error);
    res.status(500).json({ message: 'Failed to mark solution' });
  }
});

// ============================================
// CERTIFICATE ENDPOINTS
// ============================================
app.post('/certificates', async (req, res) => {
  try {
    const certificate = await certificateService.createCertificate(req.body);
    res.status(201).json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ message: 'Failed to create certificate' });
  }
});

app.get('/certificates/student/:studentId', async (req, res) => {
  try {
    const certificates = await certificateService.getCertificatesByStudent(req.params.studentId);
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
});

app.get('/certificates/verify/:verificationCode', async (req, res) => {
  try {
    const certificate = await certificateService.verifyCertificate(req.params.verificationCode);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ message: 'Failed to verify certificate' });
  }
});

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
app.post('/notifications', async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

app.get('/notifications/:userId/:userType', async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const notifications = await notificationService.getNotificationsByUser(
      req.params.userId,
      req.params.userType,
      { unreadOnly: unreadOnly === 'true', limit: limit ? parseInt(limit) : null }
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

app.get('/notifications/:userId/:userType/unread-count', async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.params.userId, req.params.userType);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

app.post('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

app.post('/notifications/:userId/:userType/read-all', async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.params.userId, req.params.userType);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================
app.post('/analytics/events', async (req, res) => {
  try {
    await analyticsService.trackEvent(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ message: 'Failed to track event' });
  }
});

app.get('/analytics/student/:studentId/performance', async (req, res) => {
  try {
    const performance = await analyticsService.getStudentPerformance(req.params.studentId);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ message: 'Failed to fetch performance' });
  }
});

app.get('/analytics/course/:courseId', async (req, res) => {
  try {
    const analytics = await analyticsService.getCourseAnalytics(req.params.courseId);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({ message: 'Failed to fetch course analytics' });
  }
});

app.get('/analytics/system', async (req, res) => {
  try {
    const analytics = await analyticsService.getSystemAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({ message: 'Failed to fetch system analytics' });
  }
});

// ============================================
// VIDEO ENDPOINTS
// ============================================
app.post('/videos', uploadVideo.single('video'), async (req, res) => {
  try {
    const videoData = {
      ...req.body,
      videoUrl: req.file ? `/uploads/videos/${req.file.filename}` : req.body.videoUrl,
      videoType: req.file ? 'upload' : req.body.videoType || 'youtube',
    };
    const video = await videoService.addVideo(videoData);
    res.status(201).json(video);
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({ message: error.message || 'Failed to add video' });
  }
});

app.get('/videos/course/:courseId', async (req, res) => {
  try {
    const videos = await videoService.getVideosByCourse(req.params.courseId);
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

app.post('/videos/:videoId/progress', async (req, res) => {
  try {
    const progress = await videoService.updateVideoProgress(
      req.params.videoId,
      req.body.studentId,
      req.body
    );
    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

app.get('/videos/:videoId/progress/:studentId', async (req, res) => {
  try {
    const progress = await videoService.getVideoProgress(req.params.videoId, req.params.studentId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// ============================================
// ACHIEVEMENT ENDPOINTS
// ============================================
app.post('/achievements', async (req, res) => {
  try {
    const achievement = await achievementService.createAchievement(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ message: 'Failed to create achievement' });
  }
});

app.get('/achievements', async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

app.get('/achievements/student/:studentId', async (req, res) => {
  try {
    const achievements = await achievementService.getStudentAchievements(req.params.studentId);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    res.status(500).json({ message: 'Failed to fetch student achievements' });
  }
});

app.post('/achievements/:achievementId/award/:studentId', async (req, res) => {
  try {
    const studentAchievement = await achievementService.awardAchievement(
      req.params.studentId,
      req.params.achievementId
    );
    res.status(201).json(studentAchievement);
  } catch (error) {
    console.error('Error awarding achievement:', error);
    res.status(500).json({ message: 'Failed to award achievement' });
  }
});

// ============================================
// ACTIVITY LOG ENDPOINTS
// ============================================
app.get('/activity-logs', async (req, res) => {
  try {
    const logs = await activityLogService.getActivityLogs(req.query);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
});

app.post('/activity-logs', async (req, res) => {
  try {
    await activityLogService.logActivity(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Failed to log activity' });
  }
});

// ============================================
// EXPORT ENDPOINTS
// ============================================
app.get('/export/students', async (req, res) => {
  try {
    const students = await studentService.listStudents();
    const csv = convertToCSV(students);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ message: 'Failed to export students' });
  }
});

app.get('/export/courses', async (req, res) => {
  try {
    const courses = await courseService.listCourses();
    const csv = convertToCSV(courses);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=courses.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting courses:', error);
    res.status(500).json({ message: 'Failed to export courses' });
  }
});

// ============================================
// FEATURE FLAGS ENDPOINTS
// ============================================
app.get('/feature-flags', async (req, res) => {
  try {
    const flags = await featureFlagService.getAllFeatureFlags();
    res.json(flags);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    res.status(500).json({ message: 'Failed to fetch feature flags' });
  }
});

app.get('/feature-flags/enabled/:role', async (req, res) => {
  try {
    const flags = await featureFlagService.getEnabledFlagsForRole(req.params.role);
    res.json(flags);
  } catch (error) {
    console.error('Error fetching enabled flags:', error);
    res.status(500).json({ message: 'Failed to fetch enabled flags' });
  }
});

app.get('/feature-flags/check/:featureKey', async (req, res) => {
  try {
    const role = req.query.role || null;
    const isEnabled = await featureFlagService.isFeatureEnabled(req.params.featureKey, role);
    res.json({ enabled: isEnabled });
  } catch (error) {
    console.error('Error checking feature flag:', error);
    res.status(500).json({ message: 'Failed to check feature flag' });
  }
});

app.put('/feature-flags/:featureKey/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    const result = await featureFlagService.toggleFeature(req.params.featureKey, enabled);
    res.json(result);
  } catch (error) {
    console.error('Error toggling feature flag:', error);
    res.status(500).json({ message: 'Failed to toggle feature flag' });
  }
});

app.put('/feature-flags/:id', async (req, res) => {
  try {
    const result = await featureFlagService.updateFeatureFlag(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating feature flag:', error);
    res.status(500).json({ message: 'Failed to update feature flag' });
  }
});

app.post('/feature-flags', async (req, res) => {
  try {
    const result = await featureFlagService.createFeatureFlag(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating feature flag:', error);
    res.status(500).json({ message: 'Failed to create feature flag' });
  }
});

app.delete('/feature-flags/:id', async (req, res) => {
  try {
    const result = await featureFlagService.deleteFeatureFlag(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    res.status(500).json({ message: 'Failed to delete feature flag' });
  }
});

// ============================================
// AI ENDPOINTS (Placeholder for AI integration)
// ============================================
app.post('/ai/generate-questions', async (req, res) => {
  try {
    // Placeholder for AI integration
    // In production, this would call an AI service like OpenAI, Anthropic, etc.
    const { topic, courseId, count = 5 } = req.body;
    
    // Demo response - replace with actual AI service call
    const questions = Array.from({ length: count }, (_, i) => ({
      questionText: `Sample question ${i + 1} about ${topic}?`,
      questionType: 'multiple_choice',
      points: 1,
      options: [
        { text: 'Option A', isCorrect: i === 0 },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: false },
        { text: 'Option D', isCorrect: false },
      ],
    }));

    res.json({ questions, message: 'AI integration pending - using demo questions' });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Failed to generate questions' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(header => {
    const value = row[header];
    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
  }).join(','));
  return [headers.join(','), ...rows].join('\n');
}

// Global error handler middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Lumina LMS API running on http://localhost:${PORT}`);
  const dbName = process.env.DB_NAME || (process.env.DATABASE_URL ? 'Supabase PostgreSQL' : 'postgres');
  console.log(`📊 Using PostgreSQL database: ${dbName}`);
});
