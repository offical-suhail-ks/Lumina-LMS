/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const analyticsService = {
  async trackEvent(eventData) {
    const id = `event-${uuid()}`;
    const {
      eventType,
      userId,
      userType,
      entityType,
      entityId,
      metadata,
    } = eventData;

    await query(
      `INSERT INTO analytics_events (
        id, event_type, user_id, user_type, entity_type, entity_id, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, eventType, userId, userType, entityType, entityId,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  },

  async getStudentPerformance(studentId) {
    // Get assignment grades
    const assignmentGrades = await query(
      `SELECT 
        a.id, a.title, a.course_id as courseId,
        s.grade, s.submitted_at as submittedAt
      FROM assignments a
      INNER JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC`,
      [studentId]
    );

    // Get quiz scores
    const quizScores = await query(
      `SELECT 
        q.id, q.title, q.course_id as courseId,
        a.score, a.percentage, a.passed, a.submitted_at as submittedAt
      FROM quizzes q
      LEFT JOIN quiz_attempts a ON q.id = a.quiz_id AND a.student_id = ?
      WHERE a.student_id = ? AND a.status = 'submitted'
      ORDER BY a.submitted_at DESC`,
      [studentId, studentId]
    );

    // Calculate averages
    const assignmentAvg = assignmentGrades.length > 0
      ? assignmentGrades.reduce((sum, a) => sum + parseFloat(a.grade || 0), 0) / assignmentGrades.length
      : 0;

    const quizAvg = quizScores.length > 0
      ? quizScores.reduce((sum, q) => sum + parseFloat(q.percentage || 0), 0) / quizScores.length
      : 0;

    return {
      assignmentGrades,
      quizScores,
      assignmentAverage: assignmentAvg,
      quizAverage: quizAvg,
      overallAverage: (assignmentAvg + quizAvg) / 2,
    };
  },

  async getCourseAnalytics(courseId) {
    // Enrollment count
    const [enrollment] = await query(
      `SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = ?`,
      [courseId]
    );

    // Assignment completion rate
    const [assignmentStats] = await query(
      `SELECT 
        COUNT(DISTINCT a.id) as totalAssignments,
        COUNT(DISTINCT s.id) as totalSubmissions,
        COUNT(DISTINCT CASE WHEN s.grade IS NOT NULL THEN s.id END) as gradedSubmissions
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.course_id = ?`,
      [courseId]
    );

    // Quiz completion rate
    const [quizStats] = await query(
      `SELECT 
        COUNT(DISTINCT q.id) as totalQuizzes,
        COUNT(DISTINCT a.id) as totalAttempts,
        AVG(a.percentage) as averageScore
      FROM quizzes q
      LEFT JOIN quiz_attempts a ON q.id = a.quiz_id
      WHERE q.course_id = ? AND a.status = 'submitted'`,
      [courseId]
    );

    // Convert BigInt to Number for JSON serialization
    return {
      enrollmentCount: Number(enrollment.count),
      assignmentStats: {
        totalAssignments: Number(assignmentStats.totalAssignments),
        totalSubmissions: Number(assignmentStats.totalSubmissions),
        gradedSubmissions: Number(assignmentStats.gradedSubmissions),
      },
      quizStats: {
        totalQuizzes: Number(quizStats.totalQuizzes),
        totalAttempts: Number(quizStats.totalAttempts),
        averageScore: quizStats.averageScore ? Number(quizStats.averageScore) : null,
      },
    };
  },

  async getSystemAnalytics() {
    // Total students
    const [studentCount] = await query(
      `SELECT COUNT(*) as count FROM students WHERE status = 'active'`
    );

    // Total courses
    const [courseCount] = await query(`SELECT COUNT(*) as count FROM courses`);

    // Total assignments
    const [assignmentCount] = await query(`SELECT COUNT(*) as count FROM assignments`);

    // Total submissions
    const [submissionCount] = await query(`SELECT COUNT(*) as count FROM assignment_submissions`);

    // Recent activity
    const recentActivity = await query(
      `SELECT 
        event_type as eventType, COUNT(*) as count,
        DATE(created_at) as date
      FROM analytics_events
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY event_type, DATE(created_at)
      ORDER BY date DESC, count DESC
      LIMIT 20`
    );

    // Convert BigInt to Number for JSON serialization
    return {
      studentCount: Number(studentCount.count),
      courseCount: Number(courseCount.count),
      assignmentCount: Number(assignmentCount.count),
      submissionCount: Number(submissionCount.count),
      recentActivity: recentActivity.map(item => ({
        ...item,
        count: Number(item.count),
      })),
    };
  },
};

module.exports = analyticsService;

