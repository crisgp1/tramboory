// PublicRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importación correcta
import { motion } from 'framer-motion';

const PublicRoute = ({ redirectPath = '/dashboard', children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const containerVariants = {
    start: { opacity: 1 },
    end: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const blockVariants = {
    start: { y: '100%', opacity: 0, rotate: 0 },
    end: {
      y: 0,
      opacity: 1,
      rotate: 360,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 10,
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600'>
        <motion.div
          className='grid grid-cols-3 gap-2'
          variants={containerVariants}
          initial='start'
          animate='end'
        >
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className='w-8 h-8 bg-white rounded-sm'
              variants={blockVariants}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-8 text-2xl font-bold text-white'
        >
          Verificando acceso...
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
