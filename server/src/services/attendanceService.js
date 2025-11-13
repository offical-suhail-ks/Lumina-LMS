/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

// Helper function to check if today is a class day based on schedule
function isClassDayToday(scheduleType) {
  if (!scheduleType) return false;
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  switch (scheduleType.toLowerCase()) {
    case 'daily':
      // Monday to Friday (1-5)
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekend':
      // Saturday and Sunday (0, 6)
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'mwf':
      // Monday, Wednesday, Friday (1, 3, 5)
      return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case 'tts':
      // Tuesday, Thursday, Saturday (2, 4, 6)
      return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
    default:
      return false;
  }
}

// Helper function to calculate expected classes per month based on schedule
function calculateExpectedClassesPerMonth(scheduleType, year = null, month = null) {
  if (!scheduleType) return 0;
  
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== null ? month : now.getMonth(); // 0-11
  
  // Get first and last day of the month
  const firstDay = new Date(targetYear, targetMonth, 1);
  const lastDay = new Date(targetYear, targetMonth + 1, 0);
  
  let expectedClasses = 0;
  
  // Count class days in the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(targetYear, targetMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    switch (scheduleType.toLowerCase()) {
      case 'daily':
        // Monday to Friday (1-5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          expectedClasses++;
        }
        break;
      case 'weekend':
        // Saturday and Sunday (0, 6)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          expectedClasses++;
        }
        break;
      case 'mwf':
        // Monday, Wednesday, Friday (1, 3, 5)
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
          expectedClasses++;
        }
        break;
      case 'tts':
        // Tuesday, Thursday, Saturday (2, 4, 6)
        if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
          expectedClasses++;
        }
        break;
    }
  }
  
  return expectedClasses;
}

