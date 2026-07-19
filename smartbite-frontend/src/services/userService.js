import api from './api';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (details) => api.put('/users/profile', details);
