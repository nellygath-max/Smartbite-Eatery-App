const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/user');
const { signupValidation, loginValidation } = require('../validators/authValidator');
const { authRateLimit } = require('../middleware/authRateLimit');

router.post('/signup', authRateLimit, signupValidation, signup);
router.post('/login', authRateLimit, loginValidation, login);
router.post('/logout', authenticate, logout);

// GET /api/auth/profile
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

// GET /api/auth/admin/users
router.get('/admin/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
