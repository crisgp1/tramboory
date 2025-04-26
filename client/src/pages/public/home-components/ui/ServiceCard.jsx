import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiStar } from 'react-icons/fi'

/**
 * Componente de tarjeta para mostrar información de servicios
 * con animaciones y estilos condicionales según si es recomendado
 */
const ServiceCard = ({ service, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.3,
        delay: index * 0.2
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

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        delay: i * 0.1
      }
    })
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-50px" }}
      className={`service-card relative p-8 rounded-2xl backdrop-blur-lg overflow-hidden
        transform-gpu will-change-transform shadow-xl
        transition-all duration-300
        ${
          service.recommended
            ? 'bg-gradient-to-br from-purple-900/80 to-purple-800/80 border-2 border-yellow-400/50'
            : 'bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 border border-white/20'
        }`}
    >
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className={`absolute w-64 h-64 rounded-full bg-gradient-to-tr ${service.recommended ? 'from-yellow-400/30' : 'from-indigo-400/30'} to-transparent -top-32 -right-32`}></div>
        <div className={`absolute w-64 h-64 rounded-full bg-gradient-to-tr ${service.recommended ? 'from-yellow-400/20' : 'from-indigo-400/20'} to-transparent -bottom-32 -left-32`}></div>
      </div>
      
      {service.recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-purple-900 px-4 py-1 rounded-full
            text-sm font-semibold shadow-lg flex items-center">
            <FiStar className="mr-1" /> Recomendado
          </span>
        </div>
      )}

      <div className="mb-6 relative">
        <h3 className="text-2xl font-bold text-white mb-2 font-funhouse">{service.title}</h3>
        <p className="text-gray-300">{service.description}</p>
        <div className={`text-3xl font-bold mt-4 ${service.recommended ? 'text-yellow-400' : 'text-white'}`}>
          ${service.price}
          <span className="text-sm font-normal text-gray-400 ml-1">MXN</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {service.features.map((feature, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            variants={featureVariants}
            className="flex items-start space-x-3"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${service.recommended ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
              <feature.icon className={`w-4 h-4 ${service.recommended ? 'text-yellow-400' : 'text-white'}`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{feature.title}</p>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {service.highlights.map((highlight, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${service.recommended 
                ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' 
                : 'bg-white/10 text-white border border-white/20'}`}
          >
            {highlight}
          </motion.span>
        ))}
      </div>

      <Link to="/appointments">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2
            transition-all duration-300 transform-gpu
            ${
              service.recommended
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-purple-900 hover:shadow-yellow-400/20 hover:shadow-lg'
                : 'bg-gradient-to-r from-white/10 to-white/20 text-white hover:bg-white/20 hover:shadow-white/5 hover:shadow-lg'
            }`}
        >
          <span>Reservar Ahora</span>
          <FiArrowRight className="ml-2" />
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;