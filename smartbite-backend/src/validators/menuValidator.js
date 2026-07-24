const { body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const menuFields = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('description').optional().isString().trim().notEmpty().withMessage('Description cannot be empty.'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number.').toFloat(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative whole number.').toInt(),
  body('category').optional().isMongoId().withMessage('Category must be a valid category id.'),
  body('available').optional().isBoolean().withMessage('Available must be true or false.').toBoolean(),
];

const createMenuValidation = [
  body('name').isString().trim().notEmpty().withMessage('Name is required.'),
  body('description').isString().trim().notEmpty().withMessage('Description is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.').toFloat(),
  body('category').isMongoId().withMessage('Category is required and must be a valid category id.'),
  ...menuFields.slice(3, 4),
  ...menuFields.slice(5),
  handleValidationErrors,
];

const updateMenuValidation = [
  body().custom((value) => {
    const editableFields = ['name', 'description', 'price', 'stock', 'category', 'available'];
    if (!value || !Object.keys(value).some((key) => editableFields.includes(key))) {
      throw new Error('Provide at least one menu field to update.');
    }
    return true;
  }),
  ...menuFields,
  handleValidationErrors,
];

const restockMenuValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Restock quantity must be a whole number of at least 1.')
    .toInt(),
  handleValidationErrors,
];

module.exports = { createMenuValidation, updateMenuValidation, restockMenuValidation };
