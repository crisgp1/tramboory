import Cookies from 'js-cookie';
import axios from 'axios';

// Función unificada para obtener el token de autenticación
// Primero intenta obtenerlo de localStorage (fuente principal)
// Si no está en localStorage, lo busca en cookies para mantener compatibilidad
export const getAuthToken = () => {
    const token = localStorage.getItem('token') || Cookies.get('token') || '';
    return token;
};

// Función que devuelve el encabezado de autenticación formateado
export const getAuthHeader = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Versión plural para mantener compatibilidad con inventoryService.js
export const getAuthHeaders = () => {
    return getAuthHeader();
};

// Verifica si el usuario está autenticado
export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token; // Retorna true si el token existe, false si no
};

// Función para cerrar sesión
export const logout = async () => {
    try {
        await axios.post('/api/auth/logout');
        // Eliminar el token de ambas ubicaciones para asegurar el cierre de sesión completo
        localStorage.removeItem('token');
        Cookies.remove('token');
    } catch (error) {
        console.error('Error durante el cierre de sesión:', error);
    }
}