import axios, { AxiosError } from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';
export const SERVER_BASE_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auren_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth') {
        localStorage.removeItem('auren_token');
        localStorage.removeItem('auren_user');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Resolves a media URL:
 * - If path starts with /uploads, prepends http://localhost:5000
 * - If external URL (http/https/data/blob), returns as is
 */
export function getMediaUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  if (path.startsWith('/uploads')) {
    return `${SERVER_BASE_URL}${path}`;
  }
  return path;
}

