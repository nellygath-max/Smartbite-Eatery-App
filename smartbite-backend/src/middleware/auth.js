const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = require('../config/env');

// Verifies a Bearer token and makes the authenticated user available to routes.
const authenticate = async (req, res, next) => {
  const authorization = req.get('Authorization');

  const bearerMatch = authorization && /^Bearer\s+([^\s]+)$/i.exec(authorization);
  if (!bearerMatch) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Use a Bearer token.',
    });
  }

  const token = bearerMatch[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (
      typeof decoded.id !== 'string'
      || decoded.sub !== decoded.id
      || !Number.isSafeInteger(decoded.tv)
    ) {
      throw new jwt.JsonWebTokenError('Invalid token claims');
    }

    const user = await User.findById(decoded.id).select('+tokenVersion');

    if (!user || user.tokenVersion !== decoded.tv) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is no longer valid.',
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Authentication token has expired.'
      : 'Invalid authentication token.';

    return res.status(401).json({ success: false, message });
  }
};

// Restricts a route to one or more roles. Use after authenticate.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
    });
  }

  return next();
};

module.exports = { authenticate, authorize };
