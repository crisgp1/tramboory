import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiX, 
  FiArrowDown, 
  FiAlertTriangle, 
  FiLock,
  FiThumbsUp,
  FiThumbsDown,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiAlertCircle,
  FiChevronDown,
  FiInfo,
  FiClipboard,
  FiBookOpen,
  FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';

// Definiciones de animaciones
const transitionConfig = {
  type: "spring",
  damping: 30,
  stiffness: 400
};

const ContractModal = ({ isOpen, onClose, onAccept }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showAcceptButtons, setShowAcceptButtons] = useState(false);
  const [readStartTime, setReadStartTime] = useState(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    pagos: true,
    cambios: true,
    evento: true,
    restricciones: true
  });
  const navigate = useNavigate();
  
  const contentRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      setReadStartTime(Date.now());
      
      // Animación de entrada
      const timer = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.add('animate-in');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Calcular porcentaje de scroll
    const newScrollPercentage = Math.min(
      100,
      Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
    );
    setScrollPercentage(newScrollPercentage);
    
    // Verificar si ha llegado al final
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    
    if (isAtBottom && !hasScrolledToBottom) {
      const timeSpentReading = (Date.now() - readStartTime) / 1000; // convertir a segundos
      
      if (timeSpentReading < 10) { // Si han pasado menos de 10 segundos
        toast.warning('Por favor, tómate tu tiempo para leer el contrato completo.', {
          icon: '⏳',
          position: 'top-center'
        });
        return;
      }
      
      setHasScrolledToBottom(true);
      
      // Añadir animación más suave para los botones
      setTimeout(() => {
        setShowAcceptButtons(true);
      }, 500);
    }
  };

  const handleAccept = async () => {
    setIsAccepted(true);
    
    // Animación de aceptación
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success('¡Contrato aceptado exitosamente!', {
      icon: "🎉",
      position: 'top-center',
      style: {
        borderRadius: '10px',
        background: '#10B981',
        color: '#fff',
      },
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onAccept();
  };

  const handleReject = () => {
    toast.error('Has rechazado los términos y condiciones.', {
      icon: "ℹ️",
      position: 'top-center',
      onClose: () => {
        toast.info('Serás redirigido al inicio...', {
          autoClose: 2000,
          position: 'top-center',
          onClose: () => navigate('/')
        });
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay con efecto de blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-slate-900/70 to-indigo-900/70"
          onClick={onClose}
        />
        
        {/* Modal principal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={transitionConfig}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden pointer-events-auto border border-indigo-50 dark:border-indigo-900/30"
            style={{
              maxHeight: 'calc(100vh - 2rem)',
              boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)'
            }}
          >
            {/* Header con estilo glassmorphism */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-95"></div>
              <div className="relative p-6 sm:p-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl">
                      <FiClipboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Contrato de Servicios
                      </h2>
                      <p className="text-indigo-100 text-sm mt-1">
                        Léelo detenidamente antes de aceptar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all duration-300"
                    aria-label="Cerrar"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Barra de progreso de lectura */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: `${scrollPercentage}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </div>

            {/* Contenido principal con scroll */}
            <div 
              ref={contentRef}
              onScroll={handleScroll}
              className="max-h-[calc(100vh-22rem)] overflow-y-auto scroll-smooth p-6 sm:p-8 space-y-6"
            >
              {/* Alerta introductoria */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...transitionConfig }}
                className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 dark:border-amber-500 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start">
                  <FiAlertCircle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Información importante</h3>
                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                      <p>
                        Este documento constituye un acuerdo legal vinculante entre usted y Tramboory.
                        Al aceptar, confirma que ha leído, entendido y está de acuerdo con todos los términos.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Secciones del contrato con acordeón */}
              <div className="space-y-4">
                <ContractSection
                  title="Pagos y Reservaciones"
                  icon={FiDollarSign}
                  isExpanded={expandedSections.pagos}
                  toggleExpand={() => toggleSection('pagos')}
                  delay={0.3}
                  items={[
                    "Anticipo requerido de $2,000 pesos para reservar.",
                    "50% del total debe pagarse 30 días antes del evento.",
                    "Pago restante debe completarse 15 días antes del evento.",
                    "No hay devolución del anticipo en caso de cancelación."
                  ]}
                />

                <ContractSection
                  title="Cambios y Modificaciones"
                  icon={FiCalendar}
                  isExpanded={expandedSections.cambios}
                  toggleExpand={() => toggleSection('cambios')}
                  delay={0.4}
                  items={[
                    "Cambios de fecha requieren 20 días de anticipación.",
                    "Autorización previa necesaria para servicios externos.",
                    "La temática no puede modificarse una vez seleccionada."
                  ]}
                />

                <ContractSection
                  title="Durante el Evento"
                  icon={FiClock}
                  isExpanded={expandedSections.evento}
                  toggleExpand={() => toggleSection('evento')}
                  delay={0.5}
                  items={[
                    "Inicio puntual a la hora reservada.",
                    "Llegada recomendada 15 minutos antes.",
                    "No se permiten alimentos externos excepto dulces y pastel autorizado.",
                    "Servicio de cocina finaliza 2.5 horas después del inicio."
                  ]}
                />

                <ContractSection
                  title="Restricciones y Seguridad"
                  icon={FiAlertTriangle}
                  isExpanded={expandedSections.restricciones}
                  toggleExpand={() => toggleSection('restricciones')}
                  delay={0.6}
                  items={[
                    "Prohibido: chicles, confeti, espuma, slime, gelatina, pintura, plastilinas.",
                    "No se permiten espectáculos con fuego o pirotecnia.",
                    "La empresa no se hace responsable por mal uso de instalaciones."
                  ]}
                />
              </div>
              
              {/* Información adicional */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Al aceptar este contrato, reconoces que has leído y comprendido todas las cláusulas
                      y que aceptas todas las responsabilidades y condiciones establecidas en este acuerdo.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Indicador de scroll si no ha llegado al final */}
              {!hasScrolledToBottom && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 10, 0] }}
                  transition={{ 
                    delay: 0.8, 
                    y: {
                      repeat: Infinity,
                      duration: 2
                    }
                  }}
                  className="flex flex-col items-center justify-center py-4"
                >
                  <FiArrowDown className="h-6 w-6 text-indigo-400" />
                  <p className="text-sm text-gray-500 mt-2">Continúa leyendo para aceptar</p>
                </motion.div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
              {!hasScrolledToBottom ? (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <FiBookOpen className="w-5 h-5" />
                    <span>Por favor, lee el contrato completo</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {showAcceptButtons && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={transitionConfig}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleReject}
                          className="flex-1 px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all duration-300"
                        >
                          <FiThumbsDown className="w-5 h-5" />
                          <span>Rechazar Términos</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleAccept}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all duration-300"
                        >
                          <FiThumbsUp className="w-5 h-5" />
                          <span>Aceptar Términos</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Indicador de estado de aceptación */}
                  {isAccepted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="text-center"
                    >
                      <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <FiCheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="mt-2 font-medium text-green-700 dark:text-green-400">
                        ¡Contrato Aceptado!
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

// Componente de sección de contrato mejorado
const ContractSection = ({ icon: Icon, title, items, isExpanded, toggleExpand, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ...transitionConfig }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <button 
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 pt-1">
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start"
                  >
                    <span className="inline-flex items-center justify-center h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0">
                      <FiArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContractModal;