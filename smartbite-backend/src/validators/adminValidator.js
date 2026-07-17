const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('Provide a valid user id.'),
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin.'),
  handleValidationErrors,
];

module.exports = { updateUserRoleValidation };
