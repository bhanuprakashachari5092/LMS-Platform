import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach Firebase ID Bearer token and developer session token
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('firebase_token') ||
      localStorage.getItem('shaivika_auth_token');
      
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const devToken =
      sessionStorage.getItem('kz_dev_token') ||
      localStorage.getItem('kz_dev_token');
    if (devToken && config.headers) {
      config.headers['x-developer-token'] = devToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network Error: Unable to reach backend server';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
