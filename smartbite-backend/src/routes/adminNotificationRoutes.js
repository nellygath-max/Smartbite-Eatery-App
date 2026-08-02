const express = require('express');
const {
  getAdminNotifications,
  markAdminNotificationRead,
} = require('../controllers/adminNotificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getAdminNotifications);
router.patch('/:id/read', authenticate, authorize('admin'), markAdminNotificationRead);

module.exports = router;