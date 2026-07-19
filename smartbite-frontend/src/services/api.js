import axios from 'axios';
import { getRawValue, removeStoredValue } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = getRawValue('smartbite_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = (error?.response?.data?.message || '').toLowerCase();
    const isTokenError =
      status === 401
      && (message.includes('invalid authentication token')
        || message.includes('token has expired')
        || message.includes('token is no longer valid'));

    if (isTokenError) {
      removeStoredValue('smartbite_token');
      removeStoredValue('smartbite_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
