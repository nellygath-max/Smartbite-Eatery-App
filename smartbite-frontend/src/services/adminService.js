import api from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getUsers = () => api.get('/admin/users');
export const createAdminUser = (user) => api.post('/admin/users', user);
export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });
export const getAllOrders = () => api.get('/admin/orders');
export const updateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status });
export const updatePaymentStatus = (id, paymentStatus) =>
  api.patch(`/admin/orders/${id}/payment-status`, { paymentStatus });
