const { pool } = require('../config/db');

const NotificationModel = {
  /**
   * Create a new notification
   * @param {string} user_id
   * @param {string} title
   * @param {string} message
   * @returns {Promise<object>}
   */
  create: async (user_id, title, message) => {
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, title, message]
    );
    return rows[0];
  },

  /**
   * Find notifications for a specific user
   * @param {string} user_id
   * @returns {Promise<object[]>}
   */
  findByUser: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  /**
   * Mark a specific notification as read
   * @param {string} id
   * @param {string} user_id
   * @returns {Promise<object|null>}
   */
  markAsRead: async (id, user_id) => {
    const { rows } = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );
    return rows[0] || null;
  },

  /**
   * Mark all notifications as read for a specific user
   * @param {string} user_id
   * @returns {Promise<number>}
   */
  markAllAsRead: async (user_id) => {
    const { rowCount } = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );
    return rowCount;
  },

  /**
   * Delete a specific notification
   * @param {string} id
   * @param {string} user_id
   * @returns {Promise<boolean>}
   */
  delete: async (id, user_id) => {
    const { rowCount } = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    return rowCount > 0;
  },

  /**
   * Get the count of unread notifications for a user
   * @param {string} user_id
   * @returns {Promise<number>}
   */
  getUnreadCount: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );
    return parseInt(rows[0].count, 10);
  }
};

module.exports = NotificationModel;
