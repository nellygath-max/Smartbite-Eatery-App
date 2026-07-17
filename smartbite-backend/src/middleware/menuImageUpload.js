const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.resolve(__dirname, '..', '..', 'uploads', 'menu');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensionByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${extensionByMimeType[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!extensionByMimeType[file.mimetype]) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    }
    return callback(null, true);
  },
}).single('image');

const handleMenuImageUpload = (required) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5 MB or smaller.'
        : 'Upload one JPEG, PNG, or WebP image in the image field.';
      return res.status(400).json({ success: false, message });
    }
    if (required && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data.',
        errors: [{ field: 'image', message: 'Image is required. Please upload a menu image.' }],
      });
    }
    return next();
  });
};

const uploadMenuImage = handleMenuImageUpload(true);
const uploadMenuImageOptional = handleMenuImageUpload(false);

module.exports = { uploadDirectory, uploadMenuImage, uploadMenuImageOptional };
