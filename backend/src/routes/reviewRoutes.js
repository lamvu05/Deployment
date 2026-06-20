const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

const reviewRules = [
  body('service_id').isUUID().withMessage('Mã dịch vụ không hợp lệ'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Đánh giá phải từ 1 đến 5 sao'),
  body('comment').optional().trim().isString(),
];

// Public can read reviews of a service
router.get('/service/:serviceId', ctrl.getByService);

// Authenticated users can write a review
router.post('/', authenticate, reviewRules, validate, ctrl.create);

module.exports = router;
