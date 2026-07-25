const express = require('express');
const {
  createOrder,
  getMyOrder,
  getMyOrders,
  verifyPaystackPayment,
  cancelPaystackPayment,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { createOrderValidation } = require('../validators/orderValidator');

const router = express.Router();

router.post('/', authenticate, createOrderValidation, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getMyOrder);
router.post('/:id/paystack/verify', authenticate, verifyPaystackPayment);
router.delete('/:id/paystack', authenticate, cancelPaystackPayment);

module.exports = router;
