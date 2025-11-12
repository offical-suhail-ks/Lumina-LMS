/* eslint-env node */

const { query } = require('../db');

const authService = {
  async login(identifier, password) {
    // Try to find user by username
    let [user] = await query(
      `SELECT id, username, password, role, name, email, department 
       FROM users 
       WHERE username = ? AND password = ?`,
      [identifier, password]
    );

    // If not found, try to find student by email
    if (!user) {
      [user] = await query(
        `SELECT id, email as username, password, 'student' as role, 
         CONCAT(first_name, ' ', last_name) as name, email 
         FROM students 
         WHERE email = ? AND password = ?`,
        [identifier, password]
      );
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      username: user.username,
      department: user.department || null,
    };
  },
};

module.exports = authService;

