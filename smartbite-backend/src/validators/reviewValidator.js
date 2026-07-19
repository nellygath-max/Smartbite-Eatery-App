const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const createReviewValidation = [
  body('menuItem').isMongoId().withMessage('Provide a valid menu item id.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.').toInt(),
  body('review')
    .trim()
    .notEmpty()
    .withMessage('Review text is required.')
    .isLength({ max: 1000 })
    .withMessage('Review text cannot exceed 1000 characters.'),
  body('orderId').optional().isMongoId().withMessage('Provide a valid order id.'),
  handleValidationErrors,
];

const updateReviewValidation = [
  param('id').isMongoId().withMessage('Provide a valid review id.'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.').toInt(),
  body('review')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Review text cannot be empty when provided.')
    .isLength({ max: 1000 })
    .withMessage('Review text cannot exceed 1000 characters.'),
  handleValidationErrors,
];

const menuItemIdValidation = [
  param('menuItemId').isMongoId().withMessage('Provide a valid menu item id.'),
  handleValidationErrors,
];

module.exports = { createReviewValidation, updateReviewValidation, menuItemIdValidation };
