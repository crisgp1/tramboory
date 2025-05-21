import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

/**
 * Botón flotante para refrescar los datos del dashboard
 * 
 * @param {Object} props
 * @param {Function} props.onRefresh - Función a ejecutar al hacer clic
 * @param {boolean} props.isRefreshing - Estado de carga durante el refresco
 * @param {boolean} props.disabled - Deshabilitar el botón
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.tooltipText - Texto del tooltip (por defecto: "Actualizar datos")
 * @param {string} props.position - Posición del botón (por defecto: "bottom-right")
 */
const RefreshButton = ({ 
  onRefresh, 
  isRefreshing = false, 
  disabled = false, 
  className = "",
  tooltipText = "Actualizar datos",
  position = "bottom-right"
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determinar clases de posición
  const positionClasses = {
    "bottom-right": "right-4 bottom-20 lg:bottom-4",
    "bottom-left": "left-4 bottom-20 lg:bottom-4",
    "top-right": "right-4 top-20 lg:top-4",
    "top-left": "left-4 top-20 lg:top-4"
  };

  const positionClass = positionClasses[position] || positionClasses["bottom-right"];

  return (
    <motion.button 
      onClick={onRefresh}
      disabled={isRefreshing || disabled}
      className={`fixed ${positionClass} z-10 w-12 h-12 bg-white shadow-lg rounded-full 
        flex items-center justify-center text-indigo-600 hover:bg-indigo-50 
        transition-colors border border-indigo-100 ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ 
        scale: 1.1, 
        boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)"
      }}
      onHoverStart={() => setShowTooltip(true)}
      onHoverEnd={() => setShowTooltip(false)}
      aria-label={tooltipText}
    >
      <FiRefreshCw 
        className={isRefreshing ? 'animate-spin' : ''} 
        size={20} 
      />
      
      {/* Tooltip animado */}
      <AnimatePresence>
        {showTooltip && !disabled && (
          <motion.span 
            className={`absolute ${
              position.includes('left') ? 'left-full ml-2' : 'right-full mr-2'
            } px-2 py-1 bg-gray-800 text-white text-xs rounded 
            pointer-events-none whitespace-nowrap`}
            initial={{ opacity: 0, x: position.includes('left') ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: position.includes('left') ? -10 : 10 }}
            transition={{ duration: 0.2 }}
          >
            {tooltipText}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Indicador de refresco animado */}
      {isRefreshing && (
        <motion.div 
          className="absolute inset-0 rounded-full border-2 border-indigo-300"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.button>
  );
};

export default RefreshButton;