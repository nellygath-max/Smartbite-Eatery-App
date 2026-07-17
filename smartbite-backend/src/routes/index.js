const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./authRoutes');
const sampleRoutes = require('./sampleRoutes');
const menuRoutes = require('./menuRoutes');
const menuCategoryRoutes = require('./menuCategoryRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/sample', sampleRoutes);
router.use('/menu', menuRoutes);
router.use('/menu-categories', menuCategoryRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
