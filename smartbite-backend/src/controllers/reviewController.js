const Review = require('../models/Review');
const Menu = require('../models/menu');
const Order = require('../models/order');

const presentReview = (review) => ({
  id: review._id,
  menuItem: review.menuItem,
  user: review.user,
  rating: review.rating,
  review: review.review,
  order: review.order,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const recalculateMenuRating = async (menuItem) => {
  const [summary] = await Review.aggregate([
    { $match: { menuItem } },
    {
      $group: {
        _id: '$menuItem',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Menu.findByIdAndUpdate(menuItem, {
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    reviewCount: summary?.reviewCount || 0,
  });
};

const pendingReviewItemsForUser = async (userId) => {
  const deliveredOrders = await Order.find({
    user: userId,
    $or: [{ status: 'delivered' }, { orderStatus: 'delivered' }],
  })
    .populate({ path: 'items.menuItem', select: 'name imageUrl averageRating reviewCount' })
    .sort({ createdAt: -1, _id: -1 });

  const reviews = await Review.find({
    user: userId,
    order: { $in: deliveredOrders.map((order) => order._id) },
  }).select('order menuItem');
  const reviewed = new Set(
    reviews.map((review) => `${review.order.toString()}:${review.menuItem.toString()}`)
  );

  return deliveredOrders.flatMap((order) => order.items
    .filter((item) => item.menuItem && !reviewed.has(`${order._id}:${item.menuItem._id || item.menuItem}`))
    .map((item) => ({
      id: `${order._id}-${item.menuItem._id || item.menuItem}`,
      orderId: order._id,
      orderNumber: order._id.toString().slice(-6),
      menuItem: item.menuItem,
      menuItemId: item.menuItem._id || item.menuItem,
      foodName: item.name,
      deliveredAt: order.updatedAt,
      message: `Please review your ${item.name} order.`,
    })));
};

exports.createReview = async (req, res, next) => {
  try {
    const { menuItem, orderId, rating, review } = req.body;
    const menu = await Menu.findById(menuItem);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const deliveredOrder = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      $or: [{ status: 'delivered' }, { orderStatus: 'delivered' }],
      'items.menuItem': menuItem,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: 'You can review this meal only after your delivered order containing it.',
      });
    }

    const existingReview = await Review.findOne({
      order: deliveredOrder._id,
      menuItem,
      user: req.user._id,
    });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this item from this order.',
      });
    }

    const createdReview = await Review.create({
      menuItem,
      user: req.user._id,
      rating,
      review: review.trim(),
      order: deliveredOrder._id,
    });
    await recalculateMenuRating(menu._id);

    await createdReview.populate({ path: 'menuItem', select: 'name category imageUrl price' });
    await createdReview.populate({ path: 'user', select: 'name email' });

    return res.status(201).json({ success: true, review: presentReview(createdReview) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid id provided.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Create review error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating review.' });
  }
};

exports.getPendingReviewNotifications = async (req, res) => {
  try {
    const notifications = await pendingReviewItemsForUser(req.user._id);
    return res.status(200).json({ success: true, notifications, count: notifications.length });
  } catch (err) {
    console.error('Get pending reviews error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving review notifications.' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({ path: 'menuItem', select: 'name category imageUrl price' })
      .populate({ path: 'user', select: 'name email' })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews: reviews.map(presentReview) });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving reviews.' });
  }
};

exports.getReviewsByMenuItem = async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId })
      .populate({ path: 'menuItem', select: 'name category imageUrl price' })
      .populate({ path: 'user', select: 'name email' })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews: reviews.map(presentReview) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item id.' });
    }
    console.error('Get menu reviews error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving reviews.' });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate({ path: 'menuItem', select: 'name category imageUrl price' })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews: reviews.map(presentReview) });
  } catch (err) {
    console.error('Get user reviews error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving your reviews.' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const { rating, review: reviewText } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.review = reviewText.trim();

    await review.save();
    await recalculateMenuRating(review.menuItem);
    await review.populate({ path: 'menuItem', select: 'name category imageUrl price' });

    return res.status(200).json({ success: true, review: presentReview(review) });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid review id.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Update review error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating review.' });
  }
};
