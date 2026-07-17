const Menu = require('../models/menu');
const MenuCategory = require('../models/menuCategory');

const allowedFields = ['name', 'description', 'active'];
const pickCategoryFields = (body) => Object.fromEntries(
  Object.entries(body).filter(([key]) => allowedFields.includes(key))
);

const handleCategoryError = (err, res, action) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid category id.' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
  }
  console.error(`${action} menu category error:`, err);
  return res.status(500).json({ success: false, message: `Server error ${action.toLowerCase()} menu category.` });
};

exports.getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find({ active: true })
      .select('-imageUrl')
      .sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    return handleCategoryError(err, res, 'retrieving');
  }
};

exports.getMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id).select('-imageUrl');
    if (!category || !category.active) {
      return res.status(404).json({ success: false, message: 'Menu category not found.' });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    return handleCategoryError(err, res, 'retrieving');
  }
};

exports.createMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.create(pickCategoryFields(req.body));
    return res.status(201).json({ success: true, category });
  } catch (err) {
    return handleCategoryError(err, res, 'creating');
  }
};

exports.updateMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(
      req.params.id,
      pickCategoryFields(req.body),
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Menu category not found.' });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    return handleCategoryError(err, res, 'updating');
  }
};

exports.deleteMenuCategory = async (req, res) => {
  try {
    const inUse = await Menu.exists({ category: req.params.id });
    if (inUse) {
      return res.status(409).json({
        success: false,
        message: 'This category is assigned to menu items and cannot be deleted.',
      });
    }

    const category = await MenuCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Menu category not found.' });
    }
    return res.status(200).json({ success: true, message: 'Menu category deleted.' });
  } catch (err) {
    return handleCategoryError(err, res, 'deleting');
  }
};
