function validateSample(req, res, next) {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  next();
}

module.exports = { validateSample };
