# LMS Platform Server

Express.js API server with MariaDB database integration.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Copy `.env.example` to `.env` and update with your MariaDB credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DB_HOST` - MariaDB host (default: localhost)
- `DB_PORT` - MariaDB port (default: 3306)
- `DB_USER` - MariaDB username (default: root)
- `DB_PASSWORD` - Your MariaDB admin password
- `DB_NAME` - Database name (default: lms_platform)

### 3. Initialize Database

Run the database initialization script to create tables and default data:

```bash
npm run db:init
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Insert default admin user (username: `admin`, password: `admin`)

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

With mail server (for email testing):
```bash
npm run dev:all
```

## Database Schema

The database includes the following tables:
- `users` - Admin, faculty, and other users
- `students` - Student accounts
- `courses` - Course information
- `course_tags` - Course tags (many-to-many)
- `course_enrollments` - Student course enrollments
- `assignments` - Course assignments
- `assignment_submissions` - Student assignment submissions
- `chat_groups` - Chat groups
- `chat_group_members` - Group memberships
- `chat_group_messages` - Group chat messages
- `private_chat_threads` - Private chat threads
- `private_chat_messages` - Private chat messages

## API Endpoints

- `POST /auth/login` - User authentication
- `GET /students` - Get all students
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /assignments` - Get all assignments
- `POST /assignments` - Create new assignment
- `PUT /assignments/:id` - Update assignment
- `POST /assignments/:id/submit` - Submit assignment

## Default Admin Credentials

- Username: `admin`
- Password: `admin`

**⚠️ Change the default admin password in production!**

