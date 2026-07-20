const Menu = require('../models/menu');
const MenuCategory = require('../models/menuCategory');
const { destroyCloudinaryAsset } = require('../config/cloudinary');

const allowedFields = ['name', 'description', 'price', 'stock', 'category', 'available'];

const pickMenuFields = (body) => Object.fromEntries(
  Object.entries(body).filter(([key]) => allowedFields.includes(key))
);

const uploadedImage = (file) => (file ? { url: file.path, publicId: file.filename } : undefined);

exports.getMenuItems = async (req, res) => {
  try {
    const items = await Menu.find().populate('category').sort({ name: 1 });
    return res.status(200).json({ success: true, items, menuItems: items });
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
  const image = uploadedImage(req.file);
  if (!image) {
    return res.status(400).json({ success: false, message: 'A menu image is required.' });
  }
  try {
    const menuData = pickMenuFields(req.body);
    menuData.imageUrl = image.url;
    menuData.imagePublicId = image.publicId;
    const category = await MenuCategory.findOne({ _id: menuData.category, active: true });
    if (!category) {
      await destroyCloudinaryAsset(image.publicId);
      return res.status(400).json({ success: false, message: 'Choose an active menu category.' });
    }
    if (Object.hasOwn(menuData, 'stock')) {
      menuData.available = menuData.stock > 0;
    }
    const item = await Menu.create(menuData);
    await item.populate('category');
    return res.status(201).json({ success: true, item });
  } catch (err) {
    await destroyCloudinaryAsset(image && image.publicId);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Create menu item error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating menu item.' });
  }
};

exports.updateMenuItem = async (req, res) => {
  const image = uploadedImage(req.file);
  try {
    const menuData = pickMenuFields(req.body);
    if (image) {
      menuData.imageUrl = image.url;
      menuData.imagePublicId = image.publicId;
    }
    if (Object.hasOwn(menuData, 'category')) {
      const category = await MenuCategory.findOne({ _id: menuData.category, active: true });
      if (!category) {
        await destroyCloudinaryAsset(image && image.publicId);
        return res.status(400).json({ success: false, message: 'Choose an active menu category.' });
      }
    }
    if (Object.hasOwn(menuData, 'stock')) {
      menuData.available = menuData.stock > 0;
    }
    const previousItem = image ? await Menu.findById(req.params.id).select('imagePublicId') : null;
    const item = await Menu.findByIdAndUpdate(
      req.params.id,
      menuData,
      { new: true, runValidators: true }
    );
    if (!item) {
      await destroyCloudinaryAsset(image && image.publicId);
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    if (image) {
      await destroyCloudinaryAsset(previousItem.imagePublicId);
    }
    await item.populate('category');
    return res.status(200).json({ success: true, item });
  } catch (err) {
    await destroyCloudinaryAsset(image && image.publicId);
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
    await destroyCloudinaryAsset(item.imagePublicId);
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
  const image = uploadedImage(req.file);
  if (!image) {
    return res.status(400).json({ success: false, message: 'A menu image is required.' });
  }

  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      await destroyCloudinaryAsset(image && image.publicId);
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const previousImagePublicId = item.imagePublicId;
    item.imageUrl = image.url;
    item.imagePublicId = image.publicId;
    await item.save();
    await destroyCloudinaryAsset(previousImagePublicId);

    return res.status(200).json({ success: true, item });
  } catch (err) {
    await destroyCloudinaryAsset(image && image.publicId);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    console.error('Update menu image error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating menu image.' });
  }
};
