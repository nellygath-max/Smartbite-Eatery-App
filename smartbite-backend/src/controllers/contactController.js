const ContactMessage = require('../models/contactMessage');
const {
  createContactAdminNotification,
  deleteContactAdminNotifications,
  markContactAdminNotificationRead,
} = require('./adminNotificationController');
const { sendAdminContactEmail } = require('../services/mailService');

const sendContactEmailsInBackground = async (contactMessage) => {
  try {
    const adminEmail = await sendAdminContactEmail(contactMessage);
    console.log('Admin contact email notification sent:', {
      messageId: adminEmail.messageId,
      accepted: adminEmail.accepted,
      rejected: adminEmail.rejected,
    });
  } catch (mailErr) {
    console.error('Admin contact email notification error:', mailErr);
  }

};

const normalizeContactStatus = (message) => {
  if (!message) return message;
  if (message.reply || message.repliedAt || message.status === 'Resolved') {
    message.status = 'Replied';
    return message;
  }
  if (message.status === 'Unread' || message.status === 'Read') {
    message.status = 'Pending';
  }
  return message;
};

exports.createContactMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      user: req.user?._id,
    });

    await createContactAdminNotification(contactMessage);

    sendContactEmailsInBackground(contactMessage);

    return res.status(201).json({
      success: true,
      message: 'Thanks for contacting SmartBite. Your message was received.',
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
    messages.forEach(normalizeContactStatus);
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

    normalizeContactStatus(message);
    await markContactAdminNotificationRead(message._id);

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

exports.replyToContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        reply: req.body.reply,
        repliedAt: new Date(),
        repliedBy: req.user._id,
        status: 'Replied',
      },
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
    console.error('Reply to contact message error:', err);
    return res.status(500).json({ success: false, message: 'Server error sending contact reply.' });
  }
};

exports.getMyContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email },
      ],
    }).sort({ createdAt: -1, _id: -1 });

    messages.forEach(normalizeContactStatus);

    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error('Get customer contact messages error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving your support messages.' });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    await deleteContactAdminNotifications(message._id);

    return res.status(200).json({ success: true, message: 'Contact message deleted.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid contact message id.' });
    }
    console.error('Delete contact message error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting contact message.' });
  }
};
