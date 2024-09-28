import Cookies from 'js-cookie';

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