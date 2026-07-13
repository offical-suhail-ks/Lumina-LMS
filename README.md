# 🎓 Lumina LMS - Learning Management System

A comprehensive, modern Learning Management System with a React frontend and an ASP.NET Core backend, designed to streamline educational workflows for administrators, faculty, students, and accounting staff.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Backend](https://img.shields.io/badge/backend-.NET%208-512BD4.svg)
![Database](https://img.shields.io/badge/database-PostgreSQL%20(Neon)-336791.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

> **Backend migration note**: The API was ported from Node/Express to **ASP.NET Core 8 + EF Core**, and the database moved from Supabase to **Neon Postgres**. The original Node backend (`server/`, `api/`) is kept in the repo for reference but is no longer the active backend — see [Backend migration](#-backend-migration) below.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#️-environment-setup)
- [Database Setup](#️-database-setup)
- [Running the Project](#️-running-the-project)
- [Project Structure](#-project-structure)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Backend Migration](#-backend-migration)
- [Troubleshooting](#-troubleshooting)

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
- **Quizzes & Exams**: Quiz creation, attempts, and auto-grading
- **Discussion Forum**: Course-based discussion threads and Q&A
- **Video Library**: Upload and manage course videos with progress tracking
- **Analytics Dashboard**: Advanced analytics for students, courses, and system-wide metrics
- **Certificates**: Digital certificate generation and verification
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
- **Content Management**: Quiz and exam creation, video upload and management, certificate issuance, forum management

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

### 💰 Accounting Features

- **Fee Setup**: Review new-student fee-setup tasks and configure course fee, payment plan, and due dates
- **Task Workflow**: Send completed fee setups to admin for review; admin can accept, reject, or send back
- **Salary Management**: Manage faculty/staff salary records and salary payments

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **jsPDF** - PDF generation

### Backend (`dotnet-server/`) — active
- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core 8** + **Npgsql** - ORM / PostgreSQL provider
- **PostgreSQL (Neon)** - Database
- **JWT Bearer Authentication** - Real token-based auth with role claims
- **BCrypt.Net-Next** - Password hashing
- **MailKit** - Email sending (SMTP, with a console-logging fallback for local dev)
- **Swagger / Swashbuckle** - Interactive API docs

### Legacy backend (`server/`, `api/`) — kept for reference, not active
- Node.js, Express.js, PostgreSQL (Supabase), Nodemailer, Multer — see [Backend migration](#-backend-migration)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) and **npm** (v9 or higher) — for the frontend
- **.NET 8 SDK** (`dotnet --list-sdks` should list `8.0.x`) — for the backend
- **A PostgreSQL database** — this project runs on [Neon](https://neon.tech) (free tier works), but any Postgres 14+ host works
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Lumina-LMS
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Restore Backend Dependencies

```bash
cd dotnet-server
dotnet restore
cd ..
```

## ⚙️ Environment Setup

### 1. Backend secrets (`dotnet-server/`)

Nothing sensitive is committed to the repo. Configure secrets via `dotnet user-secrets` (recommended for local dev):

```bash
cd dotnet-server/src/LuminaLms.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Postgres" "<your Neon/Postgres connection string>"
dotnet user-secrets set "Jwt:Secret" "<at least 32 random bytes>"

# optional — omit Smtp:Host and emails are logged to the console instead of sent
dotnet user-secrets set "Smtp:Host" "smtp.example.com"
dotnet user-secrets set "Smtp:User" "..."
dotnet user-secrets set "Smtp:Pass" "..."
```

The connection string accepts either a `postgres://user:pass@host/db?sslmode=require` URI (what Neon gives you by default) or the classic `Host=...;Database=...;Username=...;Password=...` form — both are normalized automatically.

Full configuration reference (all keys, defaults, env-var equivalents) is in [`dotnet-server/README.md`](dotnet-server/README.md#configuration-reference).

### 2. Frontend `.env.local` (Root Directory)

**Location**: `Lumina-LMS/.env.local`

```env
VITE_API_URL=http://localhost:5245
```

Point this at whatever port the backend is actually listening on (see [Running the Project](#️-running-the-project)).

## 🗄️ Database Setup

The database is **PostgreSQL on Neon**, and the schema is defined by EF Core migrations in `dotnet-server/src/LuminaLms.Infrastructure/Persistence/Migrations` — not by hand-written SQL scripts.

### 1. Apply the schema

```bash
cd dotnet-server/src/LuminaLms.Api
dotnet ef database update --project ../LuminaLms.Infrastructure --startup-project .
```

This creates all 40 tables, 27 Postgres enum types, indexes, and foreign keys.

### 2. Seed default accounts

The migration does **not** insert data. Seed the default admin/faculty/accounting accounts and feature flags by setting one config value (idempotent — safe to leave on):

```bash
dotnet user-secrets set "Database:SeedOnStartup" "true"
```

Then start the backend once (see below) — it inserts the seed rows on boot and can safely stay enabled afterward.

### 3. Default Users

- **Admin**: username `admin`, password `admin`
- **Faculty**: username `faculty`, password `faculty`
- **Accounting**: username `accounting`, password `accounting`

Unlike the legacy Node backend, these passwords are **bcrypt-hashed** at seed time, not stored in plaintext.

**⚠️ Change default passwords before any real deployment.**

## ▶️ Running the Project

### Development Mode

**Terminal 1 — Backend:**
```bash
cd dotnet-server
dotnet run --project src/LuminaLms.Api
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5245 (or https://localhost:7187)
- **Swagger UI** (interactive API docs): http://localhost:5245/swagger — opens automatically in dev

### Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin` |
| Faculty | `faculty` | `faculty` |
| Accounting | `accounting` | `accounting` |

## 📁 Project Structure

```
Lumina-LMS/
├── src/                          # Frontend source code
│   ├── components/               # Reusable React components
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   ├── faculty/              # Faculty pages
│   │   ├── students/             # Student pages
│   │   └── ...
│   ├── services/                 # API service functions (axios → backend)
│   ├── store/                    # Redux store
│   ├── routes/                   # Route definitions
│   └── lib/
│       └── supabase.js           # Unused post-migration; kept for reference
│
├── dotnet-server/                 # ★ Active backend — ASP.NET Core 8 + EF Core
│   ├── LuminaLms.sln
│   ├── database/
│   │   └── consolidated-schema.sql   # Reference doc only — EF migrations are the real schema source
│   └── src/
│       ├── LuminaLms.Domain/          # Entities + enums
│       ├── LuminaLms.Application/     # DTOs + service interfaces, organized by feature
│       ├── LuminaLms.Infrastructure/  # EF Core, JWT, BCrypt, email, file storage
│       └── LuminaLms.Api/             # Controllers, Program.cs, appsettings
│   └── README.md                  # Full backend documentation
│
├── server/                        # Legacy Node/Express backend — reference only, not active
│   ├── src/
│   └── database/
├── api/                            # Legacy Vercel serverless wrapper for server/ — not active
│
├── .env.local                      # Frontend environment variables (gitignored)
├── package.json                    # Frontend dependencies
└── README.md                       # This file
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage students, faculty, accounting staff, courses, and assignments
- View and manage all fees
- Send payment reminders
- Review and approve/reject student applications, trigger offer letters
- System configuration (feature flags, activity logs, analytics)

### Faculty
- View courses in their department
- Create and manage course modules, upload study materials
- Create assignments, grade submissions
- View student rosters, mark attendance
- Send messages to students

### Student
- View enrolled courses, access modules and materials
- Submit assignments, view grades and feedback
- Make fee payments, view payment history
- Update profile
- Take quizzes, participate in forums, watch videos, earn certificates and achievements

### Accounting
- View and manage accounting (fee-setup) tasks
- Configure student payment plans and due dates
- Send completed tasks to admin for review
- Manage faculty/staff salaries and salary payments

## 📡 API Documentation

The full, always-current API surface is available as **Swagger UI** at `/swagger` when the backend is running, or as raw OpenAPI JSON at `/swagger/v1/swagger.json`. 119 operations across 20+ modules — the summary below covers the core ones.

### Authentication
- `POST /auth/login` — returns a real JWT (`{ token, user }`)
- `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/verify-reset-token`

### Students
- `GET /students` · `GET /students/{id}` · `POST /students` · `PUT /students/{id}` · `DELETE /students/{id}`

### Courses
- `GET /courses` · `GET /courses/{id}` · `POST /courses` · `PUT /courses/{id}` · `DELETE /courses/{id}`
- `POST /courses/{courseId}/enroll` · `DELETE /courses/{courseId}/enroll/{studentId}`

### Accounting Tasks
- `GET /accounting/tasks` · `GET /accounting/tasks/{id}`
- `POST /accounting/tasks/{id}/send-to-admin` · `POST /accounting/tasks/{id}/complete` · `POST /accounting/tasks/{id}/review`

### Feature Flags
- `GET /feature-flags` · `GET /feature-flags/check/{featureKey}` · `PUT /feature-flags/{featureKey}/toggle`

Every request except login/registration-style public endpoints requires an `Authorization: Bearer <token>` header — unlike the legacy backend, this is now actually enforced (see below).

## 🔁 Backend Migration

This project's backend was rewritten from Node/Express to **ASP.NET Core 8**, and the database moved from **Supabase to Neon**. Key differences, most of them bug fixes rather than pure rewrites:

- **Real authentication.** The legacy backend's `/auth/login` returned a random UUID as the "token," and its auth middleware was a pass-through stub — nothing actually checked it. The new backend issues real signed JWTs and enforces `[Authorize]` + role checks on every endpoint.
- **Passwords are hashed.** The legacy backend stored passwords in **plaintext**. The new one uses BCrypt, with existing plaintext rows lazily upgraded to a hash on next successful login.
- **Several latent bugs fixed**: MySQL-only SQL syntax that silently failed on Postgres, a missing unique constraint that broke quiz-answer resubmission, a role/audience string mismatch that meant targeted announcements never reached students or parents, N+1 query patterns, and un-transacted multi-step writes. Full list in [`dotnet-server/README.md`](dotnet-server/README.md#behavioral-differences-from-the-source-node-app).
- **Full route parity**, verified by diffing every route in the old `server/src/index.js` against the new backend's live route table: 118/118 original routes present, plus one addition (`GET /students/{id}`).

`server/` and `api/` remain in the repository for reference (in case anything needs to be cross-checked against the original implementation) but are **not** wired up to anything — the frontend talks to `dotnet-server/` exclusively. See [`dotnet-server/README.md`](dotnet-server/README.md) for full backend documentation, architecture, and conventions.

## 🐛 Troubleshooting

### Backend won't start — "Missing ConnectionStrings:Postgres configuration"
- You haven't set the connection string. Run the `dotnet user-secrets set "ConnectionStrings:Postgres" "..."` command in [Environment Setup](#️-environment-setup).

### Backend won't start — "Missing Jwt:Secret configuration"
- Same as above, for `Jwt:Secret`.

### `dotnet ef` command not found
- Install it once: `dotnet tool install --global dotnet-ef`, then ensure `%USERPROFILE%\.dotnet\tools` is on your `PATH`.

### Login fails with a 500 and "transient failure" in the response
- The backend can't reach Postgres. If you're on Neon's free tier, the compute may have auto-suspended after inactivity — the first request after idle can take a few seconds to cold-start; retry once.

### Frontend gets CORS or connection-refused errors
- Confirm the backend is actually running and that `VITE_API_URL` in `.env.local` matches its port exactly (`http://localhost:5245` by default).

### `GET /students` (or similar) returns 401
- Expected — that endpoint requires a Bearer token now. Log in via `POST /auth/login` first and make sure the frontend is attaching the returned token to subsequent requests.

### Module/assignment/video upload issues
- Confirm `dotnet-server/uploads/` is writable — it's created automatically on first upload, but check `Storage:RootPath` if you've overridden it.

## 📝 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for modern education**
