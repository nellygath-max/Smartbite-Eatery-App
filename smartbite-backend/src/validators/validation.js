const { validationResult } = require('express-validator');
const { destroyCloudinaryAsset } = require('../config/cloudinary');

const removeRejectedUpload = async (file) => {
  if (!file) return;
  await destroyCloudinaryAsset(file.filename);
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
