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
const { query } = require('./db');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads/modules');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

const upload = multer({ storage });

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
    database: 'MariaDB',
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
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).json({ 
        message: 'Database not initialized. Please run: npm run db:init' 
      });
    }
    if (error.code === 'ER_GET_CONNECTION_TIMEOUT' || error.code === 'ER_AUTHENTICATION_PLUGIN_NOT_SUPPORTED') {
      return res.status(500).json({ 
        message: 'Database connection failed. Please check your database configuration.' 
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
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
      courseId, year, cohort, 
      courseFee, paymentPlan, paymentPlanDetails,
      feeDueDate, sendReminder,
      guardian, sendOfferLetter 
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
      courseFee,
      paymentPlan,
      paymentPlanDetails,
      feeDueDate,
      sendReminder: sendReminder !== undefined ? sendReminder : true,
      guardian,
    });

    // Get course details for offer letter
    let course = null;
    if (courseId) {
      try {
        course = await courseService.getById(courseId);
      } catch (error) {
        console.error('Error fetching course for offer letter:', error);
      }
    }

    // Send offer letter or welcome email
    if (sendOfferLetter) {
      sendStudentOfferLetter({ ...student, password }, course).catch(error => {
        console.error('Failed to send offer letter:', error);
      });
      
      // Update offer letter sent status
      await query(
        'UPDATE students SET offer_letter_sent = TRUE, offer_letter_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
        [student.id]
      );
    } else {
      sendStudentWelcomeEmail({ ...student, password }).catch(error => {
        console.error('Failed to send student welcome email:', error);
      });
    }

    // Don't send password in response
    const { password: _, ...studentResponse } = student;
    res.status(201).json(studentResponse);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
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
    if (error.code === 'ER_DUP_ENTRY') {
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

app.listen(PORT, () => {
  console.log(`🚀 Lumina LMS API running on http://localhost:${PORT}`);
  console.log(`📊 Using MariaDB database: ${process.env.DB_NAME || 'lms_platform'}`);
});
