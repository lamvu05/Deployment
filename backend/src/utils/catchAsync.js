/**
 * Wraps an async route handler and forwards errors to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - async route handler (req, res, next)
 * @returns {Function}
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { catchAsync };
