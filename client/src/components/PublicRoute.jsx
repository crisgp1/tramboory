import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiCheck, FiLoader } from 'react-icons/fi';

const PublicRoute = ({ redirectPath = '/dashboard', children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
            setShowSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  if (isLoading || showSuccess) {
    return <LoadingAnimation showSuccess={showSuccess} />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

const LoadingAnimation = ({ showSuccess }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos - formas geométricas sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
      
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <SuccessAnimation />
        ) : (
          <LoadingStateAnimation />
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingStateAnimation = () => (
  <motion.div
    key="loading"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="relative mb-6">
      {/* Círculo pulsante exterior */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-indigo-100"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.5, 0.7] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Círculo con icono */}
      <div className="relative w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-indigo-500 opacity-50"
        >
          <FiLoader size={28} />
        </motion.div>
      </div>
    </div>
    
    <motion.h3
      className="text-xl font-semibold text-gray-800 mb-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      Verificando acceso
    </motion.h3>
    
    <motion.div 
      className="flex space-x-1 items-center text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <span>Un momento por favor</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          repeatType: "loop"
        }}
      >...</motion.span>
    </motion.div>
  </motion.div>
);

const SuccessAnimation = () => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="relative mb-6">
      {/* Círculo pulsante exterior */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-green-100"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.5, 0.7] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Círculo con icono */}
      <div className="relative w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="text-green-500"
        >
          <FiCheck size={32} />
        </motion.div>
      </div>
    </div>
    
    <motion.h3
      className="text-xl font-semibold text-gray-800 mb-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      ¡Sesión verificada!
    </motion.h3>
    
    <motion.div 
      className="flex space-x-1 items-center text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <span>Redirigiendo al dashboard</span>
      <motion.span
        animate={{ x: [0, 10] }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity,
          repeatType: "loop"
        }}
      >→</motion.span>
    </motion.div>
  </motion.div>
);

export default PublicRoute;