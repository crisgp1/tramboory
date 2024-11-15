import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

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
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            scale: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: Math.random() * window.innerWidth,
            top: Math.random() * window.innerHeight,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <FloatingParticles />
        
        {/* Animated gradient circles */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative flex items-center justify-center w-24 h-24">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              className="relative flex items-center justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Outer rotating ring */}
              <motion.div
                className="absolute w-24 h-24 rounded-full border-4 border-indigo-500/20"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Inner rotating ring */}
              <motion.div
                className="absolute w-20 h-20 rounded-full border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Center icon */}
              <Shield className="w-10 h-10 text-white/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text content */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {showSuccess ? "¡Sesión Verificada!" : "Verificando Acceso"}
          </motion.h2>
          
          <motion.div
            className="flex items-center justify-center gap-2 text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {!showSuccess && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <p className="text-sm">
              {showSuccess ? (
                <span className="flex items-center gap-2">
                  Redirigiendo al dashboard
                  <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                "Comprobando credenciales..."
              )}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PublicRoute;