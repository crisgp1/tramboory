import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldCheck, Shield, Check, X, ArrowRight, Lock } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ redirectPath = '/signin', allowedRoles = [], children }) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalAnimation, setShowFinalAnimation] = useState(false);
  const hasNotified = useRef(false);

  const verificationSteps = [
    { id: 0, text: "Verificando acceso", status: "pending" },
    { id: 1, text: "Validando permisos", status: "pending" },
    { id: 2, text: "Comprobando roles", status: "pending" }
  ];

  const [steps, setSteps] = useState(verificationSteps);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Paso 1: Verificar acceso
        setCurrentStep(0);
        const token = localStorage.getItem('token');
        await new Promise(resolve => setTimeout(resolve, 400));
        setSteps(prev => prev.map(step => 
          step.id === 0 ? { ...step, status: token ? "success" : "error" } : step
        ));

        if (!token) {
          setIsAuthenticated(false);
          setIsAllowed(false);
          throw new Error('No token found');
        }

        // Paso 2: Validar token
        setCurrentStep(1);
        const decoded = jwtDecode(token);
        await new Promise(resolve => setTimeout(resolve, 400));

        if (decoded && decoded.exp > Date.now() / 1000) {
          setIsAuthenticated(true);
          setSteps(prev => prev.map(step => 
            step.id === 1 ? { ...step, status: "success" } : step
          ));
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setSteps(prev => prev.map(step => 
            step.id === 1 ? { ...step, status: "error" } : step
          ));
          throw new Error('Invalid token');
        }

        // Paso 3: Verificar permisos
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const hasPermission = allowedRoles.includes(decoded.userType || decoded.role);
        setIsAllowed(hasPermission);
        setSteps(prev => prev.map(step => 
          step.id === 2 ? { ...step, status: hasPermission ? "success" : "error" } : step
        ));

        await new Promise(resolve => setTimeout(resolve, 400));
        setShowFinalAnimation(true);
        
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
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
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "!bg-white/10 backdrop-blur-lg border border-white/20"
      });
      
      hasNotified.current = true;
    }
  }, [isLoading, isAllowed, isAuthenticated]);

  const StepIndicator = ({ step, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="relative flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
              ${currentStep === index ? 'bg-blue-500/20' : 
                step.status === "success" ? 'bg-green-500/20' : 
                step.status === "error" ? 'bg-red-500/20' : 
                'bg-white/10'}`}
          >
            <AnimatePresence mode="wait">
              {step.status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : step.status === "error" ? (
                <motion.div
                  key="error"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <X className="w-4 h-4 text-red-500" />
                </motion.div>
              ) : currentStep === index ? (
                <motion.div
                  key="loading"
                  className="w-4 h-4 border-2 border-blue-500 rounded-full border-r-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <motion.div
                  key="waiting"
                  className="w-2 h-2 bg-white/30 rounded-full"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <span className={`text-sm transition-colors duration-300
          ${currentStep === index ? 'text-white' : 
            step.status === "success" ? 'text-green-500' : 
            step.status === "error" ? 'text-red-500' : 
            'text-white/50'}`}>
          {step.text}
        </span>
      </motion.div>
    );
  };

  const FinalAnimation = () => (
    <motion.div 
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <motion.div
        className={`absolute inset-0 rounded-full ${
          isAllowed ? 'bg-green-500/20' : 'bg-red-500/20'
        } blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="relative w-24 h-24 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
      >
        {isAllowed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.2
            }}
          >
            <ShieldCheck className="w-16 h-16 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.2
            }}
          >
            <Lock className="w-16 h-16 text-red-500" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="relative z-10 flex flex-col items-center gap-12 max-w-md mx-auto p-8">
          {/* Estado de verificación */}
          {!showFinalAnimation ? (
            <>
              <div className="space-y-4 w-full">
                {steps.map((step, index) => (
                  <StepIndicator key={step.id} step={step} index={index} />
                ))}
              </div>

              <motion.div
                className="w-full h-1 bg-white/5 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </>
          ) : (
            <FinalAnimation />
          )}
        </div>
        <ToastContainer />
      </div>
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
      <Navigate to="/reservations" replace />
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