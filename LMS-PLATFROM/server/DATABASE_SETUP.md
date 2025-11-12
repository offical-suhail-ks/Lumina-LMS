# MariaDB Database Setup Guide

## Prerequisites

- MariaDB installed and running on your system
- Admin access to MariaDB (root password)

## Step-by-Step Setup

### 1. Configure Database Connection

Create a `.env` file in the `server` directory with the following content:

```env
# Server Configuration
PORT=4000

# Database Configuration (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mariadb_admin_password
DB_NAME=lms_platform

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@lumina.edu

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `your_mariadb_admin_password` with your actual MariaDB root password.

### 2. Initialize Database

Run the database initialization script:

```bash
cd server
npm run db:init
```

This script will:
- ✅ Connect to MariaDB
- ✅ Create the `lms_platform` database if it doesn't exist
- ✅ Create all required tables (users, students, courses, assignments, etc.)
- ✅ Insert default admin user (username: `admin`, password: `admin`)

### 3. Start the Server

```bash
npm run dev
```

The server will connect to MariaDB and all data will be persisted in the database.

## Database Schema

The database includes the following tables:

- **users** - Admin, faculty, and other users
- **students** - Student accounts with course and year information
- **courses** - Course information
- **course_tags** - Course tags (many-to-many)
- **course_enrollments** - Student course enrollments
- **assignments** - Course assignments
- **assignment_submissions** - Student assignment submissions
- **chat_groups** - Chat groups (if needed in future)
- **chat_group_members** - Group memberships
- **chat_group_messages** - Group chat messages
- **private_chat_threads** - Private chat threads
- **private_chat_messages** - Private chat messages

## Default Admin User

After initialization, you can log in with:
- **Username:** `admin`
- **Password:** `admin`

⚠️ **Change the default admin password in production!**

## Troubleshooting

### Authentication Plugin Error (auth_gssapi_client not supported)

If you see the error: `Client does not support authentication protocol 'auth_gssapi_client'`:

**Option 1: Use the automated fix script**
```bash
npm run db:fix-auth
```

**Option 2: Manual fix via MariaDB command line**

1. Connect to MariaDB:
```bash
mysql -u root -p
```

2. Run these commands (replace `your_password` with your actual password):
```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password');
FLUSH PRIVILEGES;
```

3. Verify the change:
```sql
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```

**Option 3: Use the SQL file**

Edit `database/fix_auth.sql`, replace `your_password_here` with your actual password, then run:
```bash
mysql -u root -p < database/fix_auth.sql
```

### Connection Error

If you see "Database connection error":
1. Make sure MariaDB is running
2. Check your `.env` file has the correct credentials
3. Verify MariaDB is accessible on the specified host and port
4. If you see authentication errors, follow the "Authentication Plugin Error" section above

### Table Already Exists

If you see "table already exists" errors, that's normal - the script will skip existing tables.

### Reset Database

To reset the database (⚠️ This will delete all data):

```bash
npm run db:reset
```

Or manually:
1. Drop the database: `DROP DATABASE lms_platform;`
2. Run `npm run db:init` again

## Testing the Connection

After starting the server, you should see:
```
✅ Database connected successfully
🚀 Lumina LMS API running on http://localhost:4000
📊 Using MariaDB database: lms_platform
```

If you see connection errors, check your MariaDB service is running and credentials are correct.

