import api from './api';

export const sendContactMessage = (message) => api.post('/contact', message);
export const getMyContactMessages = () => api.get('/contact/mine');
export const getContactMessages = () => api.get('/contact');
export const getContactMessage = (id) => api.get(`/contact/${id}`);
export const replyToContactMessage = (id, reply) =>
  api.patch(`/contact/${id}/reply`, { reply });
export const updateContactMessageStatus = (id, status) =>
  api.patch(`/contact/${id}/status`, { status });
export const deleteContactMessage = (id) => api.delete(`/contact/${id}`);
