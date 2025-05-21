import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiInstagram, FiImage, FiHeart, FiCamera } from 'react-icons/fi'
import CloudinaryCarousel from '@/components/cloudinary/CloudinaryCarousel'

/**
 * Sección de galería mejorada que muestra imágenes del carousel
 * con efectos visuales sofisticados y estética refinada
 */
const GallerySection = ({ carouselImages }) => {
  // Referencias para efectos de scroll
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -30]);
  
  return (
    <motion.section
      ref={sectionRef}
      id="gallery"
      style={{ opacity, scale }}
      className="relative py-28 bg-gradient-to-b from-purple-900/90 via-indigo-950/90 to-purple-900/90 
        scroll-mt-20 overflow-hidden"
    >
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes de fondo mejorados */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        
        {/* Círculos y formas decorativas */}
        <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-gradient-to-b from-pink-500/10 to-transparent rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-[70px]"></div>
        
        {/* Elementos circulares animados */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ 
            duration: 40, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/3 right-1/4 w-[35rem] h-[35rem] border border-pink-500/5 rounded-full"
        ></motion.div>
        
        {/* Pequeñas partículas flotantes */}
        {[...Array(15)].map((_, index) => (
          <motion.div 
            key={`floating-${index}`}
            initial={{ opacity: 0.1 }}
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3 + index % 5,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{ 
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${5 + Math.random() * 90}%`, 
              left: `${5 + Math.random() * 90}%`,
              backgroundColor: index % 3 === 0 ? 'rgba(244, 114, 182, 0.3)' : // pink
                               index % 3 === 1 ? 'rgba(196, 181, 253, 0.3)' : // purple
                               'rgba(255, 255, 255, 0.3)', // white
              filter: "blur(1px)"
            }}
          />
        ))}
        
        {/* Pequeños iconos decorativos */}
        {[FiCamera, FiHeart].map((Icon, index) => (
          <motion.div
            key={`icon-${index}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: index * 2
            }}
            className="absolute text-pink-300/20"
            style={{
              fontSize: `${index === 0 ? 30 : 24}px`,
              top: `${index === 0 ? 15 : 70}%`,
              left: `${index === 0 ? 80 : 15}%`,
            }}
          >
            <Icon />
          </motion.div>
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
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 
              backdrop-blur-sm px-5 py-2 rounded-full border border-pink-500/30">
              <FiImage className="text-pink-300" />
              <span className="text-[0.96em] font-medium text-pink-300 uppercase tracking-wider">
                Momentos Especiales
              </span>
            </div>
          </div>
          
          {/* Título mejorado */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-funhouse relative inline-block">
            Nuestra Galería
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-pink-300/0 via-pink-300/70 to-pink-300/0"
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
            Momentos inolvidables capturados en Tramboory. ¡Descubre la diversión que te espera!
          </motion.p>
        </motion.div>

        {/* Carrusel mejorado con efectos visuales */}
        <motion.div
          style={{ y: yParallax }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mb-16"
        >
          {/* Marco decorativo alrededor del carrusel */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl blur-sm"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-pink-500/20 via-transparent to-pink-500/20 rounded-2xl"></div>
          
          {/* Decoraciones en las esquinas */}
          <div className="absolute -top-1.5 -left-1.5 w-8 h-8 border-t-2 border-l-2 border-pink-400/30 rounded-tl-lg z-20"></div>
          <div className="absolute -top-1.5 -right-1.5 w-8 h-8 border-t-2 border-r-2 border-pink-400/30 rounded-tr-lg z-20"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-2 border-l-2 border-pink-400/30 rounded-bl-lg z-20"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-2 border-r-2 border-pink-400/30 rounded-br-lg z-20"></div>
          
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-pink-500/20 backdrop-blur-sm relative">
            {/* Capa de overlay para efecto de hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-pink-600/5 via-transparent to-pink-600/5 z-10 opacity-0 
              group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Carrusel con imágenes */}
            <CloudinaryCarousel 
              height="520px"
              autoPlaySpeed={2500}
              imageWidth={1.6}
              images={carouselImages}
            />
          </div>
        </motion.div>

        {/* Botón de Instagram mejorado */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            {/* Efecto de brillo en hover */}
            <span className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-xl blur-md 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            
            <motion.a
              href="https://www.instagram.com/tramboory/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center px-8 py-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 
                text-white rounded-xl font-bold text-lg border border-pink-500/30 
                group-hover:border-pink-400/50 backdrop-blur-md
                transition-all duration-300 shadow-lg"
            >
              <FiInstagram className="mr-3 text-pink-400 text-xl group-hover:text-pink-300 transition-colors duration-300" />
              <span className="group-hover:text-pink-200 transition-colors duration-300">Ver más en Instagram</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default GallerySection;