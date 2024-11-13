import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Ensure this matches your backend server
});

// Disable caching
axiosInstance.defaults.headers['Cache-Control'] = 'no-cache';
axiosInstance.defaults.headers['Pragma'] = 'no-cache';
axiosInstance.defaults.headers['Expires'] = '0';

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request Interceptor - Token:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Request Interceptor - Config:', config);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response Interceptor - Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Interceptor Error:', error);
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');

      if (token) {
        // Session may have expired
        localStorage.removeItem('token');
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '/signin';
      }
      // If no token exists, do not redirect
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
