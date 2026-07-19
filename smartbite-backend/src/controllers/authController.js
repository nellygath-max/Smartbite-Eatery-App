const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_EXPIRES_IN } = require('../config/env');

// Helper: sign a JWT for a given user id
const signToken = (user) => {
  const userId = user._id.toString();
  return jwt.sign({ id: userId, tv: user.tokenVersion }, JWT_SECRET, {
    algorithm: 'HS256',
    subject: userId.toString(),
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_EXPIRES_IN,
  });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Password is hashed automatically by the pre('save') hook on the model.
    const user = await User.create({ name, email, password, phone, role: 'user' });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: `Account registered as ${user.role}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: err.message,
    });
  }
};

// POST /api/admin/users -- protected by the admin router.
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({ name, email, password, phone, role });
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Admin user creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating user.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // password has select: false on the schema, so it must be explicitly requested
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +tokenVersion');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message,
    });
  }
};

// POST /api/auth/logout -- invalidates all tokens currently issued to this user.
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    return res.status(204).send();
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};
