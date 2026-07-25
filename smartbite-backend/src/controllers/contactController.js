const ContactMessage = require('../models/contactMessage');
const { createContactAdminNotification } = require('./adminNotificationController');
const {
  sendAdminContactEmail,
  sendCustomerContactConfirmation,
} = require('../services/mailService');

const sendCustomerContactConfirmationInBackground = async (contactMessage) => {
  try {
    const customerEmail = await sendCustomerContactConfirmation(contactMessage);
    console.log('Customer contact email confirmation sent:', {
      messageId: customerEmail.messageId,
      accepted: customerEmail.accepted,
      rejected: customerEmail.rejected,
    });
  } catch (mailErr) {
    console.error('Customer contact email confirmation error:', mailErr);
  }
};

exports.createContactMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    await createContactAdminNotification(contactMessage);

    try {
      const adminEmail = await sendAdminContactEmail(contactMessage);
      console.log('Admin contact email notification sent:', {
        messageId: adminEmail.messageId,
        accepted: adminEmail.accepted,
        rejected: adminEmail.rejected,
      });
    } catch (mailErr) {
      console.error('Admin contact email notification error:', mailErr);
      return res.status(502).json({
        success: false,
        message: 'Your message was saved, but the admin email notification could not be sent. Please check the email server settings and try again.',
      });
    }

    sendCustomerContactConfirmationInBackground(contactMessage);

    return res.status(201).json({
      success: true,
      message: 'Thanks for contacting SmartBite. Your message was sent to the admin.',
      contactMessage,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Create contact message error:', err);
    return res.status(500).json({ success: false, message: 'Server error sending contact message.' });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1, _id: -1 });
    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error('Get contact messages error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving contact messages.' });
  }
};

exports.getContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    return res.status(200).json({ success: true, message });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid contact message id.' });
    }
    console.error('Get contact message error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving contact message.' });
  }
};

exports.updateContactMessageStatus = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    return res.status(200).json({ success: true, message });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid contact message id.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Update contact message status error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating contact message.' });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    return res.status(200).json({ success: true, message: 'Contact message deleted.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid contact message id.' });
    }
    console.error('Delete contact message error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting contact message.' });
  }
};
