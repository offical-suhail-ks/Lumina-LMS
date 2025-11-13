/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const mailboxService = {
  async getInbox(userId, userRole) {
    // Get personal messages
    const personalMessages = await query(
      `SELECT 
        m.id, m.sender_id as senderId, m.sender_name as senderName, m.sender_role as senderRole,
        m.recipient_id as recipientId, m.subject, m.body, 
        COALESCE(m.read_by_recipient, FALSE) as isRead,
        m.created_at as createdAt, m.is_announcement as isAnnouncement
      FROM messages m
      WHERE m.recipient_id = ? AND m.deleted_by_recipient = FALSE
      ORDER BY m.created_at DESC`,
      [userId]
    );

    // Get announcements for this user's role
    const announcements = await query(
      `SELECT 
        m.id, m.sender_id as senderId, m.sender_name as senderName, m.sender_role as senderRole,
        m.recipient_id as recipientId, m.subject, m.body, 
        FALSE as isRead,
        m.created_at as createdAt, m.is_announcement as isAnnouncement,
        m.announcement_audience as announcementAudience
      FROM messages m
      WHERE m.is_announcement = TRUE
        AND (m.announcement_audience = 'all' OR m.announcement_audience = ?)
      ORDER BY m.created_at DESC`,
      [userRole]
    );

    // Mark announcements as read if user has read them
    // (This is simplified - in production you'd track per-user read status for announcements)
    
    return {
      personal: personalMessages,
      announcements: announcements,
    };
  },

  async getMessageById(id, userId) {
    const [message] = await query(
      `SELECT 
        m.id, m.sender_id as senderId, m.sender_name as senderName, m.sender_role as senderRole,
        m.recipient_id as recipientId, m.recipient_role as recipientRole,
        m.subject, m.body, 
        CASE 
          WHEN m.recipient_id = ? THEN COALESCE(m.read_by_recipient, FALSE)
          WHEN m.sender_id = ? THEN COALESCE(m.read_by_sender, TRUE)
          ELSE FALSE
        END as isRead,
        m.is_announcement as isAnnouncement, m.announcement_audience as announcementAudience,
        m.created_at as createdAt
      FROM messages m
      WHERE m.id = ? AND (
        m.recipient_id = ? OR m.sender_id = ? OR m.is_announcement = TRUE
      ) AND (
        (m.recipient_id = ? AND m.deleted_by_recipient = FALSE) OR
        (m.sender_id = ? AND m.deleted_by_sender = FALSE) OR
        m.is_announcement = TRUE
      )`,
      [userId, userId, id, userId, userId, userId, userId]
    );

    // Mark as read if recipient is viewing
    if (message && message.recipientId === userId && !message.isRead) {
      await query(
        'UPDATE messages SET read_by_recipient = TRUE WHERE id = ?',
        [id]
      );
      message.isRead = true;
    }

    return message || null;
  },

  async sendMessage(messageData) {
    const id = `msg-${uuid()}`;
    const {
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientRole,
      subject,
      body,
      isAnnouncement = false,
      announcementAudience = null,
    } = messageData;

    await query(
      `INSERT INTO messages (
        id, sender_id, sender_name, sender_role,
        recipient_id, recipient_role, subject, body,
        is_announcement, announcement_audience
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        senderId,
        senderName,
        senderRole,
        recipientId || null,
        recipientRole || null,
        subject,
        body,
        isAnnouncement ? 1 : 0,
        announcementAudience || null,
      ]
    );

    return this.getMessageById(id, senderId);
  },

  async markAsRead(id, userId) {
    await query(
      'UPDATE messages SET read_by_recipient = TRUE WHERE id = ? AND recipient_id = ?',
      [id, userId]
    );
    return { success: true };
  },

  async markAllAsRead(userId) {
    await query(
      'UPDATE messages SET read_by_recipient = TRUE WHERE recipient_id = ? AND read_by_recipient = FALSE',
      [userId]
    );
    return { success: true };
  },

  async deleteMessage(id, userId) {
    // Only allow deletion if user is sender or recipient
    const [message] = await query(
      'SELECT sender_id, recipient_id FROM messages WHERE id = ?',
      [id]
    );

    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    if (message.sender_id !== userId && message.recipient_id !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    // Soft delete - mark as deleted by sender or recipient
    if (message.sender_id === userId) {
      await query('UPDATE messages SET deleted_by_sender = TRUE WHERE id = ?', [id]);
    } else {
      await query('UPDATE messages SET deleted_by_recipient = TRUE WHERE id = ?', [id]);
    }
    
    return { success: true };
  },

  async getSentMessages(userId) {
    const messages = await query(
      `SELECT 
        m.id, m.sender_id as senderId, m.sender_name as senderName,
        m.recipient_id as recipientId, m.recipient_role as recipientRole,
        m.subject, m.body, m.is_announcement as isAnnouncement,
        m.announcement_audience as announcementAudience,
        m.created_at as createdAt
      FROM messages m
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC`,
      [userId]
    );

    return messages;
  },

  async getUnreadCount(userId, userRole) {
    // Count personal unread messages
    const [personalCount] = await query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_by_recipient = FALSE AND deleted_by_recipient = FALSE',
      [userId]
    );

    // Count unread announcements (simplified - in production track per-user)
    const [announcementCount] = await query(
      `SELECT COUNT(*) as count FROM messages 
      WHERE is_announcement = TRUE 
        AND (announcement_audience = 'all' OR announcement_audience = ?)
        AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userRole]
    );

    return {
      personal: personalCount.count,
      announcements: announcementCount.count,
      total: personalCount.count + announcementCount.count,
    };
  },
};

module.exports = mailboxService;

