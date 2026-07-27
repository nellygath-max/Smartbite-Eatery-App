const AdminNotification = require('../models/adminNotification');
const ContactMessage = require('../models/contactMessage');

const removeOrphanedContactNotifications = async () => {
  const contactNotifications = await AdminNotification.find({ type: 'contact_message' }).select('resourceId');
  const contactMessageIds = contactNotifications.map((notification) => notification.resourceId);
  const existingContactMessageIds = await ContactMessage.find({ _id: { $in: contactMessageIds } }).distinct('_id');
  const existingContactMessageIdSet = new Set(existingContactMessageIds.map((id) => id.toString()));
  const orphanedContactNotificationIds = contactNotifications
    .filter((notification) => !existingContactMessageIdSet.has(notification.resourceId.toString()))
    .map((notification) => notification._id);

  if (orphanedContactNotificationIds.length > 0) {
    await AdminNotification.deleteMany({ _id: { $in: orphanedContactNotificationIds } });
  }
};

exports.createContactAdminNotification = (contactMessage) => (
  AdminNotification.create({
    title: 'New Contact Message',
    message: `${contactMessage.name} sent a new contact message.`,
    type: 'contact_message',
    resourceId: contactMessage._id,
    link: `/admin/contact/${contactMessage._id}`,
  })
);

exports.deleteContactAdminNotifications = (contactMessageId) => (
  AdminNotification.deleteMany({
    type: 'contact_message',
    resourceId: contactMessageId,
  })
);

exports.markContactAdminNotificationRead = (contactMessageId, read = true) => (
  AdminNotification.updateMany(
    {
      type: 'contact_message',
      resourceId: contactMessageId,
    },
    {
      read,
      readAt: read ? new Date() : null,
    },
    { runValidators: true }
  )
);

exports.getAdminNotifications = async (req, res) => {
  try {
    await removeOrphanedContactNotifications();

    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(50);
    const unreadCount = await AdminNotification.countDocuments({ read: false });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
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
