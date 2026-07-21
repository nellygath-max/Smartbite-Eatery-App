import axios from 'axios';
import { getRawValue, removeStoredValue } from '../utils/storage';

const resolveDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000/api';

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // When frontend is opened from another device on the same network,
  // call the backend on the same host with backend default port.
  return `http://${hostname}:3000/api`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || resolveDefaultApiBaseUrl(),
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
