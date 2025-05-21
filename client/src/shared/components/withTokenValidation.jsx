// src/components/withTokenValidation.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const withTokenValidation = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      const validateToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (decoded.exp < Date.now() / 1000) {
              // Token expirado
              localStorage.removeItem('token');
              toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              navigate('/signin');
            }
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            localStorage.removeItem('token');
            toast.error('Error de autenticación. Por favor, inicia sesión nuevamente.');
            navigate('/signin');
          }
        }
      };

      validateToken();
      const intervalId = setInterval(validateToken, 60000); // Verifica cada minuto

      return () => clearInterval(intervalId);
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withTokenValidation;