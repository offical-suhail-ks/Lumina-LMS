/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const courseService = {
  async getAll() {
    const courses = await query(
      `SELECT 
        c.id, c.title, c.description, c.instructor, c.department,
        c.start_date as startDate, c.end_date as endDate, c.total_years as totalYears,
        c.capacity, c.created_at as createdAt, c.updated_at as updatedAt
      FROM courses c
      ORDER BY c.created_at DESC`
    );

    // Get tags and enrollments for each course
    for (const course of courses) {
      const tags = await query('SELECT tag FROM course_tags WHERE course_id = ?', [course.id]);
      course.tags = tags.map(t => t.tag);

      const enrollments = await query('SELECT student_id FROM course_enrollments WHERE course_id = ?', [course.id]);
      course.enrolled = enrollments.map(e => e.student_id);
    }

    return courses;
  },

  async getById(id) {
    const [course] = await query(
      `SELECT 
        c.id, c.title, c.description, c.instructor, c.department,
        c.start_date as startDate, c.end_date as endDate, c.total_years as totalYears,
        c.capacity, c.created_at as createdAt, c.updated_at as updatedAt
      FROM courses c
      WHERE c.id = ?`,
      [id]
    );

    if (!course) return null;

    const tags = await query('SELECT tag FROM course_tags WHERE course_id = ?', [id]);
    course.tags = tags.map(t => t.tag);

    const enrollments = await query('SELECT student_id FROM course_enrollments WHERE course_id = ?', [id]);
    course.enrolled = enrollments.map(e => e.student_id);

    return course;
  },

  async create(courseData) {
    const id = `course-${uuid()}`;
    const { title, description, instructor, department, startDate, endDate, totalYears, capacity, tags, enrolled } = courseData;

    // Format dates to YYYY-MM-DD format (extract date part from ISO string if needed)
    const formatDate = (dateValue) => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') {
        // If it's an ISO string, extract just the date part
        if (dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        return dateValue;
      }
      return null;
    };

    await query(
      `INSERT INTO courses (id, title, description, instructor, department, start_date, end_date, total_years, capacity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, instructor, department || null, formatDate(startDate), formatDate(endDate), totalYears || null, capacity || 30]
    );

    // Insert tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        await query('INSERT INTO course_tags (course_id, tag) VALUES (?, ?)', [id, tag]);
      }
    }

    // Insert enrollments
    if (enrolled && Array.isArray(enrolled)) {
      for (const studentId of enrolled) {
        await query('INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)', [id, studentId]);
      }
    }

    return this.getById(id);
  },

  async update(id, courseData) {
    const { title, description, instructor, department, startDate, endDate, totalYears, capacity, tags, enrolled } = courseData;

    // Format dates to YYYY-MM-DD format (extract date part from ISO string if needed)
    const formatDate = (dateValue) => {
      if (!dateValue) return null;
      if (typeof dateValue === 'string') {
        // If it's an ISO string, extract just the date part
        if (dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        return dateValue;
      }
      return null;
    };

    await query(
      `UPDATE courses SET
        title = COALESCE(?, title),
        description = ?,
        instructor = COALESCE(?, instructor),
        department = ?,
        start_date = ?,
        end_date = ?,
        total_years = ?,
        capacity = COALESCE(?, capacity),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, description, instructor, department || null, formatDate(startDate), formatDate(endDate), totalYears ? Number(totalYears) : null, capacity || null, id]
    );

    // Update tags
    if (tags !== undefined) {
      await query('DELETE FROM course_tags WHERE course_id = ?', [id]);
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          await query('INSERT INTO course_tags (course_id, tag) VALUES (?, ?)', [id, tag]);
        }
      }
    }

    // Update enrollments
    if (enrolled !== undefined) {
      await query('DELETE FROM course_enrollments WHERE course_id = ?', [id]);
      if (Array.isArray(enrolled)) {
        for (const studentId of enrolled) {
          await query('INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)', [id, studentId]);
        }
      }
    }

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = courseService;

