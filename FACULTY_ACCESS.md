# How to Access Faculty Dashboard

## Quick Start

### Option 1: Use the Default Faculty Account (Recommended)

1. **Create the faculty user** by running:
   ```bash
   cd server
   npm run db:create-faculty
   ```

2. **Login credentials:**
   - **Username:** `faculty`
   - **Password:** `faculty`
   - **Email:** `faculty@lumina.edu`

3. **Access the login page:**
   - Open your browser and go to: `http://localhost:5173/login`
   - Enter the credentials above
   - Click "Sign in"

4. **You'll be redirected to the Faculty Dashboard** with all faculty features!

---

### Option 2: Create Faculty User via SQL

If you prefer to create a faculty user manually, you can run this SQL command in your MariaDB:

```sql
INSERT INTO users (id, username, password, role, name, email) 
VALUES ('faculty-1', 'faculty', 'faculty', 'faculty', 'Dr. Sarah Johnson', 'faculty@lumina.edu');
```

Then login with:
- **Username:** `faculty`
- **Password:** `faculty`

---

### Option 3: Create Faculty User via Admin Panel

1. **Login as Admin:**
   - Username: `admin`
   - Password: `admin`

2. **Go to Admin Panel** (if you have a user management interface)

3. **Create a new user** with role `faculty`

---

## Faculty Features Available

Once logged in as faculty, you'll have access to:

### 📊 **Faculty Dashboard**
- View your assigned courses
- See pending submissions to grade
- Quick access to all faculty tools

### 📝 **Grade Submissions**
- Review student assignment submissions
- Grade assignments (0-100%)
- Provide feedback to students
- Access via: Sidebar → "Grade Submissions"

### 📚 **My Courses**
- View all courses you're teaching
- See student enrollment counts
- Access course details
- Access via: Sidebar → "My Courses"

### 👥 **Student Roster**
- View all students enrolled in your courses
- Filter by course
- Send messages to students
- Access via: Sidebar → "Student Roster"

### ➕ **Create Assignment**
- Create new assignments for your courses
- Set due dates and descriptions
- Access via: Sidebar → "Create Assignment" or from Assignments page

### 📧 **Mailbox**
- Send announcements to students
- Receive messages from students and admin

### 📅 **Calendar**
- View and create calendar events
- Link events to assignments

### 👤 **Profile**
- Edit your profile information
- Upload profile picture
- Download Faculty ID Card (PDF)

---

## Important Notes

1. **Course Assignment:** For faculty features to work properly, courses need to have the faculty member's name as the `instructor`. The system matches courses to faculty by:
   - Exact name match, OR
   - First name match

2. **To Assign Courses to Faculty:**
   - Login as admin
   - Go to Course Management
   - Edit a course and set the `instructor` field to match the faculty member's name (e.g., "Dr. Sarah Johnson" or "Sarah Johnson")

3. **Default Faculty User:**
   - Name: Dr. Sarah Johnson
   - Username: faculty
   - Password: faculty
   - Email: faculty@lumina.edu

---

## Troubleshooting

### Can't Login?
- Make sure the database is initialized: `npm run db:init`
- Make sure the faculty user exists: `npm run db:create-faculty`
- Check your database connection in `server/.env`

### No Courses Showing?
- Make sure courses have the faculty member's name as the instructor
- The instructor name should match the faculty user's name (case-insensitive)

### Can't See Submissions?
- Students need to submit assignments first
- Make sure assignments are linked to courses where you're the instructor

---

## Need Help?

If you encounter any issues:
1. Check the server console for error messages
2. Verify database connection: `npm run db:test`
3. Check that MariaDB is running
4. Ensure `.env` file has correct database credentials

