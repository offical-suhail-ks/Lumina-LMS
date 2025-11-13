/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const notificationService = {
  async createNotification(notificationData) {
    const id = `notif-${uuid()}`;
    const {
      userId,
      userType,
      title,
      message,
      type = 'info',
      link,
    } = notificationData;

    await query(
      `INSERT INTO notifications (
        id, user_id, user_type, title, message, type, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, userType, title, message, type, link]
    );

    return this.getNotificationById(id);
  },

  async getNotificationById(id) {
    const [notification] = await query(
      `SELECT 
        id, user_id as userId, user_type as userType,
        title, message, type, link,
        is_read as isRead, read_at as readAt,
        created_at as createdAt
      FROM notifications WHERE id = ?`,
      [id]
    );
    return notification;
  },

  async getNotificationsByUser(userId, userType, filters = {}) {
    let sql = `SELECT 
      id, user_id as userId, user_type as userType,
      title, message, type, link,
      is_read as isRead, read_at as readAt,
      created_at as createdAt
    FROM notifications 
    WHERE user_id = ? AND user_type = ?`;

    const params = [userId, userType];

    if (filters.unreadOnly) {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    const notifications = await query(sql, params);
    return notifications;
  },

  async markAsRead(id) {
    await query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE id = ?`,
      [id]
    );
    return this.getNotificationById(id);
  },

  async markAllAsRead(userId, userType) {
    await query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = ? AND user_type = ? AND is_read = FALSE`,
      [userId, userType]
    );
  },

  async getUnreadCount(userId, userType) {
    const [result] = await query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = ? AND user_type = ? AND is_read = FALSE`,
      [userId, userType]
    );
    // Convert BigInt to Number for JSON serialization
    return Number(result.count);
  },

  async deleteNotification(id) {
    await query(`DELETE FROM notifications WHERE id = ?`, [id]);
  },
};

module.exports = notificationService;

