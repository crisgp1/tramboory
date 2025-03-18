import Cookies from 'js-cookie';
import axios from 'axios';

export const getAuthHeader = () => {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Versión plural para mantener compatibilidad con inventoryService.js
export const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
    const token = Cookies.get('token');
    return !!token; // Retorna true si el token existe, false si no
};

export const logout = async () => {
    try {
        await axios.post('/api/auth/logout');
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Error durante el cierre de sesión:', error);
    }
}