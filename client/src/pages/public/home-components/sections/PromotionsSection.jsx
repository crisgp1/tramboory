import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight, FiStar, FiGift } from 'react-icons/fi'
import CloudinaryCarousel from '@/components/cloudinary/CloudinaryCarousel'

/**
 * Sección de promociones del mes que se muestra condicionalmente
 * con efectos visuales mejorados para un aspecto ultra estético
 */
const PromotionsSection = ({ promocionesImages }) => {
  // Referencias para efectos de scroll
  const sectionRef = useRef(null);
  
  // Si no hay imágenes de promociones, no renderizar la sección
  if (!promocionesImages || promocionesImages.length === 0) {
    return null;
  }
  
  // Configurar efectos de scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transformar valores basados en el scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  // Variantes para animaciones secuenciales
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id="promociones"
      style={{ opacity, scale }}
      className="relative py-24 bg-gradient-to-br from-purple-800/90 via-indigo-900/90 to-purple-900/90 
        scroll-mt-20 backdrop-blur-md overflow-hidden"
    >
      {/* Mejora de los efectos de transición entre secciones */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        
        {/* Elementos decorativos adicionales */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute -top-40 -left-40 w-80 h-80 border border-yellow-400/10 rounded-full"
        />
        <motion.div 
          animate={{ 
            rotate: [0, -360],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute -bottom-60 -right-60 w-[32rem] h-[32rem] border border-purple-400/10 rounded-full"
        />
        
        {/* Estrellas decorativas */}
        {[...Array(6)].map((_, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2 + index,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
            className="absolute bg-yellow-300/20 rounded-full w-1 h-1"
            style={{ 
              top: `${15 + index * 12}%`, 
              left: `${5 + index * 15}%`,
              filter: "blur(1px)"
            }}
          />
        ))}
      </div>
      
      <motion.div 
        className="container mx-auto px-6 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 via-pink-500/10 to-yellow-500/10 
            backdrop-blur-sm px-5 py-2 rounded-full border border-yellow-500/30 mb-4">
            <FiGift className="text-yellow-300 animate-pulse" />
            <span className="text-sm font-medium text-yellow-300 uppercase tracking-wide">
              Ofertas Especiales
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-funhouse relative inline-block">
            ¡Promociones del Mes!
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-300/0 via-yellow-300/70 to-yellow-300/0"
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
            className="text-xl text-yellow-200/90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            No te pierdas nuestras ofertas especiales por tiempo limitado
            <FiStar className="inline ml-2 text-sm text-yellow-300 animate-pulse" />
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mb-12 relative"
        >
          {/* Efecto decorativo en las esquinas del carrusel */}
          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-2 border-l-2 border-yellow-400/30 rounded-tl-xl z-20"></div>
          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-2 border-r-2 border-yellow-400/30 rounded-tr-xl z-20"></div>
          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-2 border-l-2 border-yellow-400/30 rounded-bl-xl z-20"></div>
          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-2 border-r-2 border-yellow-400/30 rounded-br-xl z-20"></div>
          
          {/* Carrusel con efectos mejorados */}
          <div className="rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)] 
            backdrop-blur-lg border border-white/10 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-purple-600/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CloudinaryCarousel 
              height="480px"
              autoPlaySpeed={3000}
              imageWidth={1.2}
              images={promocionesImages}
            />
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            {/* Efecto de brillo en hover */}
            <span className="absolute -inset-1 bg-gradient-to-r from-yellow-400/70 to-yellow-500/70 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <Link
              to="/reservations"
              className="relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500
                text-purple-900 rounded-xl font-bold text-lg shadow-xl
                hover:shadow-yellow-400/50 hover:from-yellow-500 hover:to-yellow-600 
                transition-all duration-300 group flex items-center"
            >
              <span>¡Reserva Ahora!</span>
              <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default PromotionsSection;