import api from './api';

export const createOrder = (order) => api.post('/orders', order);
export const getMyOrders = () => api.get('/orders/my-orders');
