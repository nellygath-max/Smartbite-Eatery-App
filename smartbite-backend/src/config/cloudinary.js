// Load environment variables before reading Cloudinary credentials. Routes load
// upload middleware before server.js imports the shared environment config.
require('./env');
const { v2: cloudinary } = require('cloudinary');

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

cloudinary.config(cloudinaryConfig);

const isCloudinaryConfigured = () => Object.values(cloudinaryConfig).every(Boolean);

const destroyCloudinaryAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.error('Remove Cloudinary image error:', err);
  }
};

module.exports = { cloudinary, isCloudinaryConfigured, destroyCloudinaryAsset };
