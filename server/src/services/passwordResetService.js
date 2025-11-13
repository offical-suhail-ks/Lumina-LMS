/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');
const { sendPasswordResetEmail } = require('../mailer');

const passwordResetService = {
  async requestPasswordReset(email) {
    // Check if user exists (in users or students table)
    let [user] = await query(
      `SELECT id, email, name, 'user' as type FROM users WHERE email = ?
       UNION
       SELECT id, email, CONCAT(first_name, ' ', last_name) as name, 'student' as type FROM students WHERE email = ?`,
      [email, email]
    );

    if (!user) {
      // Don't reveal if email exists or not for security
      return { success: true, message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = uuid();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token
    await query(
      `INSERT INTO password_reset_tokens (id, user_id, user_type, token, expires_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`,
      [
        `reset-${uuid()}`,
        user.id,
        user.type,
        resetToken,
        expiresAt,
        resetToken,
        expiresAt,
      ]
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Continue even if email fails
    }

    return { success: true, message: 'If the email exists, a password reset link has been sent.' };
  },

  async verifyResetToken(token) {
    const [resetToken] = await query(
      `SELECT id, user_id, user_type, expires_at
       FROM password_reset_tokens
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token]
    );

    if (!resetToken) {
      return { valid: false, message: 'Invalid or expired reset token' };
    }

    return { valid: true, userId: resetToken.user_id, userType: resetToken.user_type };
  },

  async resetPassword(token, newPassword) {
    const verification = await this.verifyResetToken(token);
    if (!verification.valid) {
      return verification;
    }

    // Update password based on user type
    if (verification.userType === 'user') {
      await query('UPDATE users SET password = ? WHERE id = ?', [newPassword, verification.userId]);
    } else {
      await query('UPDATE students SET password = ? WHERE id = ?', [newPassword, verification.userId]);
    }

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );

    return { success: true, message: 'Password reset successfully' };
  },
};

module.exports = passwordResetService;

