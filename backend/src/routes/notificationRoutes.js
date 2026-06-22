const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

const demoNotificationRules = [
  body('title').notEmpty().withMessage('Tiêu đề không được để trống'),
  body('message').notEmpty().withMessage('Nội dung không được để trống')
];

router.get('/', ctrl.getMyNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.patch('/mark-all-read', ctrl.markAllAsRead);
router.patch('/:id/read', ctrl.markAsRead);
router.delete('/:id', ctrl.deleteNotification);
router.post('/demo', demoNotificationRules, validate, ctrl.createDemoNotification);

module.exports = router;
