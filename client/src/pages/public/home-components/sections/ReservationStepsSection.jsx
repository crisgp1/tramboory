import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiCalendar, FiPackage, FiCheck, FiZap, FiArrowRight } from 'react-icons/fi'

/**
 * Sección que muestra los pasos para realizar una reserva
 * con efectos visuales mejorados para una experiencia estética elevada
 */
const ReservationStepsSection = () => {
  // Referencia para efectos de scroll
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };
  
  const reservationSteps = [
    {
      icon: FiCalendar,
      title: "Elige tu fecha",
      description: "Selecciona el día y la hora que mejor te funcionen para tu evento"
    },
    {
      icon: FiPackage,
      title: "Selecciona un paquete",
      description: "Escoge entre nuestras opciones diseñadas para diferentes necesidades"
    },
    {
      icon: FiCheck,
      title: "Personaliza tu experiencia",
      description: "Agrega servicios adicionales para hacer tu evento único"
    },
    {
      icon: FiZap,
      title: "¡Confirma y listo!",
      description: "Realiza tu pago y prepárate para disfrutar de un evento increíble"
    }
  ];

  return (
    <motion.section 
      ref={sectionRef}
      style={{ opacity, scale }}
      className="relative py-28 bg-gradient-to-b from-purple-900/90 via-indigo-900/90 to-purple-900/90 overflow-hidden"
    >
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-60 -right-60 w-[32rem] h-[32rem] bg-gradient-to-t from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Líneas decorativas */}
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            rotate: [0, 180]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] border border-indigo-500/5 rounded-full"
        ></motion.div>
        
        {/* Puntos decorativos */}
        {[...Array(8)].map((_, index) => (
          <motion.div 
            key={`dot-${index}`}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3 + index,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
            className="absolute bg-indigo-300/30 rounded-full w-1.5 h-1.5"
            style={{ 
              top: `${15 + index * 10}%`, 
              left: `${10 + index * 12}%`,
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
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 via-indigo-600/10 to-indigo-500/10 
              backdrop-blur-sm px-5 py-2 rounded-full border border-indigo-500/30">
              <span className="text-[0.98em] font-medium text-indigo-300 uppercase tracking-wider">
                Proceso Simplificado
              </span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-funhouse relative inline-block">
            ¿Cómo Reservar?
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-300/0 via-indigo-300/70 to-indigo-300/0"
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
          
          <motion.p 
            className="text-xl text-indigo-200/90 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Solo 4 pasos sencillos te separan de tu evento perfecto
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto relative"
        >
          {/* Línea conectora principal para desktop */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[4.5rem] right-[4.5rem] h-0.5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/30 to-indigo-500/10"></div>
          
          {reservationSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative z-10"
            >
              {/* Tarjeta con glassmorphism y efectos hover */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(79, 70, 229, 0.15)" }}
                className="flex flex-col items-center text-center p-6 rounded-2xl 
                  bg-gradient-to-br from-indigo-700/10 to-indigo-900/30
                  backdrop-blur-md border border-indigo-500/20 
                  transition-all duration-300 h-full group"
              >
                {/* Icono con efecto de brillo */}
                <div className="relative">
                  <div className="absolute -inset-3 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full 
                    bg-gradient-to-br from-indigo-500/30 to-indigo-700/30 
                    border border-indigo-500/40 mb-5 relative z-10
                    group-hover:border-indigo-400/50 transition-all duration-300"
                  >
                    <step.icon className="text-2xl text-yellow-300 group-hover:text-yellow-200" />
                  </div>
                </div>
                
                {/* Número del paso con diseño mejorado */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full
                  bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 
                  backdrop-blur-md border border-yellow-400/30
                  flex items-center justify-center z-20"
                >
                  <span className="text-yellow-300 text-sm font-bold">{index + 1}</span>
                </div>
                
                {/* Flecha entre pasos (visible en móvil y tablet) */}
                {index < reservationSteps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 lg:hidden z-10">
                    <FiArrowRight className="text-indigo-400/60" />
                  </div>
                )}
                
                {/* Contenido del paso */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                  {step.title}
                </h3>
                <p className="text-indigo-200/90 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
              
              {/* Punto decorativo en la línea conectora (solo desktop) */}
              {index < reservationSteps.length && (
                <motion.div 
                  className="hidden lg:flex absolute top-[4.5rem] left-1/2 transform -translate-x-1/2 z-20
                    w-4 h-4 rounded-full bg-indigo-600/40 border border-indigo-400/60
                    items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ReservationStepsSection;