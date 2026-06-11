// Axios instance — adds auth header and handles 401 redirect

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('primai_admin_auth');
  if (raw) {
    try {
      const stored = JSON.parse(raw) as { state?: { token?: string } };
      const token = stored?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // corrupted storage — ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('primai_admin_auth');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

export default api;
