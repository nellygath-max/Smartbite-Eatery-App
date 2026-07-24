import api from './api';

export const createOrder = (order) => api.post('/orders', order);
export const getMyOrders = () => api.get('/orders/my-orders');
export const verifyPaystackPayment = (id, reference) =>
  api.post(`/orders/${id}/paystack/verify`, { reference });
export const cancelPaystackPayment = (id) =>
  api.delete(`/orders/${id}/paystack`);
