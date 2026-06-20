const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, googleLogin } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const googleRules = [
  body('idToken').notEmpty().withMessage('idToken is required'),
];

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/google', googleRules, validate, googleLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
