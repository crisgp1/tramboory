import axios from 'axios';
import { toast } from 'react-toastify';

// Determinar la URL base correcta para evitar duplicar /api
const determineBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Si tenemos una URL de API configurada, usarla directamente
  if (apiUrl) {
    return apiUrl;
  }
  // Si estamos en desarrollo, asegurarnos de que la ruta base no duplique /api
  if (import.meta.env.MODE === 'development') {
    // Verificar si la URL de la API ya termina en /api
    const baseUrl = window.location.origin;
    return baseUrl + '/api';
  }
  // Valor por defecto
  return '/api';
};

// Exportar como exportación con nombre para ser importado con { axiosInstance }
export const axiosInstance = axios.create({
  baseURL: determineBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log request details in development
    if (import.meta.env.MODE === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      });
    }

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
    // Log response in development
    if (import.meta.env.MODE === 'development') {
      console.log('Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    console.error('Response Error:', error);

    // Handle network errors
    if (!error.response) {
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      return Promise.reject(error);
    }

    // Handle different error status codes
    switch (error.response.status) {
      case 400:
        toast.error(error.response.data.message || 'Solicitud inválida');
        break;
      case 401:
        const token = localStorage.getItem('token');
        // Evitar redirección si estamos en la página de login
        const isLoginPage = window.location.pathname === '/signin';
        if (token && !isLoginPage) {
          localStorage.removeItem('token');
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          window.location.href = '/signin';
        }
        break;
      case 403:
        toast.error('No tienes permiso para realizar esta acción');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 409:
        toast.error('El horario seleccionado ya no está disponible');
        break;
      case 422:
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach(error => {
            toast.error(error);
          });
        } else {
          toast.error('Error de validación en los datos');
        }
        break;
      case 500:
        toast.error('Error del servidor. Por favor, intenta más tarde');
        break;
      default:
        toast.error('Ocurrió un error inesperado');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;