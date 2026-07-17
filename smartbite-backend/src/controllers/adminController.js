const Order = require('../models/order');
const Menu = require('../models/menu');
const User = require('../models/user');

exports.getDashboard = async (req, res) => {
  try {
    const [userCount, menuItemCount, availableMenuItemCount, orderCount, statusCounts, revenue] = await Promise.all([
      User.countDocuments(),
      Menu.countDocuments(),
      Menu.countDocuments({ stock: { $gt: 0 } }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const ordersByStatus = statusCounts.reduce((result, { _id, count }) => {
      result[_id] = count;
      return result;
    }, {});

    return res.status(200).json({
      success: true,
      dashboard: {
        users: userCount,
        menuItems: menuItemCount,
        availableMenuItems: availableMenuItemCount,
        orders: orderCount,
        ordersByStatus,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Get admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving dashboard data.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email phone role createdAt updatedAt')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('Get admin users error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving users.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id).select('+tokenVersion');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user._id.equals(req.user._id) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin role.',
      });
    }

    user.role = role;
    // Role changes must take effect even for clients holding an existing token.
    user.tokenVersion += 1;
    await user.save();

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }
    console.error('Update user role error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
};
