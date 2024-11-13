import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ redirectPath = '/signin', allowedRoles = [], children }) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const hasNotified = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log('Decoded Token:', decoded);
          if (decoded && decoded.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
            const userRole = decoded.userType || decoded.role;
            if (allowedRoles.includes(userRole)) {
              setIsAllowed(true);
            } else {
              setIsAllowed(false);
            }
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setIsAllowed(false);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsAllowed(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAllowed(false);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowResult(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    verifyToken();
  }, [allowedRoles]);

  useEffect(() => {
    if (!isLoading && !isAllowed && !hasNotified.current) {
      const message = isAuthenticated
        ? 'No tienes permiso para acceder a esta página.'
        : 'Debes iniciar sesión para acceder a esta página.';
      
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 0);
      
      hasNotified.current = true;
    }
  }, [isLoading, isAllowed, isAuthenticated]);

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'>
        <div className='relative w-32 h-32'>
          {!showResult ? (
            <motion.div
              className='w-full h-full border-4 border-white border-t-transparent rounded-full'
              variants={spinnerVariants}
              animate='animate'
            />
          ) : (
            <motion.div
              className='w-full h-full flex items-center justify-center'
              initial='hidden'
              animate='visible'
              variants={iconVariants}
            >
              {isAllowed ? (
                <motion.svg className='w-24 h-24' viewBox='0 0 24 24'>
                  <motion.path
                    fill='none'
                    stroke='white'
                    strokeWidth='2'
                    d='M3,12 L9,18 L21,6'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.svg>
              ) : (
                <motion.svg className='w-24 h-24' viewBox='0 0 24 24'>
                  <motion.path
                    fill='none'
                    stroke='white'
                    strokeWidth='2'
                    d='M18 6L6 18M6 6l12 12'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.svg>
              )}
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className='mt-8 text-3xl font-bold text-white'
        >
          {showResult
            ? isAllowed
              ? 'Acceso permitido'
              : 'Acceso denegado'
            : 'Verificando acceso'}
        </motion.div>
        <ToastContainer />
      </div>
    );
  }

  if (isAllowed) {
    return (
      <>
        {children ? children : <Outlet />}
        <ToastContainer />
      </>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <Navigate to='/reservations' replace />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Navigate to={redirectPath} replace />
      <ToastContainer />
    </>
  );
};

export default ProtectedRoute;