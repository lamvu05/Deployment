const { pool } = require('../config/db');

const ServiceModel = {
  findAll: async (activeOnly = true) => {
    const where = activeOnly ? 'WHERE s.is_active = TRUE' : '';
    const { rows } = await pool.query(
      `SELECT s.*, 
              COALESCE(AVG(r.rating), 0) AS avg_rating, 
              COUNT(r.id) AS rating_count
       FROM services s
       LEFT JOIN reviews r ON s.id = r.service_id
       ${where}
       GROUP BY s.id
       ORDER BY s.created_at ASC`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT s.*, 
              COALESCE(AVG(r.rating), 0) AS avg_rating, 
              COUNT(r.id) AS rating_count
       FROM services s
       LEFT JOIN reviews r ON s.id = r.service_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, description, duration_minutes, price, capacity, location, image_url }) => {
    const { rows } = await pool.query(
      `INSERT INTO services (name, description, duration_minutes, price, capacity, location, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description, duration_minutes, price, capacity, location, image_url]
    );
    return rows[0];
  },

  update: async (id, fields) => {
    const allowed = ['name','description','duration_minutes','price','capacity','location','image_url','is_active'];
    const sets = [];
    const vals = [];
    let i = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) { sets.push(`${key} = $${i++}`); vals.push(fields[key]); }
    }
    if (!sets.length) return null;
    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE services SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals
    );
    return rows[0] || null;
  },

  delete: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM services WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ServiceModel;
