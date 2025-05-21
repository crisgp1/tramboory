import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../components/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUserType(null);
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUserType(decoded.userType);
        setUser({
          id: decoded.id,
          nombre: decoded.nombre,
          email: decoded.email,
          tipo_usuario: decoded.userType
        });

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await axiosInstance.get('/usuarios/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }

        setLoading(false);
        return true;
      } else {
        throw new Error('Token expirado');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUserType(null);
      setUser(null);
      setLoading(false);
      return false;
    }
  }, []);

  const login = useCallback(async (emailOrToken, passwordOrUserData) => {
    let token, userData;

    // Caso 1: Login con email/password
    if (typeof passwordOrUserData === 'string' || passwordOrUserData === undefined) {
      try {
        const response = await axiosInstance.post('/auth/login', {
          email: emailOrToken,
          password: passwordOrUserData
        });
        token = response.data.token;
        userData = null; // Se obtendrá del token o del endpoint /me
      } catch (error) {
        console.error('Error en inicio de sesión:', error);
        throw error; // Propagar el error para que InventoryLoginModal pueda manejarlo
      }
    } 
    // Caso 2: Login directo con token
    else {
      token = emailOrToken;
      userData = passwordOrUserData;
    }

    // Guardar token en localStorage (fuente principal) y también en cookies para compatibilidad
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const decoded = jwtDecode(token);
    setIsAuthenticated(true);
    setUserType(decoded.userType);
    
    if (userData) {
      setUser(userData);
    } else {
      setUser({
        id: decoded.id,
        nombre: decoded.nombre || decoded.name,
        email: decoded.email,
        tipo_usuario: decoded.userType
      });
      
      // Obtener datos de usuario completos
      try {
        const response = await axiosInstance.get('/usuarios/me');
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    }

    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUserType(null);
      setUser(null);
      window.dispatchEvent(new Event('auth-change'));
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

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
      {children}
    </AuthContext.Provider>
  );
};