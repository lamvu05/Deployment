const { pool } = require('../config/db');

/**
 * User Model — raw SQL queries against the "users" table
 */
const UserModel = {
  /**
   * Find a user by their email address
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  findByEmail: async (email) => {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by their UUID
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user record
   * @param {{ name: string, email: string, password: string, role?: string }} data
   * @returns {Promise<object>}
   */
  create: async ({ name, email, password, role = 'user' }) => {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password, role]
    );
    return rows[0];
  },

  /**
   * Return all users (admin use)
   * @returns {Promise<object[]>}
   */
  findAll: async () => {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  /**
   * Update a user by ID
   * @param {string} id
   * @param {{ name?: string, is_active?: boolean }} fields
   * @returns {Promise<object|null>}
   */
  update: async (id, fields) => {
    const setClauses = [];
    const values = [];
    let idx = 1;

    if (fields.name !== undefined) {
      setClauses.push(`name = $${idx++}`);
      values.push(fields.name);
    }
    if (fields.is_active !== undefined) {
      setClauses.push(`is_active = $${idx++}`);
      values.push(fields.is_active);
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, is_active, updated_at`,
      values
    );
    return rows[0] || null;
  },

  /**
   * Delete a user by ID
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};

module.exports = UserModel;
