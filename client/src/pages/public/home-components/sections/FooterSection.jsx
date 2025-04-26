import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiHeart, FiStar } from 'react-icons/fi'
import Logo from '@/img/logo.webp'

/**
 * Sección de pie de página mejorada con efectos visuales sofisticados,
 * logo, derechos reservados y enlaces
 */
const FooterSection = () => {
  const currentYear = new Date().getFullYear();
  
  // Referencias para efectos de scroll
  const footerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.7, 1]);
  
  // Enlaces para el footer
  const footerLinks = [
    { to: "/appointments", label: "Reservaciones" },
    { to: "/about", label: "Acerca de" },
    { to: "/appointments", label: "Paquetes" }
  ];
  
  return (
    <motion.footer 
      ref={footerRef}
      style={{ opacity }}
      className="relative py-16 bg-gradient-to-b from-indigo-950/90 to-black/95 overflow-hidden"
    >
      {/* Borde superior decorativo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      
      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes decorativos */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-t from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Pequeñas partículas decorativas */}
        {[...Array(8)].map((_, index) => (
          <motion.div 
            key={`particle-${index}`}
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 3 + index % 5,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{ 
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              bottom: `${20 + Math.random() * 60}%`, 
              left: `${10 + Math.random() * 80}%`,
              backgroundColor: 'rgba(165, 180, 252, 0.3)', // indigo
              filter: "blur(1px)"
            }}
          />
        ))}
        
        {/* Pequeñas estrellas decorativas */}
        {[...Array(2)].map((_, index) => (
          <motion.div
            key={`star-${index}`}
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
            className="absolute text-indigo-300/10"
            style={{
              fontSize: `${12 + index * 2}px`,
              bottom: `${20 + index * 30}%`,
              left: `${20 + index * 60}%`,
            }}
          >
            <FiStar />
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 md:mb-0 relative"
          >
            {/* Efecto de brillo sutil al logo */}
            <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Link to="/" className="flex items-center space-x-4 group relative">
              <div className="relative overflow-hidden rounded-full p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={Logo} alt="Tramboory" className="h-16 w-auto relative z-10" />
                </motion.div>
              </div>
              
              <div className="text-left hidden sm:block">
                <motion.p 
                  className="text-white font-bold text-xl font-funhouse"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Tramboory
                </motion.p>
                <p className="text-indigo-300/90 text-sm">
                  Momentos inolvidables 
                  <FiHeart className="inline-block ml-1 text-xs text-pink-400/70" />
                </p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-right"
          >
            <p className="text-indigo-200/80 text-sm">
              © {currentYear} Tramboory. Todos los derechos
              reservados.
            </p>
            
            <div className="mt-4 flex justify-center md:justify-end space-x-6">
              {footerLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link 
                    to={link.to} 
                    className="relative px-2 py-1 text-indigo-300/90 hover:text-white transition-colors duration-300 group"
                  >
                    {/* Línea decorativa que aparece en hover */}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400/0 via-indigo-400/70 to-indigo-400/0 group-hover:w-full transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default FooterSection;