const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuImage,
} = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');
const { createMenuValidation, updateMenuValidation } = require('../validators/menuValidator');
const { uploadMenuImage, uploadMenuImageOptional } = require('../middleware/menuImageUpload');

const router = express.Router();

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), uploadMenuImage, createMenuValidation, createMenuItem);
router.put('/:id', authenticate, authorize('admin'), uploadMenuImageOptional, updateMenuValidation, updateMenuItem);
router.patch('/:id/image', authenticate, authorize('admin'), uploadMenuImage, updateMenuImage);
router.delete('/:id', authenticate, authorize('admin'), deleteMenuItem);

module.exports = router;
