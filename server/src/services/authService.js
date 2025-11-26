/* eslint-env node */

const { query } = require('../db');

const authService = {
  async login(identifier, password) {
    try {
      // Try to find user by username
      // First try with department column
      let user;
      try {
        [user] = await query(
          `SELECT id, username, password, role, name, email, department 
           FROM users 
           WHERE username = ? AND password = ?`,
          [identifier, password]
        );
      } catch (deptError) {
        // If department column doesn't exist, query without it
        if (deptError.message && (deptError.message.includes('department') || deptError.message.includes('does not exist'))) {
          console.log('Department column not found, querying without it');
          [user] = await query(
            `SELECT id, username, password, role, name, email 
             FROM users 
             WHERE username = ? AND password = ?`,
            [identifier, password]
          );
        } else {
          throw deptError;
        }
      }

      // If not found, try to find student by email
      if (!user) {
        [user] = await query(
          `SELECT id, email as username, password, 'student' as role, 
           (first_name || ' ' || last_name) as name, email 
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
    } catch (error) {
      console.error('Login query error:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      throw error;
    }
  },
};

module.exports = authService;

