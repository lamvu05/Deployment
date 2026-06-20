const AppError = require('../utils/AppError');

/**
 * 404 handler — place before the global error handler
 */
const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Global error handler — must have 4 params for Express to treat it as error middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Development: send full stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production: hide internal errors
  if (err.isOperational) {
    return res.status(statusCode).json({ status, message: err.message });
  }

  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({ status: 'error', message: 'Something went wrong' });
};

module.exports = { notFound, errorHandler };
