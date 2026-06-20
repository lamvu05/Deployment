const UserService = require('../services/userService');
const AppError = require('../utils/AppError');
const { catchAsync } = require('../utils/catchAsync');

/** GET /api/users — Admin only */
const getAllUsers = catchAsync(async (_req, res) => {
  const users = await UserService.getAllUsers();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

/** GET /api/users/:id */
const getUserById = catchAsync(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to view this user profile', 403);
  }
  const user = await UserService.getUserById(req.params.id);
  res.status(200).json({ status: 'success', data: { user } });
});

/** PATCH /api/users/:id */
const updateUser = catchAsync(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to update this user profile', 403);
  }
  const user = await UserService.updateUser(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { user } });
});

/** DELETE /api/users/:id */
const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.params.id);
  res.status(200).json({ status: 'success', data: result });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
