const { validationResult } = require('express-validator');
const fs = require('fs/promises');

const removeRejectedUpload = async (file) => {
  if (!file || !file.path) return;
  try {
    await fs.unlink(file.path);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Remove rejected upload error:', err);
    }
  }
};

const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  await removeRejectedUpload(req.file);
  return res.status(400).json({
    success: false,
    message: 'Invalid request data.',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
};

module.exports = { handleValidationErrors };
