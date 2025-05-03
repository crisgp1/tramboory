import React from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle } from 'react-icons/fi'

/**
 * Botón para contacto directo vía WhatsApp
 * con animaciones de hover y tap
 */
const WhatsAppButton = () => {
  // Función para manejar el clic en el botón de WhatsApp
  const handleWhatsAppClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const whatsappUrl = "https://wa.me/523332300243?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20para%20fiestas%20infantiles.";

  return (
    <div className="flex items-center">
      <motion.button
        onClick={() => handleWhatsAppClick(whatsappUrl)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center justify-center space-x-2 py-3 px-6
          bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold
          hover:shadow-lg hover:shadow-green-500/20
          transition-all duration-300 border border-green-400/30 cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <FiMessageCircle className="text-xl" />
        <span>Contactar por WhatsApp</span>
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;