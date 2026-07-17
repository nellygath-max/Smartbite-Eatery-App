const { body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const categoryFields = [
  body('name').optional().isString().trim().notEmpty().isLength({ max: 80 })
    .withMessage('Name must be a non-empty string of at most 80 characters.'),
  body('description').optional().isString().trim().isLength({ max: 500 })
    .withMessage('Description must be a string of at most 500 characters.'),
  body('active').optional().isBoolean().withMessage('Active must be true or false.').toBoolean(),
];

const createMenuCategoryValidation = [
  body('name').isString().trim().notEmpty().isLength({ max: 80 })
    .withMessage('Name is required and must be at most 80 characters.'),
  ...categoryFields.slice(1),
  handleValidationErrors,
];

const updateMenuCategoryValidation = [
  body().custom((value) => {
    const editableFields = ['name', 'description', 'active'];
    if (!value || !Object.keys(value).some((key) => editableFields.includes(key))) {
      throw new Error('Provide at least one category field to update.');
    }
    return true;
  }),
  ...categoryFields,
  handleValidationErrors,
];

module.exports = { createMenuCategoryValidation, updateMenuCategoryValidation };
