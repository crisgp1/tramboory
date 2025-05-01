import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiPackage, FiStar } from 'react-icons/fi'
import ServiceCard from '../ui/ServiceCard'

/**
 * Sección mejorada que muestra los paquetes de servicios disponibles
 * con efectos visuales sofisticados y animaciones avanzadas
 */
const ServicesSection = ({ services }) => {
  // Referencias para efectos de scroll
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.7]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);
  
  // Variantes para animaciones secuenciales
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  return (
    <motion.section
      ref={sectionRef}
      id="services"
      style={{ opacity, scale }}
      className="relative py-28 bg-gradient-to-b from-purple-900/90 via-indigo-950/90 to-purple-900/90
        backdrop-blur-lg scroll-mt-20 overflow-hidden"
    >
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes de fondo mejorados */}
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-b from-yellow-500/10 to-transparent rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-20 -left-20 w-[26rem] h-[26rem] bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-[80px]"></div>
        
        {/* Círculos decorativos animados */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] border border-yellow-500/5 rounded-full"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            rotate: [0, -360],
            opacity: [0.03, 0.08, 0.03] 
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute bottom-1/3 left-1/4 w-[35rem] h-[35rem] border border-purple-500/5 rounded-full"
        ></motion.div>
        
        {/* Puntos decorativos */}
        {[...Array(10)].map((_, index) => (
          <motion.div 
            key={`dot-${index}`}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3 + index % 4,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut"
            }}
            className={`absolute bg-${index % 2 === 0 ? 'yellow' : 'purple'}-300/20 rounded-full w-2 h-2`}
            style={{ 
              top: `${10 + index * 8}%`, 
              left: `${5 + index * 9}%`,
              filter: "blur(1px)"
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Badge mejorado - Ahora posicionado correctamente */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 
              backdrop-blur-sm px-5 py-2 rounded-full border border-purple-500/30">
              <FiPackage className="text-purple-300" />
              <span className="text-[0.98em] font-medium text-purple-300 uppercase tracking-wider">
                Paquetes Disponibles
              </span>
            </div>
          </div>
          
          {/* Título mejorado */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-funhouse relative inline-block">
            Nuestros Servicios
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-300/0 via-purple-300/70 to-purple-300/0"
              animate={{ 
                scaleX: [0, 1, 1, 0],
                x: ["-100%", "0%", "0%", "100%"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </h2>
          
          {/* Descripción mejorada */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            Elige el paquete perfecto para tu celebración y déjanos hacer de tu evento algo inolvidable
            <FiStar className="inline ml-2 text-sm text-yellow-300" />
          </motion.p>
        </motion.div>

        {/* Contenedor de tarjetas con animación */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto relative"
        >
          {/* Efecto de brillo decorativo detrás de las tarjetas */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-purple-500/5 via-indigo-500/0 to-yellow-500/5 rounded-3xl blur-3xl -z-10"></div>
          
          {/* Tarjetas de servicio */}
          {Object.entries(services).map(([key, service], index) => (
            <ServiceCard key={key} service={service} index={index} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ServicesSection;