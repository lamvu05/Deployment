const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes below require a valid JWT
router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