const attendanceService = {
  // Get students for a faculty's department
  async getDepartmentStudents(facultyId) {
    // Get faculty's department
    const [faculty] = await query(
      `SELECT department FROM users WHERE id = ? AND role = 'faculty'`,
      [facultyId]
    );
    
    if (!faculty || !faculty.department) {
      console.log(`Faculty ${facultyId} has no department assigned`);
      return [];
    }
    
    // Get all courses in the faculty's department
    const courses = await query(
      `SELECT id FROM courses WHERE department = ?`,
      [faculty.department]
    );
    
    if (courses.length === 0) {
      console.log(`No courses found for department: ${faculty.department}`);
      // Return empty array if no courses in department
      return [];
    }
    
    const courseIds = courses.map(c => c.id);
    
    // If no course IDs, return empty
    if (courseIds.length === 0) {
      return [];
    }
    
    const placeholders = courseIds.map(() => '?').join(',');
    
    // Get all students enrolled in those courses
    const students = await query(
      `SELECT 
        s.id, s.first_name as firstName, s.last_name as lastName, 
        s.email, s.course_id as courseId, s.batch_timing as batchTiming,
        s.class_schedule as classSchedule, s.status,
        c.title as courseTitle, c.department
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.course_id IN (${placeholders}) AND s.status = 'active'
      ORDER BY s.first_name, s.last_name`,
      courseIds
    );
    
    console.log(`Found ${students.length} students in department ${faculty.department}`);
    
    // Return all active students from the department
    // The frontend will handle showing only those with class today if needed
    return students;
  },
  
  // Get attendance for a specific date
  async getAttendanceByDate(date, facultyId = null) {
    let sql = `
      SELECT 
        a.id, a.student_id as studentId, a.faculty_id as facultyId,
        a.attendance_date as attendanceDate, a.status, a.notes,
        a.marked_at as markedAt,
        s.first_name as firstName, s.last_name as lastName,
        s.email, s.batch_timing as batchTiming, s.class_schedule as classSchedule,
        u.name as facultyName
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON a.faculty_id = u.id
      WHERE a.attendance_date = ?
    `;
    
    const params = [date];
    if (facultyId) {
      sql += ' AND a.faculty_id = ?';
      params.push(facultyId);
    }
    
    sql += ' ORDER BY s.first_name, s.last_name';
    
    return await query(sql, params);
  },
  
  // Mark attendance for students
  async markAttendance(attendanceData) {
    const { studentId, facultyId, attendanceDate, status, notes } = attendanceData;
    
    // Check if attendance already exists
    const [existing] = await query(
      `SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?`,
      [studentId, attendanceDate]
    );
    
    if (existing) {
      // Update existing attendance
      await query(
        `UPDATE attendance 
        SET status = ?, notes = ?, faculty_id = ?, marked_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [status, notes || null, facultyId, existing.id]
      );
      return this.getAttendanceById(existing.id);
    } else {
      // Create new attendance
      const id = `attendance-${uuid()}`;
      await query(
        `INSERT INTO attendance (id, student_id, faculty_id, attendance_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id, studentId, facultyId, attendanceDate, status, notes || null]
      );
      return this.getAttendanceById(id);
    }
  },
  
  // Mark attendance for multiple students
  async markBulkAttendance(attendanceList, facultyId, attendanceDate) {
    const results = [];
    
    for (const item of attendanceList) {
      const result = await this.markAttendance({
        studentId: item.studentId,
        facultyId,
        attendanceDate,
        status: item.status,
        notes: item.notes,
      });
      results.push(result);
    }
    
    return results;
  },
  
  // Get attendance by ID
  async getAttendanceById(id) {
    const [attendance] = await query(
      `SELECT 
        a.id, a.student_id as studentId, a.faculty_id as facultyId,
        a.attendance_date as attendanceDate, a.status, a.notes,
        a.marked_at as markedAt, a.created_at as createdAt,
        s.first_name as firstName, s.last_name as lastName,
        s.email, s.batch_timing as batchTiming, s.class_schedule as classSchedule,
        u.name as facultyName
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON a.faculty_id = u.id
      WHERE a.id = ?`,
      [id]
    );
    return attendance || null;
  },
  
  // Get student's attendance summary
  async getStudentAttendanceSummary(studentId) {
    // Get student's schedule information
    const [student] = await query(
      `SELECT class_schedule as classSchedule FROM students WHERE id = ?`,
      [studentId]
    );
    
    const scheduleType = student?.classSchedule || null;
    
    // Get current month's attendance
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
    
    // Get monthly attendance
    const [monthlySummary] = await query(
      `SELECT 
        COUNT(*) as totalClasses,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance
      WHERE student_id = ? 
        AND attendance_date >= ? 
        AND attendance_date <= ?`,
      [studentId, firstDayStr, lastDayStr]
    );
    
    // Get all-time attendance
    const [allTimeSummary] = await query(
      `SELECT 
        COUNT(*) as totalClasses,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused
      FROM attendance
      WHERE student_id = ?`,
      [studentId]
    );
    
    // Convert BigInt values to Number (MariaDB returns COUNT/SUM as BigInt)
    const monthlyTotal = Number(monthlySummary?.totalClasses || 0);
    const monthlyPresent = Number(monthlySummary?.present || 0);
    const monthlyAbsent = Number(monthlySummary?.absent || 0);
    const monthlyLate = Number(monthlySummary?.late || 0);
    const monthlyExcused = Number(monthlySummary?.excused || 0);
    
    const allTimeTotal = Number(allTimeSummary?.totalClasses || 0);
    const allTimePresent = Number(allTimeSummary?.present || 0);
    const allTimeAbsent = Number(allTimeSummary?.absent || 0);
    const allTimeLate = Number(allTimeSummary?.late || 0);
    const allTimeExcused = Number(allTimeSummary?.excused || 0);
    
    // Calculate expected classes for current month
    const expectedClassesThisMonth = scheduleType 
      ? calculateExpectedClassesPerMonth(scheduleType, currentYear, currentMonth)
      : 0;
    
    // Calculate monthly attendance percentage
    const monthlyAttendancePercentage = expectedClassesThisMonth > 0
      ? ((monthlyPresent + monthlyLate + monthlyExcused) / expectedClassesThisMonth) * 100
      : monthlyTotal > 0
      ? ((monthlyPresent + monthlyLate + monthlyExcused) / monthlyTotal) * 100
      : 0;
    
    // Calculate all-time attendance percentage
    const allTimeAttendancePercentage = allTimeTotal > 0
      ? ((allTimePresent + allTimeLate + allTimeExcused) / allTimeTotal) * 100
      : 0;
    
    return {
      // Monthly data
      monthly: {
        expectedClasses: expectedClassesThisMonth,
        totalClasses: monthlyTotal,
        present: monthlyPresent,
        absent: monthlyAbsent,
        late: monthlyLate,
        excused: monthlyExcused,
        attendancePercentage: Math.round(monthlyAttendancePercentage * 100) / 100,
      },
      // All-time data
      allTime: {
        totalClasses: allTimeTotal,
        present: allTimePresent,
        absent: allTimeAbsent,
        late: allTimeLate,
        excused: allTimeExcused,
        attendancePercentage: Math.round(allTimeAttendancePercentage * 100) / 100,
      },
      // Legacy fields for backward compatibility
      totalClasses: allTimeTotal,
      present: allTimePresent,
      absent: allTimeAbsent,
      late: allTimeLate,
      excused: allTimeExcused,
      attendancePercentage: Math.round(allTimeAttendancePercentage * 100) / 100,
    };
  },
  
  // Get all attendance records (for admin)
  async getAllAttendance(filters = {}) {
    let sql = `
      SELECT 
        a.id, a.student_id as studentId, a.faculty_id as facultyId,
        a.attendance_date as attendanceDate, a.status, a.notes,
        a.marked_at as markedAt,
        s.first_name as firstName, s.last_name as lastName,
        s.email, s.batch_timing as batchTiming, s.class_schedule as classSchedule,
        c.title as courseTitle, c.department,
        u.name as facultyName
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON a.faculty_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.studentId) {
      sql += ' AND a.student_id = ?';
      params.push(filters.studentId);
    }
    
    if (filters.facultyId) {
      sql += ' AND a.faculty_id = ?';
      params.push(filters.facultyId);
    }
    
    if (filters.startDate) {
      sql += ' AND a.attendance_date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND a.attendance_date <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }
    
    sql += ' ORDER BY a.attendance_date DESC, s.first_name, s.last_name';
    
    return await query(sql, params);
  },
  
  // Helper function exposed for use in other services
  isClassDayToday,
  calculateExpectedClassesPerMonth,
};

module.exports = attendanceService;

