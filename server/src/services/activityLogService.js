/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const activityLogService = {
  async logActivity(activityData) {
    const id = `log-${uuid()}`;
    const {
      userId,
      userType,
      action,
      entityType,
      entityId,
      description,
      ipAddress,
      userAgent,
    } = activityData;

    await query(
      `INSERT INTO activity_logs (
        id, user_id, user_type, action, entity_type, entity_id,
        description, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, userType, action, entityType, entityId,
        description, ipAddress, userAgent,
      ]
    );
  },

  async getActivityLogs(filters = {}) {
    let sql = `SELECT 
      id, user_id as userId, user_type as userType,
      action, entity_type as entityType, entity_id as entityId,
      description, ip_address as ipAddress, user_agent as userAgent,
      created_at as createdAt
    FROM activity_logs WHERE 1=1`;

    const params = [];

    if (filters.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.userType) {
      sql += ' AND user_type = ?';
      params.push(filters.userType);
    }

    if (filters.action) {
      sql += ' AND action = ?';
      params.push(filters.action);
    }

    if (filters.entityType) {
      sql += ' AND entity_type = ?';
      params.push(filters.entityType);
    }

    if (filters.startDate) {
      sql += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      const limitValue = parseInt(filters.limit, 10);
      if (!isNaN(limitValue) && limitValue > 0) {
        sql += ' LIMIT ?';
        params.push(limitValue);
      }
    }

    const logs = await query(sql, params);
    return logs;
  },
};

module.exports = activityLogService;

