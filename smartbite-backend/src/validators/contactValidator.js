const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

const createContactMessageValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 120 })
    .withMessage('Name cannot exceed 120 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Provide a valid email address.')
    .normalizeEmail(),
  body('subject')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Subject cannot exceed 160 characters.'),
  body('message')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters.'),
  handleValidationErrors,
];

const contactMessageIdValidation = [
  param('id').isMongoId().withMessage('Provide a valid contact message id.'),
  handleValidationErrors,
];

const updateContactStatusValidation = [
  param('id').isMongoId().withMessage('Provide a valid contact message id.'),
  body('status')
    .isIn(['Unread', 'Read', 'Resolved'])
    .withMessage('Status must be Unread, Read, or Resolved.'),
  handleValidationErrors,
];

module.exports = {
  createContactMessageValidation,
  contactMessageIdValidation,
  updateContactStatusValidation,
};
