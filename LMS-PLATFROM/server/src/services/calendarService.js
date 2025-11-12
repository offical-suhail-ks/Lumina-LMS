/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const calendarService = {
  async getAll() {
    const events = await query(
      `SELECT 
        id, title, description, event_date as eventDate, 
        event_time as eventTime, assignment_id as assignmentId,
        created_at as createdAt, updated_at as updatedAt
      FROM calendar_events
      ORDER BY event_date ASC, event_time ASC`
    );
    return events;
  },

  async getByDate(date) {
    const events = await query(
      `SELECT 
        id, title, description, event_date as eventDate, 
        event_time as eventTime, assignment_id as assignmentId,
        created_at as createdAt, updated_at as updatedAt
      FROM calendar_events
      WHERE event_date = ?
      ORDER BY event_time ASC`,
      [date]
    );
    return events;
  },

  async create(eventData) {
    const id = `event-${uuid()}`;
    const { title, description, eventDate, eventTime, assignmentId } = eventData;

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

    // Format time to HH:MM:SS format
    const formatTime = (timeValue) => {
      if (!timeValue) return null;
      if (typeof timeValue === 'string') {
        // If it's an ISO string with time, extract just the time part
        if (timeValue.includes('T')) {
          const timePart = timeValue.split('T')[1];
          return timePart.split('.')[0].substring(0, 8); // Get HH:MM:SS
        }
        // If it's already in HH:MM format, add seconds if needed
        if (timeValue.match(/^\d{2}:\d{2}$/)) {
          return `${timeValue}:00`;
        }
        return timeValue;
      }
      return null;
    };

    await query(
      `INSERT INTO calendar_events (id, title, description, event_date, event_time, assignment_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, formatDate(eventDate), formatTime(eventTime), assignmentId || null]
    );

    return this.getById(id);
  },

  async getById(id) {
    const [event] = await query(
      `SELECT 
        id, title, description, event_date as eventDate, 
        event_time as eventTime, assignment_id as assignmentId,
        created_at as createdAt, updated_at as updatedAt
      FROM calendar_events
      WHERE id = ?`,
      [id]
    );
    return event || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM calendar_events WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = calendarService;

