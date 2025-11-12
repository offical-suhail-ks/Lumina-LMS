/* eslint-env node */

const { query, transaction } = require('../db');
const { v4: uuid } = require('uuid');

const studentService = {
  async getAll() {
    const students = await query(
      `SELECT 
        s.id, s.first_name as firstName, s.last_name as lastName, s.email, s.username,
        s.course_id as courseId, s.year, s.cohort, s.status,
        s.guardian_name as guardianName, s.guardian_email as guardianEmail, s.guardian_phone as guardianPhone,
        s.created_at as createdAt, s.updated_at as updatedAt
      FROM students s
      ORDER BY s.created_at DESC`
    );
    return students.map(student => {
      const { guardianName, guardianEmail, guardianPhone, ...rest } = student;
      return {
        ...rest,
        guardian: guardianName
          ? {
              name: guardianName,
              email: guardianEmail,
              phone: guardianPhone,
            }
          : null,
      };
    });
  },

  async getById(id) {
    const [student] = await query(
      `SELECT 
        s.id, s.first_name as firstName, s.last_name as lastName, 
        s.email, s.username, s.phone, s.date_of_birth as dateOfBirth,
        s.address, s.city, s.state, s.country, s.postal_code as postalCode,
        s.course_id as courseId, s.year, s.cohort, s.status,
        s.course_fee as courseFee, s.payment_plan as paymentPlan, s.payment_plan_details as paymentPlanDetails,
        s.fee_due_date as feeDueDate, s.send_reminder as sendReminder,
        s.guardian_name as guardianName, s.guardian_email as guardianEmail, s.guardian_phone as guardianPhone,
        s.created_at as createdAt, s.updated_at as updatedAt
      FROM students s
      WHERE s.id = ?`,
      [id]
    );
    if (!student) return null;
    const { guardianName, guardianEmail, guardianPhone, ...rest } = student;
    return {
      ...rest,
      guardian: guardianName
        ? {
            name: guardianName,
            email: guardianEmail,
            phone: guardianPhone,
          }
        : null,
    };
  },

  async create(studentData) {
    const id = `student-${uuid()}`;
    const { 
      firstName, lastName, email, password, 
      phone, dateOfBirth, address, city, state, country, postalCode,
      courseId, year, cohort, 
      courseFee, paymentPlan, paymentPlanDetails,
      feeDueDate, sendReminder,
      guardian 
    } = studentData;

    // Format date to YYYY-MM-DD format (extract date part from ISO string if needed)
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
      `INSERT INTO students (
        id, first_name, last_name, email, username, password, 
        phone, date_of_birth, address, city, state, country, postal_code,
        course_id, year, cohort, 
        course_fee, payment_plan, payment_plan_details,
        fee_due_date, send_reminder,
        guardian_name, guardian_email, guardian_phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        firstName,
        lastName,
        email,
        email, // username = email
        password,
        phone || null,
        formatDate(dateOfBirth),
        address || null,
        city || null,
        state || null,
        country || null,
        postalCode || null,
        courseId || null,
        year || null,
        cohort || null,
        courseFee || null,
        paymentPlan || null,
        paymentPlanDetails || null,
        formatDate(feeDueDate),
        sendReminder !== undefined ? (sendReminder ? 1 : 0) : 1,
        guardian?.name || null,
        guardian?.email || null,
        guardian?.phone || null,
        'active',
      ]
    );

    return this.getById(id);
  },

  async update(id, studentData) {
    const {
      firstName, lastName, email,
      phone, dateOfBirth, address, city, state, country, postalCode,
      courseId, year, cohort, status,
      courseFee, paymentPlan, paymentPlanDetails,
      feeDueDate, sendReminder,
      guardian
    } = studentData;

    // Format date to YYYY-MM-DD format (extract date part from ISO string if needed)
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
      `UPDATE students SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = ?,
        date_of_birth = ?,
        address = ?,
        city = ?,
        state = ?,
        country = ?,
        postal_code = ?,
        course_id = ?,
        year = ?,
        cohort = ?,
        status = COALESCE(?, status),
        course_fee = ?,
        payment_plan = ?,
        payment_plan_details = ?,
        fee_due_date = ?,
        send_reminder = COALESCE(?, send_reminder),
        guardian_name = ?,
        guardian_email = ?,
        guardian_phone = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        formatDate(dateOfBirth),
        address || null,
        city || null,
        state || null,
        country || null,
        postalCode || null,
        courseId || null,
        year || null,
        cohort || null,
        status || null,
        courseFee || null,
        paymentPlan || null,
        paymentPlanDetails || null,
        formatDate(feeDueDate),
        sendReminder !== undefined ? (sendReminder ? 1 : 0) : null,
        guardian?.name || null,
        guardian?.email || null,
        guardian?.phone || null,
        id,
      ]
    );

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = studentService;

