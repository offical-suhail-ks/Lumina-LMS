/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const assignmentService = {
  async getAll() {
    const assignments = await query(
      `SELECT 
        a.id, a.title, a.course_id as courseId, a.description, 
        a.due_date as dueDate, a.created_at as createdAt, a.updated_at as updatedAt
      FROM assignments a
      ORDER BY a.due_date DESC, a.created_at DESC`
    );

    // Get submissions for each assignment
    for (const assignment of assignments) {
      const submissions = await query(
        `SELECT 
          s.id, s.student_id as studentId, s.notes, s.artifact_name as artifactName,
          s.grade, s.feedback, s.graded_by as gradedBy, s.graded_at as gradedAt,
          s.submitted_at as submittedAt
        FROM assignment_submissions s
        WHERE s.assignment_id = ?
        ORDER BY s.submitted_at DESC`,
        [assignment.id]
      );
      assignment.submissions = submissions;
    }

    return assignments;
  },

  async getById(id) {
    const [assignment] = await query(
      `SELECT 
        a.id, a.title, a.course_id as courseId, a.description, 
        a.due_date as dueDate, a.created_at as createdAt, a.updated_at as updatedAt
      FROM assignments a
      WHERE a.id = ?`,
      [id]
    );

    if (!assignment) return null;

    const submissions = await query(
      `SELECT 
        s.id, s.student_id as studentId, s.notes, s.artifact_name as artifactName,
        s.submitted_at as submittedAt
      FROM assignment_submissions s
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC`,
      [id]
    );
    assignment.submissions = submissions;

    return assignment;
  },

  async create(assignmentData) {
    const id = `assignment-${uuid()}`;
    const { title, courseId, description, dueDate } = assignmentData;

    // Format datetime to proper format (extract date/time from ISO string if needed)
    const formatDateTime = (dateValue) => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') {
        // If it's an ISO string, convert to MySQL DATETIME format
        if (dateValue.includes('T')) {
          // Remove timezone and milliseconds, keep date and time
          return dateValue.replace(/\.\d{3}Z?$/, '').replace('Z', '');
        }
        return dateValue;
      }
      return null;
    };

    await query(
      `INSERT INTO assignments (id, title, course_id, description, due_date)
      VALUES (?, ?, ?, ?, ?)`,
      [id, title, courseId, description || null, formatDateTime(dueDate)]
    );

    return this.getById(id);
  },

  async update(id, assignmentData) {
    const { title, courseId, description, dueDate } = assignmentData;

    // Format datetime to proper format (extract date/time from ISO string if needed)
    const formatDateTime = (dateValue) => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') {
        // If it's an ISO string, convert to MySQL DATETIME format
        if (dateValue.includes('T')) {
          // Remove timezone and milliseconds, keep date and time
          return dateValue.replace(/\.\d{3}Z?$/, '').replace('Z', '');
        }
        return dateValue;
      }
      return null;
    };

    await query(
      `UPDATE assignments SET
        title = COALESCE(?, title),
        course_id = COALESCE(?, course_id),
        description = ?,
        due_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, courseId, description, formatDateTime(dueDate), id]
    );

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM assignments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async submit(assignmentId, submissionData) {
    const id = `submission-${uuid()}`;
    const { studentId, notes, artifactName } = submissionData;

    await query(
      `INSERT INTO assignment_submissions (id, assignment_id, student_id, notes, artifact_name)
      VALUES (?, ?, ?, ?, ?)`,
      [id, assignmentId, studentId, notes || null, artifactName || null]
    );

    return {
      id,
      studentId,
      notes: notes || null,
      artifactName: artifactName || null,
      submittedAt: new Date().toISOString(),
    };
  },

  async gradeSubmission(submissionId, gradeData) {
    const { grade, feedback, gradedBy } = gradeData;

    await query(
      `UPDATE assignment_submissions SET
        grade = ?,
        feedback = ?,
        graded_by = ?,
        graded_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [grade, feedback || null, gradedBy || null, submissionId]
    );

    const [submission] = await query(
      `SELECT 
        s.id, s.assignment_id as assignmentId, s.student_id as studentId, 
        s.notes, s.artifact_name as artifactName, s.grade, s.feedback,
        s.graded_by as gradedBy, s.graded_at as gradedAt,
        s.submitted_at as submittedAt
      FROM assignment_submissions s
      WHERE s.id = ?`,
      [submissionId]
    );

    return submission || null;
  },
};

module.exports = assignmentService;

