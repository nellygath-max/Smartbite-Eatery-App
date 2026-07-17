const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

// Deliberately keyed only by the socket address: do not trust forwarded headers
// unless this application is explicitly configured with a trusted proxy.
const authRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = req.socket.remoteAddress || 'unknown';
  const entry = attempts.get(key);

  if (!entry || now >= entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
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
