import React from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle } from 'react-icons/fi'

/**
 * Botón para contacto directo vía WhatsApp
 * con animaciones de hover y tap
 */
const WhatsAppButton = () => (
  <motion.a
    href="https://wa.me/5213317650187"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex items-center justify-center space-x-2 py-3 px-6 
      bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold
      hover:shadow-lg hover:shadow-green-500/20 
      transition-all duration-300 border border-green-400/30"
  >
    <FiMessageCircle className="text-xl" />
    <span>Contactar por WhatsApp</span>
  </motion.a>
);

export default WhatsAppButton;