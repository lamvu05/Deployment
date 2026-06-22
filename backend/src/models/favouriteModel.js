const { pool } = require('../config/db');

const FavouriteModel = {
  /**
   * Add a service to user's favorites
   * @param {string} user_id
   * @param {string} service_id
   * @returns {Promise<object|null>}
   */
  add: async (user_id, service_id) => {
    const { rows } = await pool.query(
      `INSERT INTO favourites (user_id, service_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, service_id) DO NOTHING
       RETURNING *`,
      [user_id, service_id]
    );
    return rows[0] || null;
  },

  /**
   * Remove a service from user's favorites
   * @param {string} user_id
   * @param {string} service_id
   * @returns {Promise<boolean>}
   */
  remove: async (user_id, service_id) => {
    const { rowCount } = await pool.query(
      `DELETE FROM favourites WHERE user_id = $1 AND service_id = $2`,
      [user_id, service_id]
    );
    return rowCount > 0;
  },

  /**
   * Get all favorite services of a user
   * @param {string} user_id
   * @returns {Promise<object[]>}
   */
  findByUser: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT f.id AS favourite_id, f.created_at AS favourited_at, s.*
       FROM favourites f
       JOIN services s ON f.service_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  /**
   * Check if a service is already favorited by a user
   * @param {string} user_id
   * @param {string} service_id
   * @returns {Promise<boolean>}
   */
  isFavorited: async (user_id, service_id) => {
    const { rows } = await pool.query(
      `SELECT 1 FROM favourites WHERE user_id = $1 AND service_id = $2 LIMIT 1`,
      [user_id, service_id]
    );
    return rows.length > 0;
  }
};

module.exports = FavouriteModel;
