const nodemailer = require('nodemailer');

const createTransport = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

const transporter = createTransport();

const defaultFrom = process.env.SMTP_FROM ?? 'Lumina LMS <no-reply@lumina.local>';
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

async function sendStudentWelcomeEmail(student) {
  if (!student?.email) return;

  const username = student.username || student.email;
  const password = student.password || 'Not provided';
  const loginUrl = `${frontendUrl}/login`;

  const message = {
    from: defaultFrom,
    to: student.email,
    subject: 'Welcome to Lumina LMS - Your Login Credentials',
    text: [
      `Hi ${student.firstName ?? 'there'},`,
      '',
      'Your Lumina LMS account has been created successfully!',
      '',
      'Here are your login credentials:',
      `Username: ${username}`,
      `Password: ${password}`,
      '',
      'You can now log in at your LMS portal and start exploring your courses.',
      '',
      `Login URL: ${loginUrl}`,
      '',
      'If you have any questions, reply to this email and the team will help you out.',
      '',
      '— Lumina LMS team',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fc;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f7fc;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header with Logo -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0;">
                    <div style="display: inline-block; width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; line-height: 80px; font-size: 36px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">
                      L
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Lumina LMS</h1>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #0f172a; line-height: 1.6;">
                      Hi <strong>${student.firstName ?? 'there'}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                      Your Lumina LMS account has been created successfully! You can now access your personalized learning dashboard, explore courses, and track your progress.
                    </p>

                    <!-- Credentials Card -->
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border: 2px solid #6366f1; border-radius: 12px; padding: 24px; margin: 32px 0;">
                      <h2 style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 600; text-align: center;">
                        🔐 Your Login Credentials
                      </h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #cbd5e1;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <div style="width: 40px; height: 40px; background-color: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span style="color: #ffffff; font-size: 20px;">📧</span>
                              </div>
                              <div style="flex: 1;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Username</p>
                                <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace;">${username}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <div style="width: 40px; height: 40px; background-color: #8b5cf6; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span style="color: #ffffff; font-size: 20px;">🔑</span>
                              </div>
                              <div style="flex: 1;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Password</p>
                                <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace;">${password}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Login Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                        🚀 Access Your Dashboard
                      </a>
                    </div>

                    ${student.courseId || student.year || student.cohort ? `
                    <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 24px 0;">
                      ${student.courseId ? `
                        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">
                          <strong style="color: #1e293b;">📚 Course:</strong> Enrolled in course
                        </p>
                      ` : ''}
                      ${student.year ? `
                        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">
                          <strong style="color: #1e293b;">📅 Year:</strong> ${student.year}
                        </p>
                      ` : ''}
                      ${student.cohort ? `
                        <p style="margin: 0; font-size: 14px; color: #475569;">
                          <strong style="color: #1e293b;">👥 Cohort:</strong> ${student.cohort}
                        </p>
                      ` : ''}
                    </div>
                    ` : ''}

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 12px; font-size: 14px; color: #475569; line-height: 1.6;">
                        <strong>💡 Quick Tips:</strong>
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                        <li>Use your email address as your username to log in</li>
                        <li>Change your password after first login for security</li>
                        <li>Explore your courses and assignments from the dashboard</li>
                        <li>Reach out if you need any assistance</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">
                      If you have any questions, feel free to reply to this email.
                    </p>
                    <div style="margin: 20px 0;">
                      <img src="https://via.placeholder.com/200x40/6366f1/ffffff?text=Lumina+LMS" alt="Lumina LMS" style="max-width: 200px; height: auto;" />
                    </div>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Lumina LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(message);

  if (info.message) {
    console.log('Mail preview (stream transport):\n', info.message.toString());
  }
}

async function sendStudentOfferLetter(student, course) {
  if (!student?.email) return;

  const username = student.username || student.email;
  const password = student.password || 'Not provided';
  const loginUrl = `${frontendUrl}/login`;
  const courseName = course?.title || course?.name || 'Selected Course';
  const courseFee = student.courseFee ? `$${parseFloat(student.courseFee).toLocaleString()}` : 'To be determined';
  
  const paymentPlanLabels = {
    full: 'Full Payment',
    installment: 'Installment Plan',
    scholarship: 'Scholarship',
    waived: 'Fee Waived',
  };
  const paymentPlan = student.paymentPlan ? paymentPlanLabels[student.paymentPlan] || student.paymentPlan : 'Not specified';

  const message = {
    from: defaultFrom,
    to: student.email,
    subject: `🎓 Offer Letter - Admission to ${courseName}`,
    text: [
      `Dear ${student.firstName} ${student.lastName},`,
      '',
      `We are pleased to offer you admission to ${courseName} at Lumina Learning Management System.`,
      '',
      'OFFER DETAILS:',
      `Course: ${courseName}`,
      `Year: ${student.year || 'N/A'}`,
      `Cohort: ${student.cohort || 'N/A'}`,
      `Course Fee: ${courseFee}`,
      `Payment Plan: ${paymentPlan}`,
      '',
      'LOGIN CREDENTIALS:',
      `Username: ${username}`,
      `Password: ${password}`,
      '',
      `Login URL: ${loginUrl}`,
      '',
      'We look forward to welcoming you to our learning community!',
      '',
      'Best regards,',
      'Lumina LMS Admissions Team',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fc;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f7fc;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0;">
                    <div style="display: inline-block; width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; line-height: 80px; font-size: 36px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">
                      🎓
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Offer Letter</h1>
                    <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Admission Confirmation</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #0f172a; line-height: 1.6;">
                      Dear <strong>${student.firstName} ${student.lastName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 24px; font-size: 15px; color: #475569; line-height: 1.6;">
                      We are pleased to offer you admission to <strong>${courseName}</strong> at Lumina Learning Management System. Congratulations on this achievement!
                    </p>

                    <!-- Offer Details Card -->
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border: 2px solid #6366f1; border-radius: 12px; padding: 24px; margin: 32px 0;">
                      <h2 style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 600; text-align: center;">
                        📋 Offer Details
                      </h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Course</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${courseName}</p>
                          </td>
                        </tr>
                        ${student.year ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Year</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${student.year}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${student.cohort ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Cohort</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${student.cohort}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${student.courseFee ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #cbd5e1;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Course Fee</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${courseFee}</p>
                          </td>
                        </tr>
                        ` : ''}
                        ${student.paymentPlan ? `
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Payment Plan</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600;">${paymentPlan}</p>
                            ${student.paymentPlanDetails ? `<p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">${student.paymentPlanDetails}</p>` : ''}
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                    </div>

                    <!-- Login Credentials Card -->
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border: 2px solid #6366f1; border-radius: 12px; padding: 24px; margin: 32px 0;">
                      <h2 style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 600; text-align: center;">
                        🔐 Your Login Credentials
                      </h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #cbd5e1;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <div style="width: 40px; height: 40px; background-color: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span style="color: #ffffff; font-size: 20px;">📧</span>
                              </div>
                              <div style="flex: 1;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Username</p>
                                <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace;">${username}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <div style="width: 40px; height: 40px; background-color: #8b5cf6; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <span style="color: #ffffff; font-size: 20px;">🔑</span>
                              </div>
                              <div style="flex: 1;">
                                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Password</p>
                                <p style="margin: 4px 0 0; font-size: 16px; color: #1e293b; font-weight: 600; font-family: 'Courier New', monospace;">${password}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Login Button -->
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                        🚀 Access Your Dashboard
                      </a>
                    </div>

                    ${student.address || student.phone ? `
                    <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 24px 0;">
                      <p style="margin: 0 0 8px; font-size: 14px; color: #475569; font-weight: 600;">Contact Information:</p>
                      ${student.phone ? `<p style="margin: 0 0 4px; font-size: 14px; color: #475569;">Phone: ${student.phone}</p>` : ''}
                      ${student.address ? `<p style="margin: 0; font-size: 14px; color: #475569;">Address: ${student.address}${student.city ? `, ${student.city}` : ''}${student.state ? `, ${student.state}` : ''}${student.postalCode ? ` ${student.postalCode}` : ''}${student.country ? `, ${student.country}` : ''}</p>` : ''}
                    </div>
                    ` : ''}

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 12px; font-size: 14px; color: #475569; line-height: 1.6;">
                        <strong>📝 Next Steps:</strong>
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                        <li>Log in to your dashboard using the credentials above</li>
                        <li>Review your course details and schedule</li>
                        <li>Complete your profile information</li>
                        <li>Familiarize yourself with the learning platform</li>
                      </ul>
                    </div>

                    <p style="margin: 24px 0 0; font-size: 15px; color: #475569; line-height: 1.6;">
                      We are excited to have you join our learning community and look forward to supporting your academic journey!
                    </p>

                    <p style="margin: 24px 0 0; font-size: 15px; color: #0f172a; line-height: 1.6;">
                      Best regards,<br>
                      <strong>Lumina LMS Admissions Team</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">
                      If you have any questions about this offer, please contact our admissions office.
                    </p>
                    <div style="margin: 20px 0;">
                      <img src="https://via.placeholder.com/200x40/6366f1/ffffff?text=Lumina+LMS" alt="Lumina LMS" style="max-width: 200px; height: auto;" />
                    </div>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Lumina LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(message);

  if (info.message) {
    console.log('Offer letter email preview (stream transport):\n', info.message.toString());
  }
}

async function sendPaymentReminder(student, paymentSummary) {
  if (!student?.email) return;

  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
  const loginUrl = `${frontendUrl}/login`;
  const feesUrl = `${frontendUrl}/fees`;
  const courseFee = paymentSummary?.totalFee || student.courseFee || 0;
  const paidAmount = paymentSummary?.paidAmount || 0;
  const remainingAmount = paymentSummary?.remainingAmount || courseFee;
  const dueDate = student.feeDueDate ? new Date(student.feeDueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'the specified date';

  const daysUntilDue = student.feeDueDate 
    ? Math.ceil((new Date(student.feeDueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const urgencyMessage = daysUntilDue !== null
    ? daysUntilDue <= 0
      ? 'Your payment is now overdue. Please make payment immediately to avoid any penalties.'
      : daysUntilDue <= 3
      ? `Your payment is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}. Please make payment as soon as possible.`
      : daysUntilDue <= 7
      ? `Your payment is due in ${daysUntilDue} days. Please ensure payment is made before the due date.`
      : `Your payment is due on ${dueDate}. Please ensure payment is made before this date.`
    : `Your payment is due on ${dueDate}. Please ensure payment is made before this date.`;

  const message = {
    from: defaultFrom,
    to: student.email,
    subject: `💰 Payment Reminder - Fee Payment Due ${daysUntilDue !== null && daysUntilDue <= 3 ? '(URGENT)' : ''}`,
    text: [
      `Dear ${studentName},`,
      '',
      'This is a friendly reminder regarding your course fee payment.',
      '',
      'PAYMENT DETAILS:',
      `Total Course Fee: $${parseFloat(courseFee).toLocaleString()}`,
      `Amount Paid: $${parseFloat(paidAmount).toLocaleString()}`,
      `Remaining Balance: $${parseFloat(remainingAmount).toLocaleString()}`,
      `Due Date: ${dueDate}`,
      '',
      urgencyMessage,
      '',
      'You can make your payment by:',
      `1. Logging into your LMS account: ${loginUrl}`,
      `2. Navigating to the Fees section: ${feesUrl}`,
      '3. Completing the payment using the secure payment gateway',
      '',
      'If you have already made the payment, please ignore this reminder.',
      '',
      'If you have any questions or need assistance, please contact the administration office.',
      '',
      'Best regards,',
      'Lumina LMS Finance Team',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fc;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f7fc;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, ${daysUntilDue !== null && daysUntilDue <= 3 ? '#ef4444' : '#f59e0b'} 0%, ${daysUntilDue !== null && daysUntilDue <= 3 ? '#dc2626' : '#d97706'} 100%); border-radius: 16px 16px 0 0;">
                    <div style="display: inline-block; width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; line-height: 80px; font-size: 36px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">
                      💰
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Payment Reminder</h1>
                    ${daysUntilDue !== null && daysUntilDue <= 3 ? '<p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 600;">URGENT - Payment Due Soon</p>' : ''}
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #0f172a; line-height: 1.6;">
                      Dear <strong>${studentName}</strong>,
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; color: #0f172a; line-height: 1.6;">
                      This is a friendly reminder regarding your course fee payment.
                    </p>

                    <!-- Payment Details Box -->
                    <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #6366f1;">
                      <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #0f172a;">Payment Details</h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #475569;">Total Course Fee:</td>
                          <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">$${parseFloat(courseFee).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #475569;">Amount Paid:</td>
                          <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #10b981;">$${parseFloat(paidAmount).toLocaleString()}</td>
                        </tr>
                        <tr style="border-top: 1px solid #e2e8f0;">
                          <td style="padding: 12px 0 8px; font-size: 16px; font-weight: 600; color: #0f172a;">Remaining Balance:</td>
                          <td style="padding: 12px 0 8px; text-align: right; font-size: 16px; font-weight: 700; color: #f59e0b;">$${parseFloat(remainingAmount).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-size: 14px; color: #475569;">Due Date:</td>
                          <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: ${daysUntilDue !== null && daysUntilDue <= 3 ? '#ef4444' : '#0f172a'};">${dueDate}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Urgency Message -->
                    <div style="margin: 24px 0; padding: 20px; background-color: ${daysUntilDue !== null && daysUntilDue <= 3 ? '#fef2f2' : '#fffbeb'}; border-radius: 12px; border-left: 4px solid ${daysUntilDue !== null && daysUntilDue <= 3 ? '#ef4444' : '#f59e0b'};">
                      <p style="margin: 0; font-size: 15px; font-weight: 600; color: ${daysUntilDue !== null && daysUntilDue <= 3 ? '#991b1b' : '#92400e'}; line-height: 1.6;">
                        ${urgencyMessage}
                      </p>
                    </div>

                    <!-- Payment Instructions -->
                    <div style="margin: 32px 0; padding: 24px; background-color: #f0f9ff; border-radius: 12px;">
                      <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;">How to Make Payment:</h3>
                      <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 2;">
                        <li>Log into your LMS account at <a href="${loginUrl}" style="color: #6366f1; text-decoration: none;">${loginUrl}</a></li>
                        <li>Navigate to the <strong>Fees</strong> section in your dashboard</li>
                        <li>Click on <strong>"Pay Now"</strong> or select the specific installment to pay</li>
                        <li>Complete the payment using our secure payment gateway</li>
                      </ol>
                      <div style="margin-top: 24px; text-align: center;">
                        <a href="${feesUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          Pay Fees Now →
                        </a>
                      </div>
                    </div>

                    <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                      If you have already made the payment, please ignore this reminder. It may take a few minutes for the payment to reflect in the system.
                    </p>
                    <p style="margin: 16px 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                      If you have any questions or need assistance, please contact the administration office.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">
                      Best regards,<br>
                      <strong>Lumina LMS Finance Team</strong>
                    </p>
                    <div style="margin: 20px 0;">
                      <img src="https://via.placeholder.com/200x40/6366f1/ffffff?text=Lumina+LMS" alt="Lumina LMS" style="max-width: 200px; height: auto;" />
                    </div>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Lumina LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(message);

  if (info.message) {
    console.log('Payment reminder email sent (stream transport):\n', info.message.toString());
  }
}

module.exports = {
  sendStudentWelcomeEmail,
  sendStudentOfferLetter,
  sendPaymentReminder,
};

