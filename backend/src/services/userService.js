const UserModel = require('../models/userModel');
const AppError = require('../utils/AppError');

/**
 * User Service — business logic for user management
 */
const UserService = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: async () => {
    return UserModel.findAll();
  },

  /**
   * Get a single user by ID
   */
  getUserById: async (id) => {
    const user = await UserModel.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  /**
   * Update user fields
   */
  updateUser: async (id, fields) => {
    const updated = await UserModel.update(id, fields);
    if (!updated) throw new AppError('User not found or nothing to update', 404);
    return updated;
  },

  /**
   * Soft-delete (deactivate) or hard delete a user
   */
  deleteUser: async (id) => {
    const deleted = await UserModel.delete(id);
    if (!deleted) throw new AppError('User not found', 404);
    return { message: 'User deleted successfully' };
  },
};

module.exports = UserService;
