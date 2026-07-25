const express = require('express');
const {
  createContactMessage,
  deleteContactMessage,
  getContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  contactMessageIdValidation,
  createContactMessageValidation,
  updateContactStatusValidation,
} = require('../validators/contactValidator');

const router = express.Router();

router.post('/', createContactMessageValidation, createContactMessage);
router.get('/', authenticate, authorize('admin'), getContactMessages);
router.get('/:id', authenticate, authorize('admin'), contactMessageIdValidation, getContactMessage);
router.patch('/:id/status', authenticate, authorize('admin'), updateContactStatusValidation, updateContactMessageStatus);
router.delete('/:id', authenticate, authorize('admin'), contactMessageIdValidation, deleteContactMessage);

module.exports = router;
