const crypto = require('crypto');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const extensionByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartbite/menu',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'webp'],
    public_id: () => crypto.randomUUID(),
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
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({
      success: false,
      message: 'Image uploads are unavailable because Cloudinary is not configured.',
    });
  }

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

module.exports = { uploadMenuImage, uploadMenuImageOptional };
