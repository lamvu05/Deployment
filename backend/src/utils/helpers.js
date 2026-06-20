/**
 * Format a Date object to a readable string
 * @param {Date|string} date
 * @param {string} locale
 * @returns {string}
 */
const formatDate = (date, locale = 'vi-VN') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Remove sensitive fields from a user object before sending to client
 * @param {object} user
 * @returns {object}
 */
const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

/**
 * Paginate an array (for in-memory use; prefer SQL LIMIT/OFFSET for DB queries)
 * @param {any[]} array
 * @param {number} page
 * @param {number} limit
 * @returns {{ data: any[], total: number, page: number, pages: number }}
 */
const paginate = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const data = array.slice(start, start + limit);
  return { data, total: array.length, page, pages: Math.ceil(array.length / limit) };
};

module.exports = { formatDate, sanitizeUser, paginate };
