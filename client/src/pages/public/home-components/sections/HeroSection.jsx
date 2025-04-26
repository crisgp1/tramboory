import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'
import { FiCalendar, FiGift, FiStar } from 'react-icons/fi'
import ScrollIndicator from '../ui/ScrollIndicator'

/**
 * Sección hero principal con mensaje de bienvenida, título y CTA
 * Mejorada con efectos visuales avanzados
 */
const HeroSection = ({ sectionRefs }) => {
  const controls = useAnimation();
  const { scrollY } = useScroll();
  const decorRef = useRef(null);
  
  // Efecto parallax avanzado basado en scroll
  const yParallax = useTransform(scrollY, [0, 500], [0, -150]);
  const opacityParallax = useTransform(scrollY, [0, 300], [1, 0]);
  
  useEffect(() => {
    // Animar la aparición secuencial de los elementos decorativos
    controls.start((i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3 * i, duration: 1.2, ease: "easeOut" }
    }));
  }, [controls]);

  return (
    <section
      ref={sectionRefs.hero}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Elementos decorativos mejorados del hero */}
      <div ref={decorRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes circulares con animación */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={controls}
          custom={0}
          className="absolute -top-40 -right-40 w-[28rem] h-[28rem] bg-gradient-to-b from-purple-500/15 to-transparent rounded-full blur-[60px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={controls}
          custom={1}
          className="absolute top-1/3 left-10 w-40 h-40 bg-gradient-to-r from-yellow-400/15 to-transparent rounded-full blur-[40px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={controls}
          custom={2}
          className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-t from-indigo-500/15 to-transparent rounded-full blur-[50px]"
        />
        
        {/* Elementos decorativos adicionales */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full filter blur-[1px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-300 rounded-full filter blur-[1px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full filter blur-[1px] animate-pulse"></div>
        
        {/* Formas geométricas decorativas */}
        <motion.div 
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 0.3, rotate: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[15%] left-[10%] w-8 h-8 border border-yellow-400/20 rounded-md transform rotate-12"
        />
        <motion.div 
          initial={{ opacity: 0, rotate: 10 }}
          animate={{ opacity: 0.3, rotate: 0 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-[25%] right-[15%] w-12 h-12 border border-purple-400/20 rounded-full"
        />
      </div>
      
      {/* Contenido principal con parallax efect */}
      <motion.div
        ref={sectionRefs.content}
        style={{ y: yParallax, opacity: opacityParallax }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="container mx-auto px-6 pt-24 pb-32 text-center hero-content relative z-10"
      >
        <div className="max-w-5xl mx-auto">
          {/* Badge mejorado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <span className="group relative px-5 py-2 rounded-full text-sm font-medium 
              bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 
              text-yellow-300 border border-purple-500/30 backdrop-blur-sm 
              hover:border-yellow-400/50 transition-all duration-300 inline-flex items-center gap-2">
              <FiStar className="text-yellow-300 animate-pulse" />
              <span>El mejor salón de fiestas infantiles en Zapopan</span>
              <motion.span 
                className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 rounded-full"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
              />
            </span>
          </motion.div>
          
          {/* Título principal mejorado */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 font-funhouse leading-tight"
          >
            <span className="block relative">
              Celebra con{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-gradient bg-clip-text text-transparent
                  bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 
                  transform hover:scale-105 transition-transform duration-500">
                  Tramboory
                </span>
                <motion.span 
                  className="absolute -inset-1 -z-10 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 rounded-2xl blur-xl"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                />
              </span>
            </span>
          </motion.h1>
          
          {/* Subtítulo mejorado */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-200 mb-14 max-w-3xl mx-auto leading-relaxed"
          >
            Tu salón de eventos infantiles en Zapopan con experiencias diseñadas
            para crear recuerdos inolvidables en el cumpleaños de tus pequeños
          </motion.p>
          
          {/* Botones CTA mejorados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <span className="absolute -inset-1 bg-gradient-to-r from-yellow-400/80 to-yellow-500/80 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Link
                to="/appointments"
                className="relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500
                  text-purple-900 rounded-xl font-bold text-lg shadow-xl
                  hover:shadow-yellow-400/40 hover:from-yellow-500 hover:to-yellow-600 
                  transition-all duration-300 flex items-center group-hover:text-purple-950"
              >
                <FiCalendar className="mr-2" />
                <span>Reserva tu fiesta</span>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <span className="absolute -inset-0.5 bg-white/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <motion.a
                href="#services"
                className="relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl
                  font-bold text-lg border border-white/20 hover:bg-white/20 hover:border-white/40
                  transition-all duration-300 flex items-center group-hover:text-yellow-200"
              >
                <FiGift className="mr-2" />
                <span>Paquetes para fiestas</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator mejorado */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <ScrollIndicator targetId="services" />
      </div>
    </section>
  );
};

export default HeroSection;