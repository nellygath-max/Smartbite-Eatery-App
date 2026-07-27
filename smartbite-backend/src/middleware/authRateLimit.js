const {
  AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  AUTH_RATE_LIMIT_WINDOW_MS,
} = require('../config/env');

const attempts = new Map();

const authRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const entry = attempts.get(key);

  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= AUTH_RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    });
  }

  entry.count += 1;
  return next();
};

module.exports = { authRateLimit };
