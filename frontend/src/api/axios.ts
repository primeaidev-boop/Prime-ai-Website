// Axios instance — cookies sent automatically via withCredentials; 401 redirects to login

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // sends httpOnly admin_token cookie on every request
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
