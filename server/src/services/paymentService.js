/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const paymentService = {
  async getAllByStudent(studentId) {
    const payments = await query(
      `SELECT 
        id, student_id as studentId, amount, installment_number as installmentNumber,
        total_installments as totalInstallments, payment_method as paymentMethod,
        payment_status as paymentStatus, transaction_id as transactionId,
        payment_gateway as paymentGateway, notes, paid_at as paidAt,
        created_at as createdAt, updated_at as updatedAt
      FROM payments
      WHERE student_id = ?
      ORDER BY created_at DESC`,
      [studentId]
    );
    return payments;
  },

  async getById(id) {
    const [payment] = await query(
      `SELECT 
        id, student_id as studentId, amount, installment_number as installmentNumber,
        total_installments as totalInstallments, payment_method as paymentMethod,
        payment_status as paymentStatus, transaction_id as transactionId,
        payment_gateway as paymentGateway, notes, paid_at as paidAt,
        created_at as createdAt, updated_at as updatedAt
      FROM payments
      WHERE id = ?`,
      [id]
    );
    return payment || null;
  },

  async create(paymentData) {
    const id = `payment-${uuid()}`;
    const {
      studentId,
      amount,
      installmentNumber,
      totalInstallments,
      paymentMethod,
      transactionId,
      paymentGateway,
      notes,
    } = paymentData;

    await query(
      `INSERT INTO payments (
        id, student_id, amount, installment_number, total_installments,
        payment_method, payment_status, transaction_id, payment_gateway, notes, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        id,
        studentId,
        amount,
        installmentNumber || null,
        totalInstallments || null,
        paymentMethod || 'card',
        transactionId || null,
        paymentGateway || 'mock',
        notes || null,
      ]
    );

    return this.getById(id);
  },

  async getPaymentSummary(studentId) {
    // Get student's fee information
    const [student] = await query(
      `SELECT course_fee as courseFee, payment_plan as paymentPlan, 
       payment_plan_details as paymentPlanDetails
      FROM students WHERE id = ?`,
      [studentId]
    );

    if (!student || !student.courseFee) {
      return {
        totalFee: 0,
        paidAmount: 0,
        remainingAmount: 0,
        paymentPlan: null,
        installments: [],
        paymentHistory: [],
      };
    }

    // Get all payments
    const payments = await this.getAllByStudent(studentId);
    const paidAmount = payments
      .filter(p => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const totalFee = parseFloat(student.courseFee || 0);
    const remainingAmount = totalFee - paidAmount;

    // Parse installment plan
    let installments = [];
    if (student.paymentPlan === 'installment' && student.paymentPlanDetails) {
      const details = student.paymentPlanDetails;
      const match = details.match(/(\d+)\s+installments\s+of\s+\$([\d.]+)/i);
      if (match) {
        const totalInstallments = parseInt(match[1], 10);
        const installmentAmount = parseFloat(match[2]);
        const paidInstallments = payments.filter(p => p.paymentStatus === 'completed').length;

        for (let i = 1; i <= totalInstallments; i++) {
          const payment = payments.find(p => p.installmentNumber === i && p.paymentStatus === 'completed');
          installments.push({
            number: i,
            amount: installmentAmount,
            dueDate: null, // Could calculate based on enrollment date
            status: payment ? 'paid' : i <= paidInstallments ? 'paid' : 'pending',
            paidAt: payment?.paidAt || null,
            paymentId: payment?.id || null,
          });
        }
      }
    } else if (student.paymentPlan === 'full') {
      const payment = payments.find(p => p.paymentStatus === 'completed');
      installments.push({
        number: 1,
        amount: totalFee,
        dueDate: null,
        status: payment ? 'paid' : 'pending',
        paidAt: payment?.paidAt || null,
        paymentId: payment?.id || null,
      });
    }

    return {
      totalFee,
      paidAmount,
      remainingAmount,
      paymentPlan: student.paymentPlan,
      paymentPlanDetails: student.paymentPlanDetails,
      installments,
      paymentHistory: payments,
    };
  },
};

module.exports = paymentService;

