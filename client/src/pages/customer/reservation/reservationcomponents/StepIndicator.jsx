import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const StepIndicator = ({ steps, currentStep, goToStep }) => {
  // Determinar si un paso está completado, activo o pendiente
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  // Obtener la clase CSS adecuada según el estado del paso
  const getStepNumberClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md';
      case 'active':
        return 'bg-white text-indigo-600 border-2 border-indigo-600 shadow-md';
      default:
        return 'bg-white text-gray-400 border border-gray-300';
    }
  };

  // Obtener la clase CSS para el conector entre pasos
  const getConnectorClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-indigo-400 to-indigo-600';
      case 'active':
        return 'bg-gray-200';
      default:
        return 'bg-gray-200';
    }
  };

  // Obtener la clase CSS para el texto del paso
  const getTextClass = (status) => {
    switch (status) {
      case 'completed':
        return 'text-indigo-600 font-medium';
      case 'active':
        return 'text-gray-900 font-medium';
      default:
        return 'text-gray-400';
    }
  };

  // Animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-center"
    >
      <div className="w-full max-w-4xl px-4">
        <div className="relative">
          {/* Barra de progreso */}
          <div className="absolute top-5 left-0 right-0 flex">
            {steps.map((_, index) => {
              if (index === steps.length - 1) return null;
              
              const status = getStepStatus(index);
              return (
                <div
                  key={`connector-${index}`}
                  className={`h-1 flex-1 ${getConnectorClass(status)} rounded-full transition-colors duration-300`}
                ></div>
              );
            })}
          </div>

          {/* Pasos */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = index < currentStep; // Sólo permitir volver a pasos completados
              
              return (
                <motion.div
                  key={`step-${index}`}
                  variants={itemVariants}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <motion.button
                    type="button"
                    onClick={() => isClickable && goToStep(index)}
                    disabled={!isClickable}
                    whileHover={isClickable ? { scale: 1.1 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300
                      ${getStepNumberClass(status)}
                      ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
                    `}
                    aria-label={`Ir al paso: ${step}`}
                  >
                    {status === 'completed' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <FiCheck className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {index + 1}
                      </motion.span>
                    )}
                  </motion.button>
                  
                  <div className="mt-2 text-center">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`text-xs sm:text-sm ${getTextClass(status)} transition-colors duration-300 whitespace-nowrap`}
                    >
                      {step}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepIndicator;