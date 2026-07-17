const express = require('express');
const {
  createOrder,
  getMyOrders,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { createOrderValidation } = require('../validators/orderValidator');

const router = express.Router();

router.post('/', authenticate, createOrderValidation, createOrder);
router.get('/my-orders', authenticate, getMyOrders);

module.exports = router;
