const User = require('../models/user');

const presentUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

exports.getProfile = (req, res) => {
  return res.json({ success: true, user: presentUser(req.user) });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailOwner = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (emailOwner) {
      return res.status(409).json({ success: false, message: 'That email address is already in use.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || '',
      },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, user: presentUser(user) });
  } catch (error) {
    return next(error);
  }
};
