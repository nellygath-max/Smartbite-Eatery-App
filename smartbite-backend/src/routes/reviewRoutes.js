const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  getReviewsByMenuItem,
  getMyReviews,
  updateReview,
} = require('../controllers/reviewController');
const {
  createReviewValidation,
  updateReviewValidation,
  menuItemIdValidation,
} = require('../validators/reviewValidator');

const router = express.Router();

router.post('/', authenticate, createReviewValidation, createReview);
router.get('/', getReviews);
router.get('/menu/:menuItemId', menuItemIdValidation, getReviewsByMenuItem);
router.get('/my-reviews', authenticate, getMyReviews);
router.patch('/:id', authenticate, updateReviewValidation, updateReview);

module.exports = router;
