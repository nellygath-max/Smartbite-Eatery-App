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
    .isIn(['payment_on_delivery', 'paystack'])
    .withMessage('Payment method must be payment_on_delivery or paystack.'),
  body('paystackChannel')
    .optional()
    .isIn(['card', 'bank_transfer'])
    .withMessage('Choose card or bank_transfer for the Paystack payment type.'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Order notes cannot exceed 500 characters.'),
  handleValidationErrors,
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Provide a valid order status.'),
  handleValidationErrors,
];

const updatePaymentStatusValidation = [
  body('paymentStatus')
    .isIn(['unpaid', 'paid'])
    .withMessage('Provide a valid payment status.'),
  handleValidationErrors,
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
  updatePaymentStatusValidation,
};
