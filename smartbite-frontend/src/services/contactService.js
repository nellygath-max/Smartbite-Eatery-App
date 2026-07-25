import api from './api';

export const sendContactMessage = (message) => api.post('/contact', message);
export const getContactMessages = () => api.get('/contact');
export const getContactMessage = (id) => api.get(`/contact/${id}`);
export const updateContactMessageStatus = (id, status) =>
  api.patch(`/contact/${id}/status`, { status });
export const deleteContactMessage = (id) => api.delete(`/contact/${id}`);
