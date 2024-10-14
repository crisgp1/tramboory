import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create();

// Interceptor de solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar el token
      localStorage.removeItem('token');
      
      // Mostrar mensaje de sesión expirada
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      
      // Redirigir al login
      // Nota: Asegúrate de que esta redirección funcione correctamente en tu configuración de enrutamiento
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;