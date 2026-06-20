const { pool } = require('../config/db');

const ReviewModel = {
  create: async ({ user_id, service_id, rating, comment }) => {
    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, service_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, service_id) 
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
       RETURNING *`,
      [user_id, service_id, rating, comment]
    );
    return rows[0];
  },

  findByService: async (service_id) => {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.service_id = $1
       ORDER BY r.created_at DESC`,
      [service_id]
    );
    return rows;
  },

  getStatsByService: async (service_id) => {
    const { rows } = await pool.query(
      `SELECT 
         COALESCE(AVG(rating), 0) AS avg_rating,
         COUNT(*) AS rating_count
       FROM reviews
       WHERE service_id = $1`,
      [service_id]
    );
    return {
      avg_rating: parseFloat(rows[0].avg_rating).toFixed(1),
      rating_count: parseInt(rows[0].rating_count),
    };
  },
};

module.exports = ReviewModel;
