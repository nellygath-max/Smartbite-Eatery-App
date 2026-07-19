import api from './api';

export const signUp = (details) => api.post('/auth/signup', details);
export const signIn = (credentials) => api.post('/auth/login', credentials);
export const signOut = () => api.post('/auth/logout');
