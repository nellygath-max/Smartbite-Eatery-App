const express = require('express');
const {
  getMenuCategories,
  getMenuCategory,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} = require('../controllers/menuCategoryController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createMenuCategoryValidation,
  updateMenuCategoryValidation,
} = require('../validators/menuCategoryValidator');

const router = express.Router();

router.get('/', getMenuCategories);
router.get('/:id', getMenuCategory);

router.post('/', authenticate, authorize('admin'), createMenuCategoryValidation, createMenuCategory);
router.patch('/:id', authenticate, authorize('admin'), updateMenuCategoryValidation, updateMenuCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteMenuCategory);

module.exports = router;
