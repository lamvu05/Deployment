const express = require('express');
const { body, query } = require('express-validator');
const ctrl = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.use(authenticate); // All booking routes require auth

const bookingRules = [
  body('service_id').isUUID().withMessage('service_id không hợp lệ'),
  body('booking_date').isDate().withMessage('booking_date phải có định dạng YYYY-MM-DD'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time phải có dạng HH:MM'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('end_time phải có dạng HH:MM'),
];

// Slots availability — public (authenticated)
router.get('/slots', ctrl.getSlots);

// Admin routes
router.get('/stats', authorize('admin'), ctrl.getStats);
router.get('/', authorize('admin'), ctrl.getAll);
router.patch('/:id/confirm', authorize('admin'), ctrl.confirm);

// User routes
router.get('/my', ctrl.getMyBookings);
router.post('/', bookingRules, validate, ctrl.create);
router.get('/:id', ctrl.getById);
router.patch('/:id/cancel', ctrl.cancel);

module.exports = router;
