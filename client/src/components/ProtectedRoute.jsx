import { Navigate, Outlet } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente FinalIcon: Animación de éxito/error
const FinalIcon = ({ success }) => (
  <motion.div
    className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className={`w-24 h-24 rounded-full flex items-center justify-center ${
        success ? 'bg-green-100' : 'bg-red-100'
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={success ? "rgb(22 163 74)" : "rgb(220 38 38)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {success ? (
          <motion.path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <motion.path d="M18 6L6 18" />
            <motion.path d="M6 6l12 12" />
          </>
        )}
      </motion.svg>
    </motion.div>
  </motion.div>
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

  // Componente Preloader: Barra de Progreso Animada
  // Componente Preloader: Animación mejorada
const ProgressBarLoader = () => (
  <motion.div
    className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative w-80 flex flex-col items-center">
      {/* Grupo de círculos pulsantes */}
      <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
        <motion.div
          className="absolute rounded-full bg-blue-600/20"
          initial={{ width: 80, height: 80 }}
          animate={{ 
            width: [80, 100, 80], 
            height: [80, 100, 80],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        <motion.div
          className="absolute rounded-full bg-blue-500/30"
          initial={{ width: 60, height: 60 }}
          animate={{ 
            width: [60, 75, 60], 
            height: [60, 75, 60],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.2
          }}
        />
        <motion.div
          className="absolute rounded-full bg-blue-400/40"
          initial={{ width: 40, height: 40 }}
          animate={{ 
            width: [40, 50, 40], 
            height: [40, 50, 40],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.4
          }}
        />
        
        {/* Ícono central giratorio */}
        <motion.div
          className="absolute z-10 text-blue-600 flex items-center justify-center bg-white rounded-full shadow-md"
          initial={{ width: 50, height: 50, rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
        </motion.div>
      </div>
      
      {/* Texto animado */}
      <motion.div 
        className="text-blue-600 font-medium mb-4 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        Cargando
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >...</motion.span>
      </motion.div>
      
      {/* Barra de progreso mejorada */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400"
          initial={{ x: '-100%' }}
          animate={{ 
            x: ['0%', '100%', '0%'],
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] 
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </div>
      
      {/* Pequeños círculos flotantes alrededor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/20"
            style={{
              width: Math.random() * 15 + 5,
              height: Math.random() * 15 + 5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [Math.random() * -30, Math.random() * 30, Math.random() * -30],
              x: [Math.random() * -30, Math.random() * 30, Math.random() * -30],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);
  // Lógica de renderizado
  if (isLoading) {
    return (
      <>
        <ProgressBarLoader />
        <ToastContainer />
      </>
    );
  }

  if (showFinalIcon) {
    return (
      <AnimatePresence>
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
