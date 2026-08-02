import api from './api';

export const signUp = (details) => api.post('/auth/signup', details);
export const signIn = (credentials) => api.post('/auth/login', credentials);
export const requestPasswordResetOtp = (payload) => api.post('/auth/forgot-password', payload);
export const resetPasswordWithOtp = (payload) => api.post('/auth/reset-password', payload);
export const signOut = () => api.post('/auth/logout');
