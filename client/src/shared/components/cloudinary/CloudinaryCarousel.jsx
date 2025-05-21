import React, { useState, useEffect, useRef } from 'react'
import { AdvancedImage } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import { auto } from '@cloudinary/url-gen/qualifiers/quality'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format'
import { contrast, brightness } from '@cloudinary/url-gen/actions/adjust'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiArrowRight, FiMaximize, FiPlay, FiPause, FiInfo } from 'react-icons/fi'

const CloudinaryCarousel = ({
  cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  autoPlaySpeed = 5, // Ajustado para que sea más intuitivo (ahora son segundos)
  height = '600px',
  images: customImages = [],
  showGradientOverlay = true,
  cardHeight = 380, // Mayor tamaño por defecto para más impacto visual
  cardWidth = 500, // Mayor ancho por defecto
  cardGap = 24,
  theme = 'purple',
  cardStyle = 'elegant',
  showTitle = false,
  title = 'Galería de imágenes',
  subtitle = 'Desliza para ver más',
  animationMode = 'slide', // slide, fade, zoom, 3d
  enableLightbox = true,
  autoPlay = true,
  showIndicators = true,
  enableKeyboard = true,
  imageWidth = 1.0, // Factor de escala para el ancho de la imagen (usado en Home.jsx)
}) => {
  // Estados
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [direction, setDirection] = useState(0) // -1: izquierda, 1: derecha
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  
  // Referencias
  const carouselRef = useRef(null)
  const autoPlayTimerRef = useRef(null)

  // Calcular dimensiones basadas en propiedades
  const calculatedCardWidth = Math.round(cardWidth * (typeof imageWidth === 'number' ? imageWidth : 1.0))
  
  // Inicializar Cloudinary
  const cld = new Cloudinary({
    cloud: { cloudName }
  })
  
  // Preparar URLs de Cloudinary
  const getCloudinaryImage = (publicId, options = {}) => {
    if (!publicId || typeof publicId !== 'string') {
      console.error('ID de imagen inválido:', publicId);
      return null;
    }
    
    // Valores por defecto para transformaciones
    const { width = calculatedCardWidth, height = cardHeight, quality = 'auto' } = options;
    
    // Si ya es una URL completa, la procesamos
    if (publicId.startsWith('http') && publicId.includes('cloudinary.com')) {
      try {
        // Validar URL
        new URL(publicId);
        
        // Extraer solo el ID de la imagen sin transformaciones
        const url = new URL(publicId);
        const pathSegments = url.pathname.split('/');
        
        // Buscar versión e ID
        let version = null;
        let imageId = null;
        
        for (let i = 0; i < pathSegments.length; i++) {
          if (pathSegments[i].startsWith('v') && /^v\d+$/.test(pathSegments[i])) {
            version = pathSegments[i];
            if (i + 1 < pathSegments.length) {
              imageId = pathSegments[i + 1];
              // Quitar extensión si existe
              if (imageId.includes('.')) {
                imageId = imageId.substring(0, imageId.lastIndexOf('.'));
              }
              break;
            }
          }
        }
        
        if (version && imageId) {
          const img = cld.image(imageId)
            .format(autoFormat())
            .quality(quality)
            .resize(
              fill()
                .gravity(autoGravity())
                .width(width)
                .height(height)
            )
            .adjust(contrast().level(5))
            .adjust(brightness().level(5))
          
          // Usar la versión original en la URL
          img.setVersion(version.substring(1)); // Quitar la "v" inicial
          return img;
        }
      } catch (error) {
        console.error('Error al procesar URL completa de Cloudinary:', error);
      }
    }
    
    // Procesar como un ID simple o parcial
    let imageId = publicId;
    
    // Caso 1: Patrón con versión (v1234567/nombre_imagen)
    if (publicId.includes('/') && /v\d+\//.test(publicId)) {
      const match = publicId.match(/v(\d+)\/([^.?]+)/);
      if (match && match[1] && match[2]) {
        const version = match[1];
        imageId = match[2];
        
        const img = cld.image(imageId)
          .format(autoFormat())
          .quality(quality)
          .resize(
            fill()
              .gravity(autoGravity())
              .width(width)
              .height(height)
          )
          .adjust(contrast().level(5))
          .adjust(brightness().level(5))
        
        img.setVersion(version);
        return img;
      }
    }
    
    // Caso 2: ID con extensión
    if (imageId.includes('.')) {
      imageId = imageId.substring(0, imageId.lastIndexOf('.'));
    }
    
    // Configurar imagen básica
    return cld.image(imageId)
      .format(autoFormat())
      .quality(quality)
      .resize(
        fill()
          .gravity(autoGravity())
          .width(width)
          .height(height)
      )
      .adjust(contrast().level(5))
      .adjust(brightness().level(5))
  }

  // Cargar imágenes
  useEffect(() => {
    // Configuramos la carga de imágenes
    setIsLoading(true)
    
    try {
      const timer = setTimeout(() => {
        let imagesToUse = []
        
        // Procesamos imágenes proporcionadas
        if (customImages && customImages.length > 0) {
          imagesToUse = customImages
            .map((publicId, index) => {
              const cldImg = getCloudinaryImage(publicId);
              if (cldImg) {
                return {
                  id: `img-${index}-${Date.now()}`,
                  publicId: publicId,
                  cldImg: cldImg,
                  fullsizeCldImg: getCloudinaryImage(publicId, { 
                    width: 1200, 
                    height: 900, 
                    quality: 'auto:best' 
                  })
                };
              }
              return null;
            })
            .filter(img => img !== null);
        }
        
        setImages(imagesToUse)
        setIsLoading(false)
      }, 500) // Tiempo reducido para carga más rápida
      
      return () => clearTimeout(timer)
    } catch (err) {
      setError('Error al cargar las imágenes')
      setIsLoading(false)
      console.error('Error cargando imágenes:', err)
    }
  }, [customImages, cloudName, calculatedCardWidth, cardHeight])

  // Manejar autoplay
  useEffect(() => {
    if (isAutoPlaying && images.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, autoPlaySpeed * 1000); // Convertir a milisegundos
    }
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, images.length, autoPlaySpeed]);

  // Manejar dimensiones de ventana
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manejar eventos de teclado para navegación
  useEffect(() => {
    if (!enableKeyboard) return;
    
    const handleKeyDown = (e) => {
      if (lightboxOpen) {
        // Controles específicos del lightbox
        switch (e.key) {
          case 'ArrowLeft':
            setLightboxIndex(prev => (prev - 1 + images.length) % images.length);
            break;
          case 'ArrowRight':
            setLightboxIndex(prev => (prev + 1) % images.length);
            break;
          case 'Escape':
            setLightboxOpen(false);
            break;
          default:
            break;
        }
      } else {
        // Controles del carrusel normal
        switch (e.key) {
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length, enableKeyboard]);

  // Handlers para navegación
  const handleNext = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    setDirection(1);
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    
    // Reiniciar autoplay si está activo
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, autoPlaySpeed * 1000);
    }
  };

  const handlePrevious = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    setDirection(-1);
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
    
    // Reiniciar autoplay si está activo
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, autoPlaySpeed * 1000);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const openLightbox = (index) => {
    if (!enableLightbox) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
    
    // Pausar autoplay mientras el lightbox está abierto
    setIsAutoPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    // Restaurar autoplay si estaba activo antes
    if (autoPlay) {
      setIsAutoPlaying(true);
    }
  };

  // Handlers para eventos táctiles
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchStartX - touchCurrentX;
    
    // Determinar dirección del swipe
    if (Math.abs(diff) > 50) { // Umbral de swipe
      if (diff > 0) {
        // Swipe izquierda (siguiente)
        handleNext();
      } else {
        // Swipe derecha (anterior)
        handlePrevious();
      }
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
  };
  
  // Mapa de temas de color con diseños más vivos y atractivos
  const themeColors = {
    purple: {
      primary: 'from-purple-800/95 to-purple-900/95',
      gradient: 'bg-gradient-to-r from-purple-600 to-indigo-800',
      secondary: 'bg-gradient-to-t from-purple-900/90 to-indigo-800/30',
      text: 'text-purple-50',
      border: 'border-purple-400/30',
      accent: 'text-purple-300',
      highlight: 'text-yellow-300',
      loader: 'border-purple-400',
      bgAccent: 'bg-purple-500',
      buttonBg: 'bg-purple-600/90 hover:bg-purple-500/90',
      buttonText: 'text-white',
      indicatorActive: 'bg-purple-300',
      indicatorInactive: 'bg-purple-800/50',
    },
    blue: {
      primary: 'from-blue-800/95 to-blue-900/95',
      gradient: 'bg-gradient-to-r from-blue-600 to-cyan-800',
      secondary: 'bg-gradient-to-t from-blue-900/90 to-cyan-800/30',
      text: 'text-blue-50',
      border: 'border-blue-400/30',
      accent: 'text-blue-300',
      highlight: 'text-yellow-200',
      loader: 'border-blue-400',
      bgAccent: 'bg-blue-500',
      buttonBg: 'bg-blue-600/90 hover:bg-blue-500/90',
      buttonText: 'text-white',
      indicatorActive: 'bg-blue-300',
      indicatorInactive: 'bg-blue-800/50',
    },
    teal: {
      primary: 'from-teal-800/95 to-teal-900/95',
      gradient: 'bg-gradient-to-r from-teal-600 to-emerald-800',
      secondary: 'bg-gradient-to-t from-teal-900/90 to-emerald-800/30',
      text: 'text-teal-50',
      border: 'border-teal-400/30',
      accent: 'text-teal-300',
      highlight: 'text-amber-200',
      loader: 'border-teal-400',
      bgAccent: 'bg-teal-500',
      buttonBg: 'bg-teal-600/90 hover:bg-teal-500/90',
      buttonText: 'text-white',
      indicatorActive: 'bg-teal-300',
      indicatorInactive: 'bg-teal-800/50',
    },
    amber: {
      primary: 'from-amber-800/95 to-amber-900/95',
      gradient: 'bg-gradient-to-r from-amber-600 to-orange-700',
      secondary: 'bg-gradient-to-t from-amber-900/90 to-orange-800/30',
      text: 'text-amber-50',
      border: 'border-amber-400/30',
      accent: 'text-amber-300',
      highlight: 'text-white',
      loader: 'border-amber-400',
      bgAccent: 'bg-amber-500',
      buttonBg: 'bg-amber-600/90 hover:bg-amber-500/90',
      buttonText: 'text-white',
      indicatorActive: 'bg-amber-300',
      indicatorInactive: 'bg-amber-800/50',
    }
  };

  // Mapa de estilos de tarjeta con diseños modernos
  const cardStyles = {
    elegant: {
      container: "rounded-xl shadow-2xl overflow-hidden",
      wrapper: "relative overflow-hidden group",
      image: "object-cover w-full h-full transition-all duration-700",
      overlay: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300",
      caption: "absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
      hoverEffect: "group transform transition-transform duration-500 hover:scale-[1.02]",
    },
    modern: {
      container: "rounded-2xl shadow-2xl overflow-hidden",
      wrapper: "relative overflow-hidden group",
      image: "object-cover w-full h-full transition-all duration-700 filter brightness-95 contrast-105",
      overlay: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300",
      caption: "absolute bottom-0 left-0 right-0 p-5 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
      hoverEffect: "group transform transition-all duration-700 hover:scale-[1.03] hover:rotate-1",
    },
    classic: {
      container: "overflow-hidden bg-black border-2 border-white/20 shadow-xl",
      wrapper: "relative overflow-hidden group",
      image: "object-cover w-full h-full transition-all duration-500 filter grayscale-[0.2]",
      overlay: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300",
      caption: "absolute bottom-0 left-0 right-0 p-4 text-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
      hoverEffect: "group transition-transform duration-500 hover:scale-[1.02]",
    },
    minimal: {
      container: "overflow-hidden",
      wrapper: "relative overflow-hidden group",
      image: "object-cover w-full h-full transition-all duration-500",
      overlay: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-30 transition-opacity duration-300",
      caption: "absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-sm rounded-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
      hoverEffect: "group transition-all duration-500",
    }
  };

  // Configuraciones de animación para diferentes modos
  const animationVariants = {
    slide: {
      enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
      }),
      center: {
        x: 0,
        opacity: 1
      },
      exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0
      })
    },
    fade: {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 }
    },
    zoom: {
      enter: { opacity: 0, scale: 0.8 },
      center: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.2 }
    },
    '3d': {
      enter: (direction) => ({
        rotateY: direction > 0 ? 90 : -90,
        opacity: 0,
        z: -200
      }),
      center: {
        rotateY: 0,
        opacity: 1,
        z: 0
      },
      exit: (direction) => ({
        rotateY: direction < 0 ? 90 : -90,
        opacity: 0,
        z: -200
      })
    }
  };

  // Duración de las animaciones
  const animationDuration = {
    slide: 0.5,
    fade: 0.7,
    zoom: 0.7,
    '3d': 0.8
  };

  // Obtener el tema actual
  const currentTheme = themeColors[theme] || themeColors.purple;
  const currentCardStyle = cardStyles[cardStyle] || cardStyles.elegant;
  
  // Obtener la variante de animación actual
  const currentAnimation = animationVariants[animationMode] || animationVariants.slide;
  const currentAnimationDuration = animationDuration[animationMode] || 0.5;

  // Componente de carga
  if (isLoading) {
    return (
      <div className={`flex flex-col justify-center items-center ${currentTheme.text} ${currentTheme.gradient}`} style={{ height }}>
        <div className="relative w-24 h-24">
          <div className={`animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 ${currentTheme.border}`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`h-12 w-12 rounded-full ${currentTheme.gradient} animate-pulse`}></div>
          </div>
        </div>
        <p className={`mt-6 text-xl font-medium ${currentTheme.text}`}>
          <span className="animate-pulse">Cargando</span> experiencia visual...
        </p>
      </div>
    )
  }

  // Componente de error
  if (error) {
    return (
      <div className={`flex flex-col justify-center items-center ${currentTheme.text}`} style={{ height }}>
        <div className="bg-red-500/20 backdrop-blur-sm p-6 rounded-lg border border-red-500/30 max-w-md text-center">
          <FiInfo className="mx-auto text-4xl mb-4 text-red-400" />
          <p className="text-xl font-medium mb-3">{error}</p>
          <p className="text-sm opacity-80 mb-4">Verifica la conexión o prueba más tarde</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  
  // Mensaje si no hay imágenes
  if (images.length === 0) {
    return (
      <div className={`flex flex-col justify-center items-center ${currentTheme.text} ${currentTheme.gradient}`} style={{ height }}>
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-medium mb-2">Galería vacía</p>
          <p className="text-sm opacity-70 mb-6">No hay imágenes disponibles para mostrar</p>
          <button className={`px-4 py-2 rounded-lg ${currentTheme.buttonBg} ${currentTheme.buttonText} text-sm font-medium transition-transform hover:scale-105`}>
            Ir a la galería
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={carouselRef}
      className="relative overflow-hidden"
      style={{ height }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fondo del carrusel */}
      <div className={`absolute inset-0 ${currentTheme.gradient} opacity-95`}></div>
      
      {/* Título y subtítulo */}
      {showTitle && (
        <div className="absolute top-0 left-0 right-0 z-20 text-center py-6 pointer-events-none">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-2xl font-bold ${currentTheme.text}`}
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`text-sm mt-1 ${currentTheme.accent}`}
          >
            {subtitle}
          </motion.p>
        </div>
      )}
      
      {/* Contenedor principal del carrusel */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Contenedor del carrusel */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={currentAnimation}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: currentAnimationDuration,
                ease: "easeInOut"
              }}
              className={`absolute ${currentCardStyle.container}`}
              style={{ 
                width: calculatedCardWidth,
                height: cardHeight,
                perspective: 1000 // Para efectos 3D
              }}
            >
              <div className={currentCardStyle.wrapper}>
                {images[currentIndex] && (
                  <>
                    <AdvancedImage 
                      cldImg={images[currentIndex].cldImg}
                      className={currentCardStyle.image}
                      alt={`Imagen ${currentIndex + 1}`}
                      loading="eager"
                    />
                    <div className={currentCardStyle.overlay}></div>
                    
                    {/* Botón de expansión */}
                    {enableLightbox && (
                      <button
                        onClick={() => openLightbox(currentIndex)}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <FiMaximize className="text-white text-lg" />
                      </button>
                    )}
                    
                    {/* Información de la imagen */}
                    <div className={currentCardStyle.caption}>
                      <p className={`font-medium ${currentTheme.highlight}`}>
                        {currentIndex + 1} / {images.length}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          {/* Botón anterior */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.9, x: 0 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            onClick={handlePrevious}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} flex items-center justify-center shadow-lg`}
            aria-label="Imagen anterior"
          >
            <FiArrowLeft className="text-xl" />
          </motion.button>
          
          {/* Botón siguiente */}
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 0.9, x: 0 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            onClick={handleNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} flex items-center justify-center shadow-lg`}
            aria-label="Imagen siguiente"
          >
            <FiArrowRight className="text-xl" />
          </motion.button>
          
          {/* Controles inferiores */}
          <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-6">
            {/* Control de reproducción automática */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              onClick={toggleAutoPlay}
              className={`w-10 h-10 rounded-full ${currentTheme.buttonBg} ${currentTheme.buttonText} flex items-center justify-center shadow-lg`}
              aria-label={isAutoPlaying ? "Pausar reproducción automática" : "Activar reproducción automática"}
            >
              {isAutoPlaying ? <FiPause className="text-lg" /> : <FiPlay className="text-lg" />}
            </motion.button>
            
            {/* Indicadores de diapositivas */}
            {showIndicators && (
              <div className="flex items-center gap-2">
                {images.map((_, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      width: index === currentIndex ? 24 : 8,
                      backgroundColor: index === currentIndex ? currentTheme.indicatorActive : currentTheme.indicatorInactive
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05
                    }}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Overlays para efecto de gradiente */}
      {showGradientOverlay && (
        <>
          <div className="absolute inset-x-0 top-0 h-24 z-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
          <div className="absolute inset-x-0 bottom-0 h-24 z-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-black/50 to-transparent pointer-events-none"></div>
        </>
      )}
      
      {/* Modo Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg"
          >
            <div className="w-full h-full flex flex-col">
              {/* Barra superior del lightbox */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-6 py-4 flex justify-between items-center bg-black/50"
              >
                <span className={`font-medium ${currentTheme.text}`}>
                  {lightboxIndex + 1} / {images.length}
                </span>
                <button
                  onClick={closeLightbox}
                  className="text-white p-2 rounded-full hover:bg-white/10"
                >
                  ✕
                </button>
              </motion.div>
              
              {/* Contenido principal del lightbox */}
              <div className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence initial={false} mode="wait">
                  {images[lightboxIndex] && (
                    <motion.div
                      key={`lightbox-${lightboxIndex}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="relative max-w-full max-h-full"
                    >
                      <AdvancedImage 
                        cldImg={images[lightboxIndex].fullsizeCldImg || images[lightboxIndex].cldImg}
                        className="object-contain max-h-[80vh] max-w-full rounded-lg"
                        alt={`Imagen ${lightboxIndex + 1} en vista ampliada`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Controles de navegación del lightbox */}
              <div className="px-6 py-4 flex justify-between items-center bg-black/50">
                <button
                  onClick={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className={`flex items-center ${currentTheme.buttonBg} ${currentTheme.buttonText} px-4 py-2 rounded-lg`}
                >
                  <FiArrowLeft className="mr-2" /> Anterior
                </button>
                <button
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
                  className={`flex items-center ${currentTheme.buttonBg} ${currentTheme.buttonText} px-4 py-2 rounded-lg`}
                >
                  Siguiente <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

CloudinaryCarousel.propTypes = {
  cloudName: PropTypes.string,
  autoPlaySpeed: PropTypes.number,
  height: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.string),
  showGradientOverlay: PropTypes.bool,
  cardHeight: PropTypes.number,
  cardWidth: PropTypes.number,
  cardGap: PropTypes.number,
  theme: PropTypes.oneOf(['purple', 'blue', 'teal', 'amber']),
  cardStyle: PropTypes.oneOf(['elegant', 'modern', 'classic', 'minimal']),
  showTitle: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  animationMode: PropTypes.oneOf(['slide', 'fade', 'zoom', '3d']),
  enableLightbox: PropTypes.bool,
  autoPlay: PropTypes.bool,
  showIndicators: PropTypes.bool,
  enableKeyboard: PropTypes.bool,
  imageWidth: PropTypes.number
}

export default CloudinaryCarousel