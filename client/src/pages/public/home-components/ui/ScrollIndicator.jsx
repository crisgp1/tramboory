import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowDown } from 'react-icons/fi'

/**
 * Componente que muestra un indicador animado para hacer scroll
 * hacia una sección específica
 */
const ScrollIndicator = ({ targetId }) => (
  <div className="w-full flex justify-center">
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="flex flex-col items-center"
    >
      <span className="text-white/70 text-sm mb-2">Descubre más</span>
      <a
        href={`#${targetId}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm
        border border-white/20 hover:bg-white/20 transition-all duration-300"
        aria-label="Scroll para descubrir más"
      >
        <FiArrowDown className="text-white" />
      </a>
    </motion.div>
  </div>
);

export default ScrollIndicator;