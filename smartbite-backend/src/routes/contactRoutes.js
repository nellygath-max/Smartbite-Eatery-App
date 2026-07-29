const express = require('express');
const {
  createContactMessage,
  deleteContactMessage,
  getContactMessage,
  getContactMessages,
  getMyContactMessages,
  replyToContactMessage,
  updateContactMessageStatus,
} = require('../controllers/contactController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const {
  contactMessageIdValidation,
  createContactMessageValidation,
  replyContactMessageValidation,
  updateContactStatusValidation,
} = require('../validators/contactValidator');

const router = express.Router();

router.post('/', optionalAuthenticate, createContactMessageValidation, createContactMessage);
router.get('/mine', authenticate, getMyContactMessages);
router.get('/', authenticate, authorize('admin'), getContactMessages);
router.get('/:id', authenticate, authorize('admin'), contactMessageIdValidation, getContactMessage);
router.patch('/:id/reply', authenticate, authorize('admin'), replyContactMessageValidation, replyToContactMessage);
router.patch('/:id/status', authenticate, authorize('admin'), updateContactStatusValidation, updateContactMessageStatus);
router.delete('/:id', authenticate, authorize('admin'), contactMessageIdValidation, deleteContactMessage);

module.exports = router;
