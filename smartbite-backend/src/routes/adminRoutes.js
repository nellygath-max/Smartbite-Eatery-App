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
  deleteOrder,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { updateUserRoleValidation, createUserValidation } = require('../validators/adminValidator');
const { updateOrderStatusValidation } = require('../validators/orderValidator');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.post('/users', authenticate, authorize('admin'), createUserValidation, createUser);
router.patch('/users/:id/role', authenticate, authorize('admin'), updateUserRoleValidation, updateUserRole);
router.get('/orders', authenticate, authorize('admin', 'delivery_staff'), getAllOrders);
router.patch('/orders/:id/status', authenticate, authorize('admin', 'delivery_staff'), updateOrderStatusValidation, updateOrderStatus);
router.delete('/orders/:id', authenticate, authorize('admin'), deleteOrder);

module.exports = router;
