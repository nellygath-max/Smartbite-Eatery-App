const { body } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('phone').optional().isString().trim().withMessage('Phone must be a string.'),
  body('role').not().exists().withMessage('Role cannot be set during public signup.'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

module.exports = { signupValidation, loginValidation };
