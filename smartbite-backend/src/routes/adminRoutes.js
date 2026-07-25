const express = require('express');
const {
  getDashboard,
  getUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { createUser } = require('../controllers/authController');
const {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAdminNotifications,
  markAdminNotificationRead,
} = require('../controllers/adminNotificationController');
const { updateUserRoleValidation, createUserValidation } = require('../validators/adminValidator');
const {
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
} = require('../validators/orderValidator');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.post('/users', authenticate, authorize('admin'), createUserValidation, createUser);
router.patch('/users/:id/role', authenticate, authorize('admin'), updateUserRoleValidation, updateUserRole);
router.get('/orders', authenticate, authorize('admin', 'delivery_staff'), getAllOrders);
router.patch('/orders/:id/status', authenticate, authorize('admin', 'delivery_staff'), updateOrderStatusValidation, updateOrderStatus);
router.patch('/orders/:id/payment-status', authenticate, authorize('admin'), updatePaymentStatusValidation, updatePaymentStatus);
router.delete('/orders/:id', authenticate, authorize('admin'), deleteOrder);
router.get('/notifications', authenticate, authorize('admin'), getAdminNotifications);
router.patch('/notifications/:id/read', authenticate, authorize('admin'), markAdminNotificationRead);

module.exports = router;
