const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

const serviceRules = [
  body('name').trim().notEmpty().withMessage('Tên dịch vụ là bắt buộc'),
  body('duration_minutes').isInt({ min: 15 }).withMessage('Thời lượng tối thiểu 15 phút'),
  body('price').isFloat({ min: 0 }).withMessage('Giá không hợp lệ'),
  body('capacity').isInt({ min: 1 }).withMessage('Sức chứa tối thiểu 1'),
];

router.get('/',           ctrl.getAll);           // public
router.get('/:id',        ctrl.getById);           // public
router.post('/',          authenticate, authorize('admin'), serviceRules, validate, ctrl.create);
router.patch('/:id',      authenticate, authorize('admin'), ctrl.update);
router.delete('/:id',     authenticate, authorize('admin'), ctrl.remove);

module.exports = router;
