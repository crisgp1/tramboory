import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Logo from '@/img/logo.webp';
import LogoComplete from '@/img/LogoComplete.webp';
import { 
  FiCalendar, 
  FiPackage, 
  FiInfo,
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiPhone,
  FiInstagram,
  FiChevronRight,
  FiStar
} from 'react-icons/fi';

/**
 * Barra de navegación pública mejorada con efectos visuales sofisticados
 * y animaciones refinadas. Optimizada para mejor rendimiento y responsividad.
 */
const NavbarPublic = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const controls = useAnimation();

  // Elementos de menú con íconos y enlaces
  const menuItems = [
    { icon: <FiHome />, text: 'Inicio', link: '/' },
    { icon: <FiCalendar />, text: 'Reservar', link: '/appointments' },
    { icon: <FiPackage />, text: 'Paquetes', link: '/appointments' },
    { icon: <FiInfo />, text: 'Nosotros', link: '/about' },
    { icon: <FiPhone />, text: 'Contacto', link: '/contact' }
  ];

  // Optimizamos la función de scroll con useCallback
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 80;
    
    // Solo actualizamos el estado si realmente cambió para evitar renderizados innecesarios
    if (isScrolled !== scrolled) {
      setIsScrolled(scrolled);
      
      // Animar la barra cuando cambia el estado de scroll
      controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      });
    }
  }, [isScrolled, controls]);

  // Efecto para detectar scroll y animar la barra de navegación
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    // Iniciar con la animación correcta según el scroll inicial
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Efecto para prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Variantes de animación para el menú móvil
  const menuVariants = {
    closed: { 
      opacity: 0, 
      x: "100%", 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      } 
    },
    open: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      } 
    }
  };

  // Variantes de animación para el fondo semitransparente del menú móvil
  const backdropVariants = {
    closed: { 
      opacity: 0, 
      transition: { 
        duration: 0.2 
      } 
    },
    open: { 
      opacity: 1, 
      transition: { 
        duration: 0.2 
      } 
    }
  };

  // Variantes para los enlaces de navegación
  const navItemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: (custom) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.1 * custom
      }
    }),
    hover: {
      y: -3,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <>
      {/* Elementos decorativos flotantes - reducidos para mejor rendimiento */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
        {/* Reducimos la cantidad de partículas para mejorar el rendimiento */}
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={`nav-particle-${index}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.2, 0],
              y: [0, -15, 0],
              x: [0, index % 2 === 0 ? 5 : -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + index,
              delay: index * 0.7,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              top: `${10 + Math.random() * 50}px`,
              left: `${20 + index * 20}%`,
              background: index % 2 === 0 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(139, 92, 246, 0.3)',
              filter: "blur(1px)",
              zIndex: 39
            }}
          />
        ))}
      </div>

      {/* Barra de navegación */}
      <motion.header
        animate={controls}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'backdrop-blur-lg py-3 border-b border-white/5 bg-purple-900/80' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo con efectos mejorados */}
            <Link to="/" className="relative z-10 flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative group"
              >
                <div className="relative">
                  {/* Efecto de resplandor detrás del logo - optimizado */}
                  <motion.div 
                    className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 blur-md z-0"
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  
                  <motion.img
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    src={isScrolled ? Logo : LogoComplete}
                    alt=""
                    className={`transition-all duration-300 relative z-10 ${isScrolled ? 'h-12 w-auto' : 'h-16 w-auto md:h-20'}`}
                  />
                </div>
                
                {/* Eliminado el texto que aparecía junto al logo al hacer scroll */}
                
                {/* Línea decorativa animada - Optimizada para solo aparecer en hover */}
                <motion.div 
                  className="absolute -bottom-1 left-0 h-0.5 w-0
                    bg-gradient-to-r from-yellow-300/0 via-yellow-300/80 to-yellow-300/0
                    group-hover:w-full transition-all duration-500"
                />
              </motion.div>
            </Link>

            {/* Navegación Desktop con efectos mejorados - ajustada para más tamaños de pantalla */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={`desktop-${item.text}`}
                  custom={index}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Link
                    to={item.link}
                    className="px-3 py-2 text-white rounded-lg hover:bg-white/10 transition-all duration-300 
                      flex items-center space-x-2 group relative overflow-hidden"
                  >
                    {/* Efecto de resplandor en hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    {/* Ícono con animación */}
                    <motion.span 
                      className="text-yellow-300 group-hover:text-white transition-colors duration-300"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      {item.icon}
                    </motion.span>
                    
                    {/* Texto con efecto de transición */}
                    <span className="group-hover:text-yellow-300 transition-colors duration-300 relative">
                      {item.text}
                      {/* Línea decorativa que aparece en hover */}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300/0 via-yellow-300/60 to-yellow-300/0 
                        group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </motion.div>
              ))}

              {/* Botones de autenticación mejorados - con ajustes responsive */}
              <div className="pl-4 flex items-center space-x-2">
                <motion.div
                  variants={navItemVariants}
                  custom={5}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-white hover:text-yellow-300 border border-white/20 hover:border-yellow-300/50 
                      rounded-lg transition-all duration-300 relative group overflow-hidden flex items-center gap-2"
                  >
                    {/* Efecto de resplandor en hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    <FiLogIn className="opacity-100 w-4" />
                    <span>Iniciar sesión</span>
                  </Link>
                </motion.div>
                
                <motion.div
                  variants={navItemVariants}
                  custom={6}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-medium 
                      rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 
                      shadow-md hover:shadow-yellow-400/20 relative group flex items-center gap-2"
                  >
                    {/* Resplandor del botón */}
                    <motion.span 
                      className="absolute inset-0 rounded-lg bg-yellow-400/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{ 
                        opacity: [0, 0.3, 0],
                        scale: [0.9, 1.02, 0.9],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    
                    <FiUserPlus className="opacity-100 w-4" />
                    <span>Registrarse</span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Navegación para tablets - mostramos enlaces principales pero no botones de auth */}
            <div className="hidden md:flex lg:hidden items-center">
              {menuItems.map((item, index) => (
                <motion.div
                  key={`tablet-${item.text}`}
                  custom={index}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Link
                    to={item.link}
                    className="px-2 py-1.5 text-white rounded-lg hover:bg-white/10 transition-all duration-300 
                      flex items-center space-x-1 group relative overflow-hidden text-sm"
                  >
                    <motion.span 
                      className="text-yellow-300 group-hover:text-white transition-colors duration-300"
                    >
                      {item.icon}
                    </motion.span>
                    
                    <span className="group-hover:text-yellow-300 transition-colors duration-300 relative ml-1">
                      {item.text}
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Botón de menú para acceder a Login/Register en tablets */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative z-10 p-2 ml-2 rounded-lg hover:bg-white/10 transition-all duration-300 
                  border border-white/0 hover:border-white/20 group overflow-hidden"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMenuOpen ? (
                  <FiX className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <FiUserPlus className="w-5 h-5 text-white relative" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Botón de menú móvil con efectos mejorados - solo visible en móvil */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative z-10 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 
                border border-white/0 hover:border-white/20 group overflow-hidden"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-white" />
              ) : (
                <>
                  {/* Efecto de resplandor en hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <FiMenu className="w-6 h-6 text-white relative" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Fondo difuminado del menú móvil con efecto mejorado */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menú móvil con efectos mejorados */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-gradient-to-b from-purple-900/95 to-indigo-900/95 
              backdrop-blur-lg shadow-2xl z-50 overflow-y-auto"
            tabIndex={-1}
            aria-label="Menú de navegación"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img src={Logo} alt="" className="h-14 w-auto" />
                  </motion.div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                  aria-label="Cerrar menú"
                >
                  <FiX className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1 py-6 px-4 space-y-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={`mobile-${item.text}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Link
                      to={item.link}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg 
                        hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 
                        transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Efecto de resplandor en hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      
                      <div className="flex items-center space-x-3 relative z-10">
                        <motion.span 
                          className="text-yellow-300 group-hover:text-white transition-colors duration-300"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                          {item.icon}
                        </motion.span>
                        <span className="text-white font-medium group-hover:text-yellow-300 transition-colors duration-300">
                          {item.text}
                        </span>
                      </div>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="text-white/50 group-hover:text-yellow-300 transition-colors duration-300"
                      >
                        <FiChevronRight />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
                
                {/* Enlaces de contacto */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="pt-4 mt-4 border-t border-white/10"
                >
                  <a
                    href="https://www.instagram.com/tramboory/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 rounded-lg 
                      hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-white/10 
                      transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Efecto de resplandor en hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-pink-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    <div className="flex items-center space-x-3">
                      <motion.span 
                        className="text-pink-400 group-hover:text-white transition-colors duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <FiInstagram />
                      </motion.span>
                      <span className="text-white font-medium group-hover:text-pink-400 transition-colors duration-300">
                        Instagram
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="text-white/50 group-hover:text-pink-400 transition-colors duration-300"
                    >
                      <FiChevronRight />
                    </motion.div>
                  </a>
                  
                  <a
                    href="tel:+523317650187"
                    className="flex items-center justify-between px-4 py-3 rounded-lg 
                      hover:bg-gradient-to-r hover:from-green-500/5 hover:to-white/10 
                      transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Efecto de resplandor en hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    
                    <div className="flex items-center space-x-3">
                      <motion.span 
                        className="text-green-400 group-hover:text-white transition-colors duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <FiPhone />
                      </motion.span>
                      <span className="text-white font-medium group-hover:text-green-400 transition-colors duration-300">
                        (33) 1765 0187
                      </span>
                    </div>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="text-white/50 group-hover:text-green-400 transition-colors duration-300"
                    >
                      <FiChevronRight />
                    </motion.div>
                  </a>
                </motion.div>
              </div>

              <div className="p-6 border-t border-white/10 flex flex-col gap-4">
                {/* Botón de inicio de sesión */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="w-full"
                >
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-white/5 to-white/10 text-white rounded-lg
                     flex items-center justify-center gap-2
                     hover:bg-white/20 transition-all duration-300
                     border border-white/10 hover:border-white/30 relative group overflow-hidden"
                  >
                    {/* Efecto de resplandor en hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/10 to-indigo-400/0
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <FiLogIn className="w-5 h-5" />
                    <span>Iniciar sesión</span>
                  </Link>
                </motion.div>

                {/* Botón de registro */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="w-full"
                >
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-medium
                     rounded-lg flex items-center justify-center gap-2
                     hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300
                     shadow-lg hover:shadow-yellow-400/10 relative group overflow-hidden"
                  >
                    {/* Resplandor del botón */}
                    <motion.span
                      className="absolute inset-0 rounded-lg bg-yellow-400/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        opacity: [0, 0.3, 0],
                        scale: [0.95, 1.05, 0.95],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <FiUserPlus className="w-5 h-5" />
                    <span>Registrarse</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavbarPublic;