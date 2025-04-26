import { Navigate, Outlet } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCheck, FiX, FiLoader, FiShield } from 'react-icons/fi';

// Componente FinalIcon: Animación de éxito/error con diseño minimalista
const FinalIcon = ({ success }) => (
  <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    {/* Elementos decorativos - formas geométricas sutiles */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
    <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
    <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
    
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative z-10"
    >
      <div className="relative mb-6">
        {/* Círculo pulsante exterior */}
        <motion.div 
          className={`absolute inset-0 rounded-full ${success ? 'bg-green-100' : 'bg-red-100'}`}
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
            className={success ? "text-green-500" : "text-red-500"}
          >
            {success ? <FiCheck size={32} /> : <FiX size={32} />}
          </motion.div>
        </div>
      </div>
      
      <motion.h3
        className="text-xl font-semibold text-gray-800 mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {success ? "¡Acceso verificado!" : "Acceso denegado"}
      </motion.h3>
      
      <motion.div 
        className="flex space-x-1 items-center justify-center text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span>{success ? "Redirigiendo" : "Redirigiendo a inicio de sesión"}</span>
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
  </div>
);

const ProtectedRoute = ({ redirectPath = '/signin', allowedRoles = [], children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [showFinalIcon, setShowFinalIcon] = useState(false);
  const hasNotified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const hasValidated = sessionStorage.getItem('hasValidated');

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setIsAuthenticated(false);
          setIsAllowed(false);
          throw new Error('No token found');
        }

        const decoded = jwtDecode(token);
        if (!decoded || decoded.exp <= Date.now() / 1000) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Invalid or expired token');
        }

        setIsAuthenticated(true);
        const hasPermission = allowedRoles.includes(decoded.userType || decoded.role);
        setIsAllowed(hasPermission);

        setShowFinalIcon(!hasValidated);

      } catch (error) {
        console.error('Authentication error:', error);
        setShowFinalIcon(true);
      } finally {
        // Simulamos un pequeño retardo para que se aprecie la animación
        await new Promise((r) => setTimeout(r, 400));
        setIsLoading(false);

        if (isAllowed) {
          sessionStorage.setItem('hasValidated', 'true');
        }
      }
    };

    verifyToken();
  }, [allowedRoles]);

  useEffect(() => {
    if (!isLoading && !isAllowed && !hasNotified.current) {
      const message = isAuthenticated
        ? 'No tienes permisos suficientes'
        : 'Por favor inicia sesión';

      toast.error(message, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: '!bg-white/10 backdrop-blur-lg border border-white/20',
      });

      hasNotified.current = true;
    }
  }, [isLoading, isAllowed, isAuthenticated]);

  // Componente LoadingAnimation: Preloader minimalista y moderno
  const LoadingAnimation = () => (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos - formas geométricas sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center text-center"
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
          
          {/* Anillo giratorio */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-indigo-300 border-t-indigo-500"
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Círculo con icono */}
          <div className="relative w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center z-10">
            <FiShield className="text-indigo-500" size={24} />
          </div>
        </div>
        
        <motion.h3
          className="text-xl font-semibold text-gray-800 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Verificando permisos
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
        
        {/* Barra de progreso */}
        <motion.div
          className="w-60 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-indigo-500"
            animate={{ 
              width: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );

  // Lógica de renderizado
  if (isLoading) {
    return (
      <>
        <LoadingAnimation />
        <ToastContainer />
      </>
    );
  }

  if (showFinalIcon) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="final-icon">
          <FinalIcon success={isAllowed} />
          {setTimeout(() => {
            setShowFinalIcon(false);
            if (isAllowed) {
              return;
            } else {
              if (isAuthenticated) {
                window.location.replace('/reservations');
              } else {
                window.location.replace(redirectPath);
              }
            }
          }, 800)}
          <ToastContainer />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isAllowed) {
    return (
      <motion.div
        key="protected-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children ? children : <Outlet />}
        <ToastContainer />
      </motion.div>
    );
  }

  return null;
};

export default ProtectedRoute;