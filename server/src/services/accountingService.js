/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const accountingService = {
  // Accounting Tasks
  async getAllTasks(filters = {}) {
    let sql = `
      SELECT 
        at.id, at.student_id as studentId, at.task_type as taskType,
        at.status, at.priority, at.assigned_to as assignedTo,
        at.title, at.description, at.student_data as studentData,
        at.fee_details as feeDetails, at.notes, at.admin_remarks as adminRemarks,
        at.accounting_remarks as accountingRemarks,
        at.completed_at as completedAt, at.completed_by as completedBy,
        at.reviewed_by as reviewedBy, at.reviewed_at as reviewedAt,
        at.created_at as createdAt, at.updated_at as updatedAt,
        s.first_name as studentFirstName, s.last_name as studentLastName,
        s.email as studentEmail, s.application_status as applicationStatus,
        u.name as assignedToName
      FROM accounting_tasks at
      LEFT JOIN students s ON at.student_id = s.id
      LEFT JOIN users u ON at.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND at.status = ?';
      params.push(filters.status);
    }

    if (filters.assignedTo) {
      sql += ' AND at.assigned_to = ?';
      params.push(filters.assignedTo);
    }

    if (filters.taskType) {
      sql += ' AND at.task_type = ?';
      params.push(filters.taskType);
    }

    sql += ' ORDER BY at.created_at DESC';

    const tasks = await query(sql, params);
    return tasks.map(task => {
      // Helper function to safely parse JSON
      const parseJSON = (value) => {
        if (!value) return null;
        if (typeof value === 'object') return value; // Already an object
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.error('Error parsing JSON:', e, 'Value:', value);
            return null;
          }
        }
        return null;
      };

      return {
        ...task,
        studentData: parseJSON(task.studentData),
        feeDetails: parseJSON(task.feeDetails),
      };
    });
  },

  async getTaskById(id) {
    const [task] = await query(
      `SELECT 
        at.id, at.student_id as studentId, at.task_type as taskType,
        at.status, at.priority, at.assigned_to as assignedTo,
        at.title, at.description, at.student_data as studentData,
        at.fee_details as feeDetails, at.notes, at.admin_remarks as adminRemarks,
        at.accounting_remarks as accountingRemarks,
        at.completed_at as completedAt, at.completed_by as completedBy,
        at.reviewed_by as reviewedBy, at.reviewed_at as reviewedAt,
        at.created_at as createdAt, at.updated_at as updatedAt,
        s.first_name as studentFirstName, s.last_name as studentLastName,
        s.email as studentEmail, s.phone as studentPhone,
        s.course_id as courseId, s.application_status as applicationStatus,
        u.name as assignedToName
      FROM accounting_tasks at
      LEFT JOIN students s ON at.student_id = s.id
      LEFT JOIN users u ON at.assigned_to = u.id
      WHERE at.id = ?`,
      [id]
    );

    if (!task) return null;

    // Helper function to safely parse JSON
    const parseJSON = (value) => {
      if (!value) return null;
      if (typeof value === 'object') return value; // Already an object
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('Error parsing JSON:', e, 'Value:', value);
          return null;
        }
      }
      return null;
    };

    return {
      ...task,
      studentData: parseJSON(task.studentData),
      feeDetails: parseJSON(task.feeDetails),
    };
  },

  async createTask(taskData) {
    const id = `task-${uuid()}`;
    const {
      studentId,
      taskType = 'fee_setup',
      priority = 'medium',
      assignedTo,
      title,
      description,
      studentData,
      feeDetails,
      notes,
      adminRemarks,
    } = taskData;

    // Update student application status to fee_setup_pending
    await query(
      `UPDATE students SET application_status = 'fee_setup_pending' WHERE id = ?`,
      [studentId]
    );

    await query(
      `INSERT INTO accounting_tasks (
        id, student_id, task_type, priority, assigned_to,
        title, description, student_data, fee_details, notes, admin_remarks, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        id,
        studentId,
        taskType,
        priority,
        assignedTo || null,
        title,
        description || null,
        studentData ? JSON.stringify(studentData) : null,
        feeDetails ? JSON.stringify(feeDetails) : null,
        notes || null,
        adminRemarks || null,
      ]
    );

    return this.getTaskById(id);
  },

  async updateTask(id, taskData) {
    const {
      status,
      priority,
      assignedTo,
      title,
      description,
      feeDetails,
      notes,
      adminRemarks,
      accountingRemarks,
      completedBy,
    } = taskData;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
        if (completedBy) {
          updates.push('completed_by = ?');
          params.push(completedBy);
        }
      }
    }

    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }

    if (assignedTo !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (feeDetails !== undefined) {
      updates.push('fee_details = ?');
      params.push(feeDetails ? JSON.stringify(feeDetails) : null);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (adminRemarks !== undefined) {
      updates.push('admin_remarks = ?');
      params.push(adminRemarks);
    }

    if (accountingRemarks !== undefined) {
      updates.push('accounting_remarks = ?');
      params.push(accountingRemarks);
    }

    if (updates.length === 0) {
      return this.getTaskById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(
      `UPDATE accounting_tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getTaskById(id);
  },

  async completeTask(id, completedBy, feeDetails, accountingRemarks) {
    // Update student with fee details if provided
    const task = await this.getTaskById(id);
    if (!task) return null;

    if (feeDetails && task.studentId) {
      await query(
        `UPDATE students SET
          course_fee = ?,
          payment_plan = ?,
          payment_plan_details = ?,
          fee_due_date = ?,
          send_reminder = ?,
          application_status = 'fee_setup_completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          feeDetails.courseFee || null,
          feeDetails.paymentPlan || null,
          feeDetails.paymentPlanDetails ? JSON.stringify(feeDetails.paymentPlanDetails) : null,
          feeDetails.feeDueDate || null,
          feeDetails.sendReminder !== undefined ? (feeDetails.sendReminder ? 1 : 0) : 1,
          task.studentId,
        ]
      );
    }

    return this.updateTask(id, {
      status: 'completed',
      completedBy,
      feeDetails,
      accountingRemarks,
    });
  },

  async sendToAdmin(id, completedBy, feeDetails, accountingRemarks) {
    // Update student with fee details and set status to under_review
    const task = await this.getTaskById(id);
    if (!task) return null;

    if (feeDetails && task.studentId) {
      await query(
        `UPDATE students SET
          course_fee = ?,
          payment_plan = ?,
          payment_plan_details = ?,
          fee_due_date = ?,
          send_reminder = ?,
          application_status = 'under_review',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          feeDetails.courseFee || null,
          feeDetails.paymentPlan || null,
          feeDetails.paymentPlanDetails ? JSON.stringify(feeDetails.paymentPlanDetails) : null,
          feeDetails.feeDueDate || null,
          feeDetails.sendReminder !== undefined ? (feeDetails.sendReminder ? 1 : 0) : 1,
          task.studentId,
        ]
      );
    }

    return this.updateTask(id, {
      status: 'in_progress', // Changed to in_progress to indicate sent to admin
      completedBy,
      feeDetails,
      accountingRemarks,
    });
  },

  // Salary Management
  async getAllSalaries(filters = {}) {
    let sql = `
      SELECT 
        s.id, s.employee_id as employeeId, s.employee_type as employeeType,
        s.base_salary as baseSalary, s.allowances, s.deductions,
        s.net_salary as netSalary, s.payment_frequency as paymentFrequency,
        s.bank_account as bankAccount, s.bank_name as bankName,
        s.tax_id as taxId, s.start_date as startDate, s.end_date as endDate,
        s.status, s.notes, s.created_at as createdAt, s.updated_at as updatedAt
      FROM salaries s
      WHERE 1=1
    `;
    const params = [];

    if (filters.employeeId) {
      sql += ' AND s.employee_id = ?';
      params.push(filters.employeeId);
    }

    if (filters.status) {
      sql += ' AND s.status = ?';
      params.push(filters.status);
    }

    if (filters.employeeType) {
      sql += ' AND s.employee_type = ?';
      params.push(filters.employeeType);
    }

    sql += ' ORDER BY s.created_at DESC';

    return await query(sql, params);
  },

  async getSalaryById(id) {
    const [salary] = await query(
      `SELECT 
        s.id, s.employee_id as employeeId, s.employee_type as employeeType,
        s.base_salary as baseSalary, s.allowances, s.deductions,
        s.net_salary as netSalary, s.payment_frequency as paymentFrequency,
        s.bank_account as bankAccount, s.bank_name as bankName,
        s.tax_id as taxId, s.start_date as startDate, s.end_date as endDate,
        s.status, s.notes, s.created_by as createdBy,
        s.created_at as createdAt, s.updated_at as updatedAt
      FROM salaries s
      WHERE s.id = ?`,
      [id]
    );

    return salary || null;
  },

  async createSalary(salaryData) {
    const id = `salary-${uuid()}`;
    const {
      employeeId,
      employeeType,
      baseSalary,
      allowances = 0,
      deductions = 0,
      paymentFrequency = 'monthly',
      bankAccount,
      bankName,
      taxId,
      startDate,
      endDate,
      status = 'active',
      notes,
      createdBy,
    } = salaryData;

    const netSalary = parseFloat(baseSalary) + parseFloat(allowances) - parseFloat(deductions);

    await query(
      `INSERT INTO salaries (
        id, employee_id, employee_type, base_salary, allowances, deductions,
        net_salary, payment_frequency, bank_account, bank_name, tax_id,
        start_date, end_date, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        employeeId,
        employeeType,
        baseSalary,
        allowances,
        deductions,
        netSalary,
        paymentFrequency,
        bankAccount || null,
        bankName || null,
        taxId || null,
        startDate,
        endDate || null,
        status,
        notes || null,
        createdBy || null,
      ]
    );

    return this.getSalaryById(id);
  },

  async updateSalary(id, salaryData) {
    const {
      baseSalary,
      allowances,
      deductions,
      paymentFrequency,
      bankAccount,
      bankName,
      taxId,
      startDate,
      endDate,
      status,
      notes,
    } = salaryData;

    const updates = [];
    const params = [];

    if (baseSalary !== undefined || allowances !== undefined || deductions !== undefined) {
      // Get current values if not all provided
      const current = await this.getSalaryById(id);
      const base = baseSalary !== undefined ? baseSalary : current.baseSalary;
      const allow = allowances !== undefined ? allowances : current.allowances;
      const deduct = deductions !== undefined ? deductions : current.deductions;
      const net = parseFloat(base) + parseFloat(allow) - parseFloat(deduct);

      if (baseSalary !== undefined) {
        updates.push('base_salary = ?');
        params.push(baseSalary);
      }
      if (allowances !== undefined) {
        updates.push('allowances = ?');
        params.push(allowances);
      }
      if (deductions !== undefined) {
        updates.push('deductions = ?');
        params.push(deductions);
      }
      updates.push('net_salary = ?');
      params.push(net);
    }

    if (paymentFrequency !== undefined) {
      updates.push('payment_frequency = ?');
      params.push(paymentFrequency);
    }

    if (bankAccount !== undefined) {
      updates.push('bank_account = ?');
      params.push(bankAccount);
    }

    if (bankName !== undefined) {
      updates.push('bank_name = ?');
      params.push(bankName);
    }

    if (taxId !== undefined) {
      updates.push('tax_id = ?');
      params.push(taxId);
    }

    if (startDate !== undefined) {
      updates.push('start_date = ?');
      params.push(startDate);
    }

    if (endDate !== undefined) {
      updates.push('end_date = ?');
      params.push(endDate);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return this.getSalaryById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(
      `UPDATE salaries SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getSalaryById(id);
  },

  // Salary Payments
  async getSalaryPayments(salaryId) {
    return await query(
      `SELECT 
        sp.id, sp.salary_id as salaryId, sp.payment_date as paymentDate,
        sp.amount, sp.payment_method as paymentMethod,
        sp.transaction_reference as transactionReference,
        sp.status, sp.processed_at as processedAt,
        sp.processed_by as processedBy, sp.notes,
        sp.created_at as createdAt, sp.updated_at as updatedAt,
        u.name as processedByName
      FROM salary_payments sp
      LEFT JOIN users u ON sp.processed_by = u.id
      WHERE sp.salary_id = ?
      ORDER BY sp.payment_date DESC`,
      [salaryId]
    );
  },

  async createSalaryPayment(paymentData) {
    const id = `salpay-${uuid()}`;
    const {
      salaryId,
      paymentDate,
      amount,
      paymentMethod = 'bank_transfer',
      transactionReference,
      status = 'pending',
      processedBy,
      notes,
    } = paymentData;

    await query(
      `INSERT INTO salary_payments (
        id, salary_id, payment_date, amount, payment_method,
        transaction_reference, status, processed_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        salaryId,
        paymentDate,
        amount,
        paymentMethod,
        transactionReference || null,
        status,
        processedBy || null,
        notes || null,
      ]
    );

    const [payment] = await query(
      `SELECT 
        sp.id, sp.salary_id as salaryId, sp.payment_date as paymentDate,
        sp.amount, sp.payment_method as paymentMethod,
        sp.transaction_reference as transactionReference,
        sp.status, sp.processed_at as processedAt,
        sp.processed_by as processedBy, sp.notes,
        sp.created_at as createdAt, sp.updated_at as updatedAt
      FROM salary_payments sp
      WHERE sp.id = ?`,
      [id]
    );

    return payment;
  },

  async updateSalaryPayment(id, paymentData) {
    const {
      status,
      processedBy,
      processedAt,
      notes,
    } = paymentData;

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'processed' && !processedAt) {
        updates.push('processed_at = CURRENT_TIMESTAMP');
      }
    }

    if (processedBy !== undefined) {
      updates.push('processed_by = ?');
      params.push(processedBy);
    }

    if (processedAt !== undefined) {
      updates.push('processed_at = ?');
      params.push(processedAt);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(
      `UPDATE salary_payments SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [payment] = await query(
      `SELECT 
        sp.id, sp.salary_id as salaryId, sp.payment_date as paymentDate,
        sp.amount, sp.payment_method as paymentMethod,
        sp.transaction_reference as transactionReference,
        sp.status, sp.processed_at as processedAt,
        sp.processed_by as processedBy, sp.notes,
        sp.created_at as createdAt, sp.updated_at as updatedAt
      FROM salary_payments sp
      WHERE sp.id = ?`,
      [id]
    );

    return payment;
  },
};

module.exports = accountingService;

