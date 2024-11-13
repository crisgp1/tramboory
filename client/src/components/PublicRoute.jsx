import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';

const PublicRoute = ({ redirectPath = '/dashboard', children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    
    // Usamos un setTimeout para simular una carga mínima y evitar parpadeos
    setTimeout(checkAuth, 500);
  }, []);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-white rounded-full"
            animate={{
              y: ['0%', '-50%', '0%'],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-xl font-semibold text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Verificando acceso...
      </motion.p>
    </div>
  );
};

export default PublicRoute;