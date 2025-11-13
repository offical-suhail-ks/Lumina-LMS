# 🎓 Lumina LMS - Learning Management System

A comprehensive, modern Learning Management System built with React and Node.js, designed to streamline educational workflows for administrators, faculty, and students.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Lumina LMS is a full-featured learning management platform that provides:

- **Student Management**: Complete student lifecycle from enrollment to graduation
- **Course Management**: Create, organize, and manage courses with modules and materials
- **Assignment System**: Create assignments, track submissions, and provide grades
- **Payment Management**: Fee tracking, installment plans, and payment processing
- **Communication**: Mailbox system for announcements and messaging
- **Calendar Integration**: Event management and scheduling
- **Department-Based Organization**: Organize courses and faculty by departments
- **Interactive Onboarding**: Tablet-style tour showcasing all platform features
- **Feature Management**: Admin-controlled feature flags to enable/disable functionality
- **Activity Logging**: Comprehensive system activity tracking and audit logs
- **Quizzes & Exams**: AI-powered quiz creation and management
- **Discussion Forum**: Course-based discussion threads and Q&A
- **Video Library**: Upload and manage course videos with progress tracking
- **Analytics Dashboard**: Advanced analytics for students, courses, and system-wide metrics
- **Certificates**: Digital certificate generation and management
- **Achievements**: Badge system and student achievement tracking
- **Theme Toggle**: Dark/light mode support

## ✨ Features

### 👨‍💼 Admin Features

- **Student Management**
  - Create and manage student accounts
  - Comprehensive student profiles (personal info, address, guardian details)
  - Fee management with installment plans
  - Offer letter generation and email sending
  - Payment due date tracking and reminders

- **Faculty Management**
  - Create and manage faculty accounts
  - Department-based faculty assignment
  - Faculty profile management

- **Course Management**
  - Create and edit courses
  - Department-based course organization
  - Set course duration (total years)
  - Course capacity management

- **Assignment Management**
  - Create assignments for courses
  - Set due dates and requirements
  - Track all submissions

- **Fee Management**
  - View all student fees
  - Search students by name, email, or ID
  - Send payment reminders
  - Track payment history and installments

- **System Management**
  - Activity logs monitoring and audit trails
  - Feature flag management (enable/disable features)
  - System analytics and performance metrics
  - Review and process student applications
  - Attendance tracking and reports

- **Content Management**
  - Quiz and exam creation with AI-powered question generation
  - Video upload and management for courses
  - Certificate template creation and issuance
  - Forum category and thread management

### 👨‍🏫 Faculty Features

- **Course Management**
  - View all courses in their department
  - Create and manage course modules
  - Upload study materials (PDFs, documents)
  - Set module duration and descriptions

- **Assignment Management**
  - Create assignments for courses
  - Set due dates and instructions
  - View all submissions

- **Grading System**
  - Review student submissions
  - Grade assignments (0-100%)
  - Provide detailed feedback
  - Track grading progress

- **Student Management**
  - View student rosters for courses
  - Filter by course
  - Access student contact information

- **Dashboard**
  - View department courses
  - See pending submissions
  - Quick access to all tools

- **Content Creation**
  - Create quizzes with AI-powered question generation
  - Upload course videos and multimedia content
  - Create forum discussions and manage threads
  - Issue certificates to students
  - Take and manage student attendance

- **Analytics**
  - View course performance metrics
  - Track student engagement
  - Monitor submission and grading statistics

### 👨‍🎓 Student Features

- **Course Access**
  - Browse and enroll in courses
  - View course details and modules
  - Download study materials
  - Track course progress

- **Assignments**
  - View all assignments
  - Submit assignments with files
  - View grades and feedback
  - Track submission history

- **Grades & Transcripts**
  - View all grades
  - Access academic transcript
  - See course progress
  - View submission history

- **Payment Management**
  - View fee details and payment plan
  - See installment breakdown
  - Make payments via mock payment gateway
  - View payment history

- **Profile Management**
  - Update personal information
  - Upload display picture
  - Download ID card as PDF
  - View academic information

- **Learning Tools**
  - Take quizzes and exams
  - Participate in discussion forums
  - Watch course videos with progress tracking
  - View detailed analytics and performance metrics
  - Earn certificates and achievements

- **Additional Features**
  - Study schedule planner
  - Resources library
  - Calendar with events
  - Mailbox for communications
  - Dark/light theme toggle
  - Interactive onboarding tour

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MariaDB** - Database
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **UUID** - Unique ID generation

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-reload for development
- **Concurrently** - Run multiple processes
- **Maildev** - Local email testing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MariaDB** (v10.6 or higher) or **MySQL** (v8.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LMS-PLATFROM
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

## ⚙️ Configuration

### 1. Database Configuration

Navigate to the `server` directory and create a `.env` file:

```bash
cd server
cp .env.example .env  # If .env.example exists, or create .env manually
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mariadb_password
DB_NAME=lms_platform

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Optional - for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Lumina LMS <no-reply@lumina.edu>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

## 🗄️ Database Setup

### 1. Initialize Database

Run the database initialization script:

```bash
cd server
npm run db:init
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Insert default admin user (username: `admin`, password: `admin`)

### 2. Run Migrations (if needed)

If you're updating an existing database, run the migration scripts:

```bash
# Add student fields (phone, address, fees, etc.)
npm run db:migrate-student-fields

# Add total years to courses
npm run db:migrate-total-years

# Add departments to courses and users
npm run db:migrate-departments

# Add payments table
npm run db:migrate-payments

# Add fee due date and reminders
npm run db:migrate-fee-due-date

# Add feature flags table
cd server
node database/create-feature-flags-table.js
```

### 3. Create Default Faculty User (Optional)

```bash
npm run db:create-faculty
```

This creates a faculty user:
- Username: `faculty`
- Password: `faculty`
- Email: `faculty@lumina.edu`

## ▶️ Running the Project

### Development Mode

#### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option 2: Run with Email Server (for testing emails)

**Terminal 1 - Backend with Maildev:**
```bash
cd server
npm run dev:all
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Production Mode

**Build Frontend:**
```bash
npm run build
```

**Start Backend:**
```bash
cd server
npm start
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Maildev** (if running): http://localhost:1080

### Default Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin`

**Faculty** (if created):
- Username: `faculty`
- Password: `faculty`

## 📁 Project Structure

```
LMS-PLATFROM/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Topbar.jsx            # Top navigation bar
│   │   ├── CalendarView.jsx      # Calendar component
│   │   └── ...
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   │   ├── ManageStudents.jsx
│   │   │   ├── ManageFaculty.jsx
│   │   │   ├── ManageCourses.jsx
│   │   │   ├── ManageAssignments.jsx
│   │   │   └── ManageFees.jsx
│   │   ├── faculty/              # Faculty pages
│   │   │   ├── MyCourses.jsx
│   │   │   ├── GradeSubmissions.jsx
│   │   │   ├── ManageModules.jsx
│   │   │   └── ...
│   │   ├── students/              # Student pages
│   │   │   ├── ViewGrades.jsx
│   │   │   ├── CourseModules.jsx
│   │   │   └── ...
│   │   ├── dashboard/             # Dashboard pages
│   │   ├── courses/               # Course pages
│   │   ├── assignments/           # Assignment pages
│   │   ├── fees/                  # Payment pages
│   │   └── ...
│   ├── services/                  # API service functions
│   ├── store/                     # Redux store
│   ├── routes/                    # Route definitions
│   └── utils/                     # Utility functions
│
├── server/                        # Backend source code
│   ├── src/
│   │   ├── index.js               # Express app entry point
│   │   ├── db.js                  # Database connection
│   │   ├── mailer.js              # Email service
│   │   └── services/              # Business logic services
│   │       ├── authService.js
│   │       ├── studentService.js
│   │       ├── courseService.js
│   │       ├── assignmentService.js
│   │       ├── facultyService.js
│   │       ├── moduleService.js
│   │       └── paymentService.js
│   ├── database/                  # Database scripts
│   │   ├── create-tables.sql      # Table creation SQL
│   │   ├── schema.sql             # Complete schema
│   │   ├── init.js                # Database initialization
│   │   └── migrate-*.js           # Migration scripts
│   └── uploads/                   # Uploaded files
│       └── modules/                # Course module materials
│
├── package.json                   # Frontend dependencies
├── vite.config.js                 # Vite configuration
└── README.md                      # This file
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage students, faculty, courses, and assignments
- View and manage all fees
- Send payment reminders
- Create offer letters
- System configuration

### Faculty
- View courses in their department
- Create and manage course modules
- Upload study materials
- Create assignments
- Grade student submissions
- View student rosters
- Send messages to students

### Student
- View enrolled courses
- Access course modules and materials
- Submit assignments
- View grades and feedback
- Make fee payments
- Update profile
- View calendar and events
- Access mailbox

## 🔑 Key Features

### Payment System
- **Fee Management**: Set course fees with payment plans
- **Installment Plans**: Divide fees into multiple installments
- **Payment Tracking**: Track payments and remaining balances
- **Due Date Reminders**: Automatic email reminders before due dates
- **Payment Gateway**: Mock payment processing for testing

### Course Modules
- **Module Creation**: Faculty can create modules for courses
- **Material Upload**: Upload PDFs, documents, and study materials
- **Download Access**: Students can download materials
- **Duration Tracking**: Set module duration in hours

### Email System
- **Welcome Emails**: Sent to new students with login credentials
- **Offer Letters**: Formal admission offer letters with all details
- **Payment Reminders**: Automated reminders before due dates
- **Maildev Integration**: Local email testing and preview

### Department Organization
- **Department-Based Courses**: Organize courses by department
- **Faculty Assignment**: Assign faculty to departments
- **Filtered Views**: Faculty see only their department's courses

### Interactive Onboarding Tour
- **Tablet-Style Preview**: Beautiful tablet interface showcasing all features
- **Role-Based Content**: Different tours for students, faculty, admin, and accounting
- **Live Feature Previews**: See actual interface previews for each feature
- **Step-by-Step Navigation**: Guided tour with progress tracking
- **Feature Management**: Admins can enable/disable the tour

### Feature Management System
- **Feature Flags**: Admin-controlled feature toggles
- **Granular Control**: Enable/disable individual features (quizzes, videos, forums, etc.)
- **Role-Based Restrictions**: Configure features per user role
- **Real-Time Updates**: Changes reflect immediately across the platform

### Quizzes & Exams
- **AI-Powered Generation**: Automatic quiz question generation (placeholder for AI integration)
- **Multiple Question Types**: Multiple choice, true/false, and more
- **Time Limits**: Set time constraints for quizzes
- **Auto-Grading**: Automatic scoring for objective questions
- **Results Tracking**: View quiz results and performance analytics

### Discussion Forum
- **Course-Based Threads**: Organize discussions by course
- **Q&A System**: Mark answers as solutions
- **Rich Interactions**: Reply, upvote, and engage with posts
- **Category Management**: Organize forums by topics

### Video Library
- **Course Videos**: Upload and organize videos by course and module
- **Progress Tracking**: Track video watch progress
- **Multiple Formats**: Support for MP4, WebM, OGG, and QuickTime
- **Large File Support**: Up to 500MB video uploads

### Analytics Dashboard
- **Student Performance**: Detailed grade tracking and analytics
- **Course Analytics**: Enrollment, completion, and engagement metrics
- **System Analytics**: Platform-wide statistics and insights
- **Visual Charts**: Graphical representation of data

### Certificates & Achievements
- **Digital Certificates**: Generate and issue course completion certificates
- **Custom Templates**: Create certificate templates
- **Achievement Badges**: Track and display student achievements
- **Verification**: Certificate verification system

### Activity Logging
- **Comprehensive Tracking**: Log all system activities
- **User Actions**: Track user actions, logins, and changes
- **Audit Trail**: Complete audit log for security and compliance
- **Filtering**: Filter logs by user, action, entity, and date range

### Theme Management
- **Dark/Light Mode**: Toggle between dark and light themes
- **Persistent Settings**: Theme preference saved in localStorage
- **Consistent UI**: Theme applied across all components

## 📡 API Documentation

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `POST /students/:id/send-payment-reminder` - Send payment reminder

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /courses/:id/modules` - Get course modules

### Modules
- `GET /courses/:courseId/modules` - Get all modules for a course
- `POST /courses/:courseId/modules` - Create module
- `PUT /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module
- `POST /modules/:moduleId/materials` - Upload material
- `DELETE /modules/materials/:id` - Delete material

### Assignments
- `GET /assignments` - Get all assignments
- `GET /assignments/:id` - Get assignment by ID
- `POST /assignments` - Create assignment
- `PUT /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment
- `POST /assignments/:id/submit` - Submit assignment
- `PUT /assignments/submissions/:id/grade` - Grade submission

### Payments
- `GET /students/:studentId/payments` - Get payment summary
- `POST /payments` - Process payment
- `POST /payments/send-reminders` - Send bulk payment reminders

### Faculty
- `GET /faculty` - Get all faculty
- `POST /faculty` - Create faculty user
- `PUT /faculty/:id` - Update faculty

### Quizzes
- `GET /quizzes` - Get all quizzes
- `GET /quizzes/:id` - Get quiz by ID
- `POST /quizzes` - Create quiz
- `POST /quizzes/:id/questions` - Add questions to quiz
- `POST /quizzes/:id/start` - Start quiz attempt
- `POST /quizzes/:id/submit` - Submit quiz attempt
- `GET /quizzes/:id/results` - Get quiz results

### Forum
- `GET /forum/categories` - Get forum categories
- `GET /forum/threads` - Get forum threads
- `POST /forum/threads` - Create thread
- `POST /forum/threads/:id/replies` - Reply to thread
- `PUT /forum/replies/:id/solution` - Mark reply as solution

### Videos
- `GET /videos` - Get all videos
- `GET /videos/course/:courseId` - Get videos by course
- `POST /videos` - Upload video
- `PUT /videos/:id/progress` - Update video progress

### Analytics
- `GET /analytics/student/:studentId/performance` - Get student performance
- `GET /analytics/course/:courseId` - Get course analytics
- `GET /analytics/system` - Get system analytics
- `POST /analytics/events` - Track event

### Certificates
- `GET /certificates` - Get all certificates
- `GET /certificates/student/:studentId` - Get student certificates
- `POST /certificates` - Create certificate
- `GET /certificates/verify/:id` - Verify certificate

### Achievements
- `GET /achievements` - Get all achievements
- `GET /achievements/student/:studentId` - Get student achievements
- `POST /achievements` - Create achievement
- `POST /achievements/:studentId/:achievementId/award` - Award achievement

### Activity Logs
- `GET /activity-logs` - Get activity logs (with filters)
- `POST /activity-logs` - Log activity

### Feature Flags
- `GET /feature-flags` - Get all feature flags
- `GET /feature-flags/enabled/:role` - Get enabled flags for role
- `GET /feature-flags/check/:featureKey` - Check if feature is enabled
- `PUT /feature-flags/:featureKey/toggle` - Toggle feature flag
- `POST /feature-flags` - Create feature flag
- `PUT /feature-flags/:id` - Update feature flag

## 🛠 Development

### Code Style
- ESLint is configured for code quality
- Follow React best practices
- Use functional components with hooks
- Maintain consistent naming conventions

### Adding New Features
1. Create service functions in `src/services/`
2. Add API endpoints in `server/src/index.js`
3. Create service logic in `server/src/services/`
4. Update database schema if needed
5. Add frontend pages/components
6. Update routes in `src/routes/index.jsx`

### Database Migrations
When adding new database fields:
1. Create migration script in `server/database/`
2. Add migration command to `server/package.json`
3. Test migration on development database
4. Document changes in migration script

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MariaDB is running: `sudo systemctl status mariadb`
- Check `.env` file has correct credentials
- Test connection: `npm run db:test` (in server directory)

### Port Already in Use
- Change `PORT` in `server/.env`
- Change `VITE_API_URL` in root `.env`
- Or kill the process using the port

### Email Not Sending
- Check SMTP configuration in `.env`
- Use Maildev for local testing: `npm run dev:all`
- Check Maildev interface at http://localhost:1080

### Module Upload Issues
- Ensure `server/uploads/modules/` directory exists
- Check file permissions
- Verify multer configuration

### Frontend Not Connecting to Backend
- Verify `VITE_API_URL` in root `.env`
- Check CORS configuration in `server/src/index.js`
- Ensure backend is running on correct port

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for modern education**
