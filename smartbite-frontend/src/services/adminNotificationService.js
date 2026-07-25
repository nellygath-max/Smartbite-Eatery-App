import api from './api';

export const getAdminNotifications = () => api.get('/admin/notifications');
export const markAdminNotificationRead = (id) =>
  api.patch(`/admin/notifications/${id}/read`);
