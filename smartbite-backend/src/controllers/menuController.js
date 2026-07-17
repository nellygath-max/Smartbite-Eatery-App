const Menu = require('../models/menu');
const MenuCategory = require('../models/menuCategory');
const fs = require('fs/promises');
const path = require('path');
const { uploadDirectory } = require('../middleware/menuImageUpload');

const allowedFields = ['name', 'description', 'price', 'stock', 'category', 'available'];

const pickMenuFields = (body) => Object.fromEntries(
  Object.entries(body).filter(([key]) => allowedFields.includes(key))
);

const uploadedImageUrl = (file) => (file ? `/uploads/menu/${file.filename}` : undefined);

const removeLocalImage = async (imageUrl) => {
  const urlPrefix = '/uploads/menu/';
  if (!imageUrl || !imageUrl.startsWith(urlPrefix)) {
    return;
  }

  const filePath = path.resolve(uploadDirectory, imageUrl.slice(urlPrefix.length));
  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Remove menu image error:', err);
    }
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const items = await Menu.find().populate('category').sort({ name: 1 });
    return res.status(200).json({ success: true, items });
  } catch (err) {
    console.error('Get menu error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving menu items.' });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id).populate('category');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    return res.status(200).json({ success: true, item });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    console.error('Get menu item error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving menu item.' });
  }
};

exports.createMenuItem = async (req, res) => {
  const imageUrl = uploadedImageUrl(req.file);
  try {
    const menuData = pickMenuFields(req.body);
    menuData.imageUrl = imageUrl;
    const category = await MenuCategory.findOne({ _id: menuData.category, active: true });
    if (!category) {
      await removeLocalImage(imageUrl);
      return res.status(400).json({ success: false, message: 'Choose an active menu category.' });
    }
    if (Object.hasOwn(menuData, 'stock')) {
      menuData.available = menuData.stock > 0;
    }
    const item = await Menu.create(menuData);
    await item.populate('category');
    return res.status(201).json({ success: true, item });
  } catch (err) {
    await removeLocalImage(imageUrl);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Create menu item error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating menu item.' });
  }
};

exports.updateMenuItem = async (req, res) => {
  const imageUrl = uploadedImageUrl(req.file);
  try {
    const menuData = pickMenuFields(req.body);
    if (imageUrl) {
      menuData.imageUrl = imageUrl;
    }
    if (Object.hasOwn(menuData, 'category')) {
      const category = await MenuCategory.findOne({ _id: menuData.category, active: true });
      if (!category) {
        await removeLocalImage(imageUrl);
        return res.status(400).json({ success: false, message: 'Choose an active menu category.' });
      }
    }
    if (Object.hasOwn(menuData, 'stock')) {
      menuData.available = menuData.stock > 0;
    }
    const previousItem = imageUrl ? await Menu.findById(req.params.id).select('imageUrl') : null;
    const item = await Menu.findByIdAndUpdate(
      req.params.id,
      menuData,
      { new: true, runValidators: true }
    );
    if (!item) {
      await removeLocalImage(imageUrl);
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    if (imageUrl) {
      await removeLocalImage(previousItem.imageUrl);
    }
    await item.populate('category');
    return res.status(200).json({ success: true, item });
  } catch (err) {
    await removeLocalImage(imageUrl);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Update menu item error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating menu item.' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    await removeLocalImage(item.imageUrl);
    return res.status(200).json({ success: true, message: 'Menu item deleted.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    console.error('Delete menu item error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting menu item.' });
  }
};

exports.updateMenuImage = async (req, res) => {
  const imageUrl = uploadedImageUrl(req.file);

  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      await removeLocalImage(imageUrl);
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const previousImageUrl = item.imageUrl;
    item.imageUrl = imageUrl;
    await item.save();
    await removeLocalImage(previousImageUrl);

    return res.status(200).json({ success: true, item });
  } catch (err) {
    await removeLocalImage(imageUrl);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    console.error('Update menu image error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating menu image.' });
  }
};
