import api from './api';

export const getReviews = () => api.get('/reviews');

export const getReviewsByMenuItem = (menuItemId) =>
  api.get(`/reviews/menu/${menuItemId}`);

export const getMyReviews = () => api.get('/reviews/my-reviews');

export const createReview = (payload) => api.post('/reviews', payload);

export const updateReview = (id, payload) => api.patch(`/reviews/${id}`, payload);
