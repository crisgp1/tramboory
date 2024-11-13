import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiX, 
  FiArrowRight, 
  FiAlertTriangle, 
  FiLock,
  FiThumbsUp,
  FiThumbsDown,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 25
};

const ContractModal = ({ isOpen, onClose, onAccept }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showAcceptButtons, setShowAcceptButtons] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [readStartTime, setReadStartTime] = useState(null);
  const navigate = useNavigate();
  
  const contentRef = useRef(null);
  const constraintsRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      setReadStartTime(Date.now());
    }
  }, [isOpen]);

  const handleScroll = (e) => {
    const element = e.target;
    const isAtBottom = Math.abs(
      element.scrollHeight - element.scrollTop - element.clientHeight
    ) < 2;
    
    if (isAtBottom && !hasScrolledToBottom) {
      const timeSpentReading = (Date.now() - readStartTime) / 1000; // convertir a segundos
      
      if (timeSpentReading < 10) { // Si han pasado menos de 10 segundos
        toast.warning('Por favor, tómate tu tiempo para leer el contrato detenidamente.');
        return;
      }
      
      setHasScrolledToBottom(true);
      setShowAcceptButtons(true);
    }
  };

  const handleAccept = async () => {
    setIsAccepted(true);
    setShowConfetti(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('¡Contrato aceptado exitosamente!', {
      icon: "🎉"
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onAccept();
  };

  const handleReject = () => {
    toast.error('Has rechazado los términos y condiciones.', {
      onClose: () => {
        toast.info('Serás redirigido al inicio...', {
          autoClose: 2000,
          onClose: () => navigate('/')
        });
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        ...springTransition,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: springTransition
    }
  };

  const acceptButtonsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiShield className="mr-2" />
                Contrato de Servicios Tramboory
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="p-6 max-h-[60vh] overflow-y-auto scroll-smooth"
          >
            {/* Alert Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
              <div className="flex">
                <FiAlertCircle className="h-6 w-6 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Por favor, lee detenidamente todos los términos y condiciones.
                    Este documento constituye un acuerdo legal vinculante.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Sections */}
            <div className="space-y-6">
              <ContractSection
                icon={FiDollarSign}
                title="Pagos y Reservaciones"
                items={[
                  "Anticipo requerido de $2,000 pesos para reservar.",
                  "50% del total debe pagarse 30 días antes del evento.",
                  "Pago restante debe completarse 15 días antes del evento.",
                  "No hay devolución del anticipo en caso de cancelación."
                ]}
              />

              <ContractSection
                icon={FiCalendar}
                title="Cambios y Modificaciones"
                items={[
                  "Cambios de fecha requieren 20 días de anticipación.",
                  "Autorización previa necesaria para servicios externos.",
                  "La temática no puede modificarse una vez seleccionada."
                ]}
              />

              <ContractSection
                icon={FiClock}
                title="Durante el Evento"
                items={[
                  "Inicio puntual a la hora reservada.",
                  "Llegada recomendada 15 minutos antes.",
                  "No se permiten alimentos externos excepto dulces y pastel autorizado.",
                  "Servicio de cocina finaliza 2.5 horas después del inicio."
                ]}
              />

              <ContractSection
                icon={FiAlertTriangle}
                title="Restricciones y Seguridad"
                items={[
                  "Prohibido: chicles, confeti, espuma, slime, gelatina, pintura, plastilinas.",
                  "No se permiten espectáculos con fuego o pirotecnia.",
                  "La empresa no se hace responsable por mal uso de instalaciones."
                ]}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {!hasScrolledToBottom ? (
              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                className="text-center space-y-4"
              >
                <FiArrowRight className="mx-auto h-6 w-6 text-gray-400 animate-bounce" />
                <p className="text-gray-600">
                  Continúa leyendo para poder aceptar los términos
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                <motion.div
                  variants={acceptButtonsVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      variants={buttonVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReject}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg flex items-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <FiThumbsDown className="mr-2" />
                      Rechazar Términos
                    </motion.button>

                    <motion.button
                      variants={buttonVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAccept}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg flex items-center shadow-lg hover:bg-green-600 transition-colors"
                    >
                      <FiThumbsUp className="mr-2" />
                      Aceptar Términos
                    </motion.button>
                  </div>

                  {isAccepted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center text-green-500"
                    >
                      <FiCheckCircle className="mx-auto h-8 w-8 mb-2" />
                      <p className="font-semibold">¡Contrato Aceptado!</p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Component for contract sections
const ContractSection = ({ icon: Icon, title, items }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-center mb-4">
      <Icon className="h-6 w-6 text-indigo-600 mr-2" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="h-6 w-6 flex items-center justify-center text-indigo-600 mr-2">
            •
          </span>
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ContractModal;
