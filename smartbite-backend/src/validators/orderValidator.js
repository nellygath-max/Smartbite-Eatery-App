const { body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Provide at least one order item.'),
  body('items.*.menuItem').isMongoId().withMessage('Each item requires a valid menu item id.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be a whole number of at least 1.').toInt(),
  body('deliveryAddress')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required.')
    .isLength({ max: 300 })
    .withMessage('Delivery address cannot exceed 300 characters.'),
  body('paymentMethod')
    .optional()
    .isIn(['cash_on_delivery'])
    .withMessage('Payment method must be cash_on_delivery.'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Order notes cannot exceed 500 characters.'),
  handleValidationErrors,
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Provide a valid order status.'),
  handleValidationErrors,
];

module.exports = { createOrderValidation, updateOrderStatusValidation };
