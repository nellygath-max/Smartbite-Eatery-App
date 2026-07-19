const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('Provide a valid user id.'),
  body('role').isIn(['user', 'admin', 'delivery_staff']).withMessage('Role must be user, admin, or delivery_staff.'),
  handleValidationErrors,
];

const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Provide a valid email address.').normalizeEmail(),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('phone').optional().isString().trim().withMessage('Phone must be a string.'),
  body('role').optional().isIn(['user', 'admin', 'delivery_staff']).withMessage('Role must be user, admin, or delivery_staff.'),
  handleValidationErrors,
];

module.exports = { updateUserRoleValidation, createUserValidation };
