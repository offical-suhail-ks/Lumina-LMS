/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');
const crypto = require('crypto');

const certificateService = {
  generateCertificateNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  },

  generateVerificationCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  },

  async createCertificate(certificateData) {
    const id = `cert-${uuid()}`;
    const {
      studentId,
      courseId,
      certificateType = 'course_completion',
      title,
      description,
      issuedBy,
    } = certificateData;

    const certificateNumber = this.generateCertificateNumber();
    const verificationCode = this.generateVerificationCode();

    await query(
      `INSERT INTO certificates (
        id, student_id, course_id, certificate_type, title, description,
        issued_date, certificate_number, verification_code, issued_by
      ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
      [
        id, studentId, courseId, certificateType, title, description,
        certificateNumber, verificationCode, issuedBy,
      ]
    );

    return this.getCertificateById(id);
  },

  async getCertificateById(id) {
    const [certificate] = await query(
      `SELECT 
        id, student_id as studentId, course_id as courseId,
        certificate_type as certificateType, title, description,
        issued_date as issuedDate, certificate_number as certificateNumber,
        verification_code as verificationCode, issued_by as issuedBy,
        pdf_path as pdfPath, created_at as createdAt
      FROM certificates WHERE id = ?`,
      [id]
    );
    return certificate;
  },

  async getCertificatesByStudent(studentId) {
    const certificates = await query(
      `SELECT 
        id, student_id as studentId, course_id as courseId,
        certificate_type as certificateType, title, description,
        issued_date as issuedDate, certificate_number as certificateNumber,
        verification_code as verificationCode, issued_by as issuedBy,
        pdf_path as pdfPath, created_at as createdAt
      FROM certificates 
      WHERE student_id = ?
      ORDER BY issued_date DESC`,
      [studentId]
    );
    return certificates;
  },

  async verifyCertificate(verificationCode) {
    const [certificate] = await query(
      `SELECT 
        c.id, c.student_id as studentId, c.course_id as courseId,
        c.certificate_type as certificateType, c.title, c.description,
        c.issued_date as issuedDate, c.certificate_number as certificateNumber,
        c.issued_by as issuedBy, c.pdf_path as pdfPath,
        s.first_name as studentFirstName, s.last_name as studentLastName,
        s.email as studentEmail
      FROM certificates c
      LEFT JOIN students s ON c.student_id = s.id
      WHERE c.verification_code = ?`,
      [verificationCode]
    );
    return certificate;
  },

  async updateCertificatePdf(id, pdfPath) {
    await query(
      `UPDATE certificates SET pdf_path = ? WHERE id = ?`,
      [pdfPath, id]
    );
    return this.getCertificateById(id);
  },
};

module.exports = certificateService;

