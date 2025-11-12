/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const facultyService = {
  async getAll() {
    const faculty = await query(
      `SELECT id, username, name, email, role, department, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE role = 'faculty'
      ORDER BY name ASC`
    );
    return faculty;
  },

  async getById(id) {
    const [faculty] = await query(
      `SELECT id, username, name, email, role, department, created_at as createdAt, updated_at as updatedAt
      FROM users
      WHERE id = ? AND role = 'faculty'`,
      [id]
    );
    return faculty || null;
  },

  async create(facultyData) {
    const id = `faculty-${uuid()}`;
    const { name, email, username, password, department } = facultyData;

    await query(
      `INSERT INTO users (id, username, password, role, name, email, department)
      VALUES (?, ?, ?, 'faculty', ?, ?, ?)`,
      [id, username, password, name, email, department || null]
    );

    return this.getById(id);
  },

  async update(id, facultyData) {
    const { name, email, username, password, department } = facultyData;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'faculty'`,
      values
    );

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = ? AND role = ?', [id, 'faculty']);
    return result.affectedRows > 0;
  },
};

module.exports = facultyService;

