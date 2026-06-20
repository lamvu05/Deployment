const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Middleware: Verify JWT and attach user to req
 */
const authenticate = catchAsync(async (req, _res, next) => {
  // 1. Extract token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }
  const token = authHeader.split(' ')[1];

  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Check user still exists
  const user = await UserModel.findById(decoded.id);
  if (!user) throw new AppError('User belonging to this token no longer exists.', 401);
  if (!user.is_active) throw new AppError('Account is deactivated.', 403);

  // 4. Attach to request
  req.user = user;
  next();
});

/**
 * Middleware: Role-based access control
 * @param {...string} roles — allowed roles e.g. 'admin'
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
