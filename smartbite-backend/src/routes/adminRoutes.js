const express = require('express');
const {
  getDashboard,
  getUsers,
  updateUserRole,
} = require('../controllers/adminController');
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { updateUserRoleValidation } = require('../validators/adminValidator');
const { updateOrderStatusValidation } = require('../validators/orderValidator');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRoleValidation, updateUserRole);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatusValidation, updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

module.exports = router;
