# 🎓 Lumina LMS - Learning Management System

A comprehensive, modern Learning Management System built with React and Node.js, designed to streamline educational workflows for administrators, faculty, and students.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
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

- **Student Management**: Create and manage student accounts, comprehensive profiles, fee management with installment plans, offer letter generation
- **Faculty Management**: Create and manage faculty accounts, department-based assignment
- **Course Management**: Create and edit courses, department-based organization, course capacity management
- **Assignment Management**: Create assignments, set due dates, track submissions
- **Fee Management**: View all student fees, search students, send payment reminders, track payment history
- **System Management**: Activity logs monitoring, feature flag management, system analytics, review student applications
- **Content Management**: Quiz and exam creation, video upload and management, certificate template creation, forum management

### 👨‍🏫 Faculty Features

- **Course Management**: View department courses, create and manage course modules, upload study materials
- **Assignment Management**: Create assignments, view all submissions
- **Grading System**: Review submissions, grade assignments, provide feedback
- **Student Management**: View student rosters, filter by course
- **Content Creation**: Create quizzes, upload course videos, create forum discussions, issue certificates, manage attendance
- **Analytics**: View course performance metrics, track student engagement

### 👨‍🎓 Student Features

- **Course Access**: Browse and enroll in courses, view course details and modules, download study materials
- **Assignments**: View all assignments, submit assignments with files, view grades and feedback
- **Grades & Transcripts**: View all grades, access academic transcript, see course progress
- **Payment Management**: View fee details, see installment breakdown, make payments, view payment history
- **Profile Management**: Update personal information, upload display picture, download ID card
- **Learning Tools**: Take quizzes and exams, participate in discussion forums, watch course videos, view analytics, earn certificates and achievements

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Supabase Client** - Database and authentication
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (Supabase)
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **UUID** - Unique ID generation

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-reload for development
- **Concurrently** - Run multiple processes

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Supabase Account** (for PostgreSQL database)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LMS
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

## ⚙️ Environment Setup

You need **TWO separate `.env` files** in different locations:

### 1. Frontend `.env` File (Root Directory)

**Location**: `LMS/.env` (same folder as `package.json`)

**Contents**:
```env
# Supabase Configuration (for frontend)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Backend API URL (if you still use some API endpoints)
VITE_API_URL=http://localhost:4000
```

**How to get Supabase credentials:**
1. Go to your Supabase Dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Backend `.env` File (Server Directory)

**Location**: `LMS/server/.env`

**Contents**:
```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Lumina LMS <no-reply@lumina.edu>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**How to get DATABASE_URL:**
1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, select **Session mode**
5. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

## 🗄️ Database Setup

### 1. Initialize Database

The database schema and data can be imported using the migration script:

```bash
cd server
node database/complete-mysql-to-postgres-import.js
```

This will:
- Create all ENUM types
- Create all required tables with indexes
- Import all initial data
- Set up triggers for `updated_at` timestamps

### 2. Default Users

After database initialization, you'll have:
- **Admin**: username: `admin`, password: `admin`
- **Faculty**: username: `faculty`, password: `faculty` (if created)
- **Accounting**: username: `Suhail`, password: `1234` (if imported)

**⚠️ Change default passwords in production!**

## ▶️ Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

### Default Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin`

**Faculty** (if created):
- Username: `faculty`
- Password: `faculty`

## 📁 Project Structure

```
LMS/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   ├── pages/                    # Page components
│   │   ├── admin/               # Admin pages
│   │   ├── faculty/             # Faculty pages
│   │   ├── students/            # Student pages
│   │   └── ...
│   ├── services/                 # API service functions (Supabase)
│   ├── store/                    # Redux store
│   ├── routes/                   # Route definitions
│   └── lib/
│       └── supabase.js           # Supabase client initialization
│
├── server/                        # Backend source code
│   ├── src/
│   │   ├── index.js              # Express app entry point
│   │   ├── db.js                 # Database connection
│   │   ├── mailer.js             # Email service
│   │   └── services/             # Business logic services
│   ├── database/                 # Database scripts
│   │   └── complete-mysql-to-postgres-import.js  # Complete migration script
│   └── uploads/                  # Uploaded files
│
├── .env                          # Frontend environment variables
├── server/.env                   # Backend environment variables
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage students, faculty, courses, and assignments
- View and manage all fees
- Send payment reminders
- Create offer letters
- System configuration
- Review student applications

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

### Accounting
- View and manage accounting tasks
- Set up student fees
- Configure payment plans
- Send tasks to admin for review
- Complete fee setup tasks

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

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

### Accounting Tasks
- `GET /accounting/tasks` - Get all accounting tasks
- `GET /accounting/tasks/:id` - Get task by ID
- `POST /accounting/tasks/:id/send-to-admin` - Send task to admin
- `POST /accounting/tasks/:id/complete` - Complete task
- `POST /accounting/tasks/:id/review` - Review task (admin)

### Feature Flags
- `GET /feature-flags` - Get all feature flags
- `GET /feature-flags/check/:featureKey` - Check if feature is enabled
- `PUT /feature-flags/:featureKey/toggle` - Toggle feature flag

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `.env` file has correct `DATABASE_URL`
- Check Supabase project is active
- Test connection: Check server logs for connection status

### Port Already in Use
- Change `PORT` in `server/.env`
- Change `VITE_API_URL` in root `.env`
- Or kill the process using the port

### Frontend Not Connecting to Supabase
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in root `.env`
- Check `.env` file is in root directory (not in `src/` or `server/`)
- Restart frontend dev server

### Backend Not Connecting to Database
- Check `.env` file is in `server/` directory
- Verify `DATABASE_URL` is correct (check password)
- Restart backend server

### Module Upload Issues
- Ensure `server/uploads/modules/` directory exists
- Check file permissions
- Verify multer configuration

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for modern education**
