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
const reviewRoutes = require('./reviewRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/sample', sampleRoutes);
router.use('/menu', menuRoutes);
router.use('/menu-categories', menuCategoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

module.exports = router;
