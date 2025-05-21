import React from 'react'
import { motion } from 'framer-motion'

/**
 * Componente para mostrar características destacadas con animaciones
 * y diferentes colores según el tipo de característica
 */
const FeatureCard = ({ feature, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.6,
        delay: index * 0.1
      }
    },
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const gradients = {
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    pink: 'from-pink-400 to-pink-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    red: 'from-red-400 to-red-600'
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      className="feature-card p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg
        border border-white/10 hover:border-white/30 hover:shadow-xl 
        transition-all duration-300 overflow-hidden relative"
    >
      {/* Elemento decorativo */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-tr from-white/5 to-transparent"></div>
      
      <div
        className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center
        bg-gradient-to-r ${gradients[feature.color] || gradients.blue} shadow-lg`}
      >
        <feature.icon className="text-2xl text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 font-funhouse">{feature.title}</h3>
      <p className="text-gray-300 relative z-10">{feature.description}</p>
      
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
        group-hover:w-full transition-all duration-700"></div>
    </motion.div>
  );
};

export default FeatureCard;