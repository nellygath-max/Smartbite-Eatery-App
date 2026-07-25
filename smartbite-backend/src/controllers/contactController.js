const ContactMessage = require('../models/contactMessage');
const { createContactAdminNotification } = require('./adminNotificationController');
const { sendContactEmails } = require('../services/mailService');

exports.createContactMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    await createContactAdminNotification(contactMessage);

    const emailResults = await sendContactEmails(contactMessage);

    if (emailResults.adminEmail.status === 'rejected') {
      console.error('Admin contact email notification error:', emailResults.adminEmail.reason);
      return res.status(502).json({
        success: false,
        message: 'Your message was saved, but the admin email notification could not be sent. Please check the email server settings and try again.',
      });
    }

    if (emailResults.customerEmail.status === 'rejected') {
      console.error('Customer contact email confirmation error:', emailResults.customerEmail.reason);
    }

    return res.status(201).json({
      success: true,
      message: emailResults.customerEmail.status === 'fulfilled'
        ? 'Thanks for contacting SmartBite. We sent your message and confirmation email successfully.'
        : 'Thanks for contacting SmartBite. We sent your message to the admin, but the confirmation email could not be sent.',
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
