const NotificationService = require('../services/notificationService');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Controller for Notifications operations
 */
const getMyNotifications = catchAsync(async (req, res) => {
  const notifications = await NotificationService.getMyNotifications(req.user.id);
  res.json({
    status: 'success',
    results: notifications.length,
    data: { notifications }
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await NotificationService.markAsRead(req.user.id, id);
  res.json({
    status: 'success',
    message: 'Đã đánh dấu là đã đọc',
    data: { notification }
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const count = await NotificationService.markAllAsRead(req.user.id);
  res.json({
    status: 'success',
    message: `Đã đánh dấu ${count} thông báo là đã đọc`,
    data: { updated_count: count }
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.deleteNotification(req.user.id, id);
  res.json({
    status: 'success',
    message: result.message
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await NotificationService.getUnreadCount(req.user.id);
  res.json({
    status: 'success',
    data: count
  });
});

// A demo notification creation helper to help the user test locally
const createDemoNotification = catchAsync(async (req, res) => {
  const { title, message } = req.body;
  const notification = await NotificationService.createNotification(
    req.user.id,
    title || 'Thông báo thử nghiệm',
    message || 'Đây là thông báo thử nghiệm được tạo lúc ' + new Date().toLocaleTimeString()
  );
  res.status(201).json({
    status: 'success',
    message: 'Đã tạo thông báo thử nghiệm thành công!',
    data: { notification }
  });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createDemoNotification
};
