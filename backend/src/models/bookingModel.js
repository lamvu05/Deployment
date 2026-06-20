const { pool } = require('../config/db');

const BookingModel = {
  /** Create new booking */
  create: async ({ user_id, service_id, booking_date, start_time, end_time, notes }) => {
    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, service_id, booking_date, start_time, end_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, service_id, booking_date, start_time, end_time, notes]
    );
    return rows[0];
  },

  /** Check if a slot overlaps any existing non-cancelled booking */
  checkOverlap: async (service_id, booking_date, start_time, end_time, excludeId = null) => {
    const query = `
      SELECT id FROM bookings
      WHERE service_id = $1
        AND booking_date = $2
        AND status != 'cancelled'
        AND start_time < $4
        AND end_time   > $3
        ${excludeId ? 'AND id != $5' : ''}
      LIMIT 1
    `;
    const params = excludeId
      ? [service_id, booking_date, start_time, end_time, excludeId]
      : [service_id, booking_date, start_time, end_time];
    const { rows } = await pool.query(query, params);
    return rows.length > 0;
  },

  /** Get bookings by user (with service info) */
  findByUser: async (user_id) => {
    const { rows } = await pool.query(
      `SELECT b.*, s.name AS service_name, s.location, s.price, s.duration_minutes
       FROM bookings b JOIN services s ON b.service_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [user_id]
    );
    return rows;
  },

  /** Get all bookings (admin) */
  findAll: async ({ status, date, page = 1, limit = 20 } = {}) => {
    const conditions = [];
    const params = [];
    let i = 1;
    if (status) { conditions.push(`b.status = $${i++}`); params.push(status); }
    if (date)   { conditions.push(`b.booking_date = $${i++}`); params.push(date); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT b.*, s.name AS service_name, s.location,
              u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users    u ON b.user_id    = u.id
       ${where}
       ORDER BY b.booking_date DESC, b.start_time DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bookings b ${where}`,
      params.slice(0, -2)
    );
    return { rows, total: parseInt(countResult.rows[0].count) };
  },

  /** Find by ID */
  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT b.*, s.name AS service_name, s.location, s.price,
              u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users    u ON b.user_id    = u.id
       WHERE b.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Update status */
  updateStatus: async (id, status) => {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  },

  /** Stats for admin dashboard */
  getStats: async () => {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*)                                      AS total,
        COALESCE(SUM(s.price) FILTER (WHERE b.status = 'confirmed'), 0) AS revenue
      FROM bookings b JOIN services s ON b.service_id = s.id
    `);

    const { rows: today } = await pool.query(`
      SELECT COUNT(*) AS today_bookings
      FROM bookings WHERE booking_date = CURRENT_DATE AND status != 'cancelled'
    `);

    const { rows: upcoming } = await pool.query(`
      SELECT b.*, s.name AS service_name, u.name AS user_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users    u ON b.user_id    = u.id
      WHERE b.booking_date >= CURRENT_DATE AND b.status != 'cancelled'
      ORDER BY b.booking_date ASC, b.start_time ASC
      LIMIT 5
    `);

    return { ...rows[0], ...today[0], upcoming };
  },

  /** Get booked time slots for a service on a given date */
  getBookedSlots: async (service_id, booking_date) => {
    const { rows } = await pool.query(
      `SELECT start_time, end_time, status FROM bookings
       WHERE service_id = $1 AND booking_date = $2 AND status != 'cancelled'
       ORDER BY start_time`,
      [service_id, booking_date]
    );
    return rows;
  },
};

module.exports = BookingModel;
