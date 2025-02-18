import { Navigate, Outlet } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const ProgressBarLoader = () => (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-80">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-md">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop'
            }}
          />
        </div>
      </div>
    </motion.div>
  );

  // Icono de éxito: Check animado
  const SuccessIcon = () => (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 24 24"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        fill="transparent"
        stroke="#4CAF50"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
      />
    </motion.svg>
  );

  // Icono de error: Cruz animada
  const ErrorIcon = () => (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 24 24"
      initial={{ scale: 0, opacity: 0, rotate: -45 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        stroke="#F44336"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.line
        x1="6"
        y1="18"
        x2="18"
        y2="6"
        stroke="#F44336"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
      />
    </motion.svg>
  );

  // Componente FinalIcon que decide qué icono mostrar
  const FinalIcon = ({ success }) => (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {success ? <SuccessIcon /> : <ErrorIcon />}
      </motion.div>
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
