import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          if (decoded && decoded.exp > Date.now() / 1000) {
            setIsAuthenticated(true);
            setIsAllowed(allowedRoles.includes(decoded.userType || decoded.role));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowResult(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsLoading(false);
    };
    verifyToken();
  }, [allowedRoles]);

  useEffect(() => {
    if (!isLoading && !isAllowed && !hasNotified.current) {
      const message = isAuthenticated
        ? 'No tienes permiso para acceder a esta página.'
        : 'Debes iniciar sesión para acceder a esta página.';
      
      setTimeout(() => {
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 0);
      
      hasNotified.current = true;
    }
  }, [isLoading, isAllowed, isAuthenticated]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 1.2, repeat: Infinity, ease: "linear" }
    }
  };

  const iconVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: "easeInOut" },
        opacity: { duration: 0.2 }
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"
      >
        <div className="relative w-32 h-32">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="spinner"
                variants={circleVariants}
                initial="initial"
                animate="animate"
                className="relative w-full h-full"
              >
                <motion.div
                  variants={spinnerVariants}
                  animate="animate"
                  className="absolute inset-0 border-4 border-white border-t-transparent rounded-full"
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-white opacity-20 rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                className="w-full h-full flex items-center justify-center"
                initial="hidden"
                animate="visible"
              >
                {isAllowed ? (
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-24 h-24 text-green-400"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                  >
                    <motion.path
                      d="M3,12 L9,18 L21,6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      variants={iconVariants}
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    viewBox="0 0 24 24"
                    className="w-24 h-24 text-red-400"
                    initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, ease: "backOut" }}
                  >
                    <motion.path
                      d="M18 6L6 18M6 6l12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      variants={iconVariants}
                    />
                  </motion.svg>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {showResult
              ? isAllowed
                ? 'Acceso Permitido'
                : 'Acceso Denegado'
              : 'Verificando Acceso'}
          </h2>
          <p className="text-white/80 text-lg">
            {showResult
              ? isAllowed
                ? 'Redirigiendo...'
                : 'Por favor, inicia sesión'
              : 'Comprobando credenciales...'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 left-0 right-0"
        >
          <ToastContainer 
            position="bottom-center"
            theme="dark"
            toastClassName="backdrop-blur-sm bg-white/10"
          />
        </motion.div>
      </motion.div>
    );
  }

  if (isAllowed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children ? children : <Outlet />}
        <ToastContainer />
      </motion.div>
    );
  }

  return isAuthenticated ? (
    <>
      <Navigate to='/reservations' replace />
      <ToastContainer />
    </>
  ) : (
    <>
      <Navigate to={redirectPath} replace />
      <ToastContainer />
    </>
  );
};

export default ProtectedRoute;