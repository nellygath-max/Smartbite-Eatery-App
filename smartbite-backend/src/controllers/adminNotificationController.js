const AdminNotification = require('../models/adminNotification');

exports.createContactAdminNotification = (contactMessage) => (
  AdminNotification.create({
    title: 'New Contact Message',
    message: `${contactMessage.name} sent a new contact message.`,
    type: 'contact_message',
    resourceId: contactMessage._id,
    link: `/admin/contact/${contactMessage._id}`,
  })
);

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(50);
    return res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
    });
  } catch (err) {
    console.error('Get admin notifications error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications.' });
  }
};

exports.markAdminNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, notification });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid notification id.' });
    }
    console.error('Mark admin notification read error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
};
