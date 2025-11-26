/* eslint-env node */

const { query, transaction } = require('../db');
const { v4: uuid } = require('uuid');

const studentService = {
  async getAll() {
    const students = await query(
      `SELECT 
        s.id, s.first_name as firstName, s.last_name as lastName, s.email, s.username,
        s.course_id as courseId, s.year, s.cohort, s.batch_timing as batchTiming,
        s.class_schedule as classSchedule, s.status, s.application_status as applicationStatus,
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
        s.course_id as courseId, s.year, s.cohort, s.batch_timing as batchTiming,
        s.class_schedule as classSchedule, s.status, s.application_status as applicationStatus,
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
      courseId, year, cohort, batchTiming, classSchedule,
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
        course_id, year, cohort, batch_timing, class_schedule,
        guardian_name, guardian_email, guardian_phone, status, application_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        batchTiming || null,
        classSchedule || null,
        guardian?.name || null,
        guardian?.email || null,
        guardian?.phone || null,
        'active',
        'pending', // Initial application status
      ]
    );

    return this.getById(id);
  },

  async update(id, studentData) {
    const {
      firstName, lastName, email,
      phone, dateOfBirth, address, city, state, country, postalCode,
      courseId, year, cohort, batchTiming, classSchedule, status,
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

    // Build dynamic UPDATE query - only update fee fields if explicitly provided
    const updateFields = [];
    const updateValues = [];
    
    // Always update these fields
    if (firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(formatDate(dateOfBirth));
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address || null);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city || null);
    }
    if (state !== undefined) {
      updateFields.push('state = ?');
      updateValues.push(state || null);
    }
    if (country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(country || null);
    }
    if (postalCode !== undefined) {
      updateFields.push('postal_code = ?');
      updateValues.push(postalCode || null);
    }
    if (courseId !== undefined) {
      updateFields.push('course_id = ?');
      updateValues.push(courseId || null);
    }
    if (year !== undefined) {
      updateFields.push('year = ?');
      updateValues.push(year || null);
    }
    if (cohort !== undefined) {
      updateFields.push('cohort = ?');
      updateValues.push(cohort || null);
    }
    if (batchTiming !== undefined) {
      updateFields.push('batch_timing = ?');
      updateValues.push(batchTiming || null);
    }
    if (classSchedule !== undefined) {
      updateFields.push('class_schedule = ?');
      updateValues.push(classSchedule || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status || null);
    }
    
    // Only update fee fields if explicitly provided (not undefined)
    if (courseFee !== undefined) {
      updateFields.push('course_fee = ?');
      updateValues.push(courseFee || null);
    }
    if (paymentPlan !== undefined) {
      updateFields.push('payment_plan = ?');
      updateValues.push(paymentPlan || null);
    }
    if (paymentPlanDetails !== undefined) {
      updateFields.push('payment_plan_details = ?');
      updateValues.push(paymentPlanDetails ? (typeof paymentPlanDetails === 'string' ? paymentPlanDetails : JSON.stringify(paymentPlanDetails)) : null);
    }
    if (feeDueDate !== undefined) {
      updateFields.push('fee_due_date = ?');
      updateValues.push(formatDate(feeDueDate));
    }
    if (sendReminder !== undefined) {
      updateFields.push('send_reminder = ?');
      updateValues.push(sendReminder ? 1 : 0);
    }
    
    if (guardian !== undefined) {
      updateFields.push('guardian_name = ?');
      updateValues.push(guardian?.name || null);
      updateFields.push('guardian_email = ?');
      updateValues.push(guardian?.email || null);
      updateFields.push('guardian_phone = ?');
      updateValues.push(guardian?.phone || null);
    }
    
    // Always update updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add WHERE clause
    updateValues.push(id);
    
    if (updateFields.length > 1) { // More than just updated_at
      await query(
        `UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM students WHERE id = ?', [id]);
    return (result.affectedRows || result.rowCount || 0) > 0;
  },
};

module.exports = studentService;

