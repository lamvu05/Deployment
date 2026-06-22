const NotificationModel = require('../models/notificationModel');
const AppError = require('../utils/AppError');

const NotificationService = {
  /**
   * Create a new notification
   * @param {string} userId
   * @param {string} title
   * @param {string} message
   */
  createNotification: async (userId, title, message) => {
    return NotificationModel.create(userId, title, message);
  },

  /**
   * Get user's notification list
   * @param {string} userId
   */
  getMyNotifications: async (userId) => {
    return NotificationModel.findByUser(userId);
  },

  /**
   * Mark a notification as read
   * @param {string} userId
   * @param {string} notificationId
   */
  markAsRead: async (userId, notificationId) => {
    const notification = await NotificationModel.markAsRead(notificationId, userId);
    if (!notification) {
      throw new AppError('Thông báo không tồn tại hoặc không thuộc về người dùng này', 404);
    }
    return notification;
  },

  /**
   * Mark all notifications as read for the user
   * @param {string} userId
   */
  markAllAsRead: async (userId) => {
    return NotificationModel.markAllAsRead(userId);
  },

  /**
   * Delete a specific notification
   * @param {string} userId
   * @param {string} notificationId
   */
  deleteNotification: async (userId, notificationId) => {
    const deleted = await NotificationModel.delete(notificationId, userId);
    if (!deleted) {
      throw new AppError('Thông báo không tồn tại hoặc không thuộc về người dùng này', 404);
    }
    return { message: 'Đã xóa thông báo thành công' };
  },

  /**
   * Get count of unread notifications
   * @param {string} userId
   */
  getUnreadCount: async (userId) => {
    const count = await NotificationModel.getUnreadCount(userId);
    return { unread_count: count };
  }
};

module.exports = NotificationService;
