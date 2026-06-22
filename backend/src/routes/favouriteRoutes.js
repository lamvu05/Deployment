const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/favouriteController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes here require authentication
router.use(authenticate);

const addRules = [
  body('service_id').isUUID().withMessage('Mã dịch vụ (service_id) phải là định dạng UUID hợp lệ')
];

router.get('/', ctrl.getMyFavourites);
router.post('/', addRules, validate, ctrl.add);
router.get('/check/:serviceId', ctrl.checkIsFavourite);
router.delete('/:serviceId', ctrl.remove);

module.exports = router;
