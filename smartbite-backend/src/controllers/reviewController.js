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

exports.createReview = async (req, res, next) => {
  try {
    const { menuItem, rating, review } = req.body;
    const menu = await Menu.findById(menuItem);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    // A review must come from a customer who received this specific meal.
    // The eligible order is found on the server so clients cannot submit an
    // arbitrary order id to bypass the rule.
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'items.menuItem': menuItem,
    }).sort({ createdAt: -1 });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: 'You can review this meal after an order containing it has been delivered.',
      });
    }

    const existingReview = await Review.findOne({ menuItem, user: req.user._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this menu item.',
      });
    }

    const createdReview = await Review.create({
      menuItem,
      user: req.user._id,
      rating,
      review: review.trim(),
      order: deliveredOrder._id,
    });

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
