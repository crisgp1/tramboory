import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../components/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/usuarios/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          setIsAuthenticated(true);
          setUserType(decoded.userType);
          
          // Establecer la información básica del usuario desde el token
          setUser({
            id: decoded.id,
            nombre: decoded.nombre,
            email: decoded.email,
            tipo_usuario: decoded.userType
          });

          // Obtener información completa del usuario
          await fetchUserData(decoded.id);
          return true;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    return false;
  }, [fetchUserData]);

  useEffect(() => {
    checkAuth();
    setLoading(false);
  }, [checkAuth]);

  const login = useCallback(async (token, userData) => {
    try {
      localStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const decoded = jwtDecode(token);
      setIsAuthenticated(true);
      setUserType(decoded.userType);
      
      // Establecer datos del usuario desde la respuesta del login
      if (userData) {
        setUser(userData);
      } else {
        // Si no hay datos del usuario en la respuesta, obtenerlos del token
        setUser({
          id: decoded.id,
          nombre: decoded.nombre,
          email: decoded.email,
          tipo_usuario: decoded.userType
        });
        // Y luego obtener la información completa
        await fetchUserData(decoded.id);
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUserType(null);
      setUser(null);
    }
  }, []);

  const value = {
    isAuthenticated,
    userType,
    user,
    login,
    logout,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};