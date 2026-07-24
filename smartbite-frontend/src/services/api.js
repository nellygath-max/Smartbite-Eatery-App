import axios from 'axios';
import { getRawValue, removeStoredValue } from '../utils/storage';

const productionApiBaseUrl = 'https://smartbite-backend-lgje.onrender.com/api';

const resolveDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000/api';

  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  return productionApiBaseUrl;
};

const withApiPath = (apiUrl) => {
  if (!apiUrl) return apiUrl;
  if (apiUrl.startsWith('/')) return apiUrl;

  try {
    const url = new URL(apiUrl);
    const pathname = url.pathname.replace(/\/+$/, '');
    url.pathname = pathname.endsWith('/api') ? pathname : `${pathname}/api`;
    return url.toString().replace(/\/$/, '');
  } catch {
    return apiUrl;
  }
};

const resolveApiBaseUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  if (!configuredApiUrl || typeof window === 'undefined') {
    return withApiPath(configuredApiUrl) || resolveDefaultApiBaseUrl();
  }

  const isRemoteDevice = !['localhost', '127.0.0.1'].includes(window.location.hostname);
  try {
    const configuredHost = new URL(configuredApiUrl).hostname;
    if (isRemoteDevice && ['localhost', '127.0.0.1'].includes(configuredHost)) {
      return resolveDefaultApiBaseUrl();
    }
  } catch {
    // Keep a valid custom relative URL unchanged.
  }

  return withApiPath(configuredApiUrl);
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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
