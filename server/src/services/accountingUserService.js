/* eslint-env node */

const { query } = require('../db');
const { v4: uuid } = require('uuid');

const accountingUserService = {
  async getAll() {
    const users = await query(
      `SELECT id, username, role, name, email, created_at as createdAt, updated_at as updatedAt
       FROM users 
       WHERE role = 'accounting'
       ORDER BY created_at DESC`
    );
    return users;
  },

  async getById(id) {
    const [user] = await query(
      `SELECT id, username, role, name, email, created_at as createdAt, updated_at as updatedAt
       FROM users 
       WHERE id = ? AND role = 'accounting'`,
      [id]
    );
    return user || null;
  },

  async create(userData) {
    const id = `accounting-${uuid()}`;
    const { name, email, username, password } = userData;

    await query(
      `INSERT INTO users (id, username, password, role, name, email)
       VALUES (?, ?, ?, 'accounting', ?, ?)`,
      [id, username, password, name, email]
    );

    return this.getById(id);
  },

  async update(id, userData) {
    const { name, email, username, password } = userData;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }

    if (password !== undefined) {
      updates.push('password = ?');
      params.push(password);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND role = 'accounting'`,
      params
    );

    return this.getById(id);
  },

  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = ? AND role = \'accounting\'', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = accountingUserService;

