import api from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getAllOrders = () => api.get('/admin/orders');
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });
