import React, { useState, useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiImage,
  FiList,
  FiInfo,
  FiX,
  FiMaximize,
  FiZoomIn,
  FiArrowLeft,
  FiArrowRight
} from 'react-icons/fi';
import SummaryItem from './SummaryItem';
import { formatCurrency } from './reservationform/styles';

const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00'
  }
};

// Función para optimizar URL de Cloudinary
const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width = 600, height = 400, quality = 'auto' } = options;
  
  try {
    // Extraer la URL base y las transformaciones
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Encontrar el índice donde empiezan los segmentos de imagen (después de upload)
    let uploadIndex = pathSegments.findIndex(segment => segment === 'upload');
    
    if (uploadIndex !== -1) {
      // Crear nuevas transformaciones
      const transformations = `c_fill,g_auto,f_auto,q_${quality},w_${width},h_${height}`;
      
      // Insertar transformaciones justo después de 'upload'
      pathSegments.splice(uploadIndex + 1, 0, transformations);
      
      // Reconstruir la URL
      urlObj.pathname = pathSegments.join('/');
      return urlObj.toString();
    }
    
    return url;
  } catch (error) {
    console.error('Error optimizando URL de Cloudinary:', error);
    return url;
  }
};

// Componente para el lightbox de la imagen
const ImageLightbox = ({ isOpen, onClose, imageUrl, alt, images, currentIndex, setCurrentIndex }) => {
  if (!isOpen) return null;
  
  const [touchStartX, setTouchStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Handler para detectar clics en el fondo
  const handleBackdropClick = (e) => {
    // Cerrar el lightbox al hacer clic en cualquier parte
    onClose();
  };

  // Handler para evitar que los clics en la imagen cierren el lightbox
  const handleImageClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague al fondo
  };
  
  // Handlers para eventos táctiles
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || !images || images.length <= 1) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchStartX - touchCurrentX;
    
    // Determinar dirección del swipe
    if (Math.abs(diff) > 50) { // Umbral de swipe
      if (diff > 0) {
        // Swipe izquierda (siguiente)
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe derecha (anterior)
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      setIsSwiping(false);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
  };
  
  const handleKeyDown = (e) => {
    if (images && images.length > 1) {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }
    
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Escuchar eventos de teclado
  useEffect(() => {
    const handleKeyboardEvents = (e) => {
      if (images && images.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        } else if (e.key === 'ArrowRight') {
          setCurrentIndex((prev) => (prev + 1) % images.length);
        }
      }
      
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyboardEvents);
      return () => window.removeEventListener('keydown', handleKeyboardEvents);
    }
  }, [isOpen, images, setCurrentIndex, onClose]);
  
  // Optimizar imagen para vista completa
  const optimizedImageUrl = imageUrl 
    ? optimizeCloudinaryUrl(imageUrl, { width: 1200, height: 900, quality: 'auto:best' })
    : imageUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick} // Cerrar al hacer clic en cualquier parte
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Barra superior con botón de cierre e indicador */}
        <div className="flex justify-between items-center p-4">
          {images && images.length > 1 && (
            <span className="text-white/80 text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          <button 
            onClick={onClose}
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Contenedor de la imagen - evita que los clics en la imagen cierren el lightbox */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img 
            src={optimizedImageUrl}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={handleImageClick}
          />
        </div>
        
        {/* Controles de navegación para múltiples imágenes */}
        {images && images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="bg-black/50 text-white p-3 rounded-full hover:bg-indigo-600/80 transition-colors"
              aria-label="Imagen anterior"
            >
              <FiArrowLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="bg-black/50 text-white p-3 rounded-full hover:bg-indigo-600/80 transition-colors"
              aria-label="Imagen siguiente"
            >
              <FiArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReservationSummary = ({
  control,
  packages,
  foodOptions,
  tematicas,
  mamparas,
  extras
}) => {
  const watchedFields = useWatch({ control });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxType, setLightboxType] = useState(''); // 'tematica' or 'mampara'
  const [tematicaImageError, setTematicaImageError] = useState(false);
  const [mamparaImageError, setMamparaImageError] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Configurar lightbox para temática o mampara
  const openLightbox = (type) => {
    if (type === 'tematica') {
      if (selectedTematica?.foto && !tematicaImageError) {
        setLightboxType('tematica');
        setLightboxImages([{ url: selectedTematica.foto, alt: selectedTematica.nombre }]);
        setLightboxIndex(0);
        setLightboxOpen(true);
      }
    } else if (type === 'mampara') {
      if (selectedMampara?.foto && !mamparaImageError) {
        setLightboxType('mampara');
        setLightboxImages([{ url: selectedMampara.foto, alt: `Mampara de ${selectedMampara.piezas} piezas` }]);
        setLightboxIndex(0);
        setLightboxOpen(true);
      }
    }
  };

  const formatDate = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'No seleccionada';
      }
  
      const formattedDate = new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
  
      return formattedDate;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  // Resetear los errores de imagen cuando cambian las selecciones
  useEffect(() => {
    setTematicaImageError(false);
  }, [watchedFields.id_tematica]);
  
  useEffect(() => {
    setMamparaImageError(false);
  }, [watchedFields.id_mampara]);
  // Datos seleccionados
  const selectedPackage = packages.find(pkg => pkg.id === watchedFields.id_paquete);
  const selectedFoodOption = foodOptions.find(food => food.id === watchedFields.id_opcion_alimento);
  const selectedTematica = tematicas.find(tema => tema.id === watchedFields.id_tematica);
  const selectedMampara = mamparas.find(mampara => mampara.id === watchedFields.id_mampara);
  const tuesdayFee = watchedFields.tuesdayFee || 0;
  // Determinar tamaños óptimos para imágenes según viewport
  const getImageDimensions = () => {
    // Para móviles
    if (viewportWidth < 640) {
      return { width: 300, height: 180 };
    }
    // Para tablets
    else if (viewportWidth < 1024) {
      return { width: 400, height: 240 };
    }
    // Para desktop
    else {
      return { width: 500, height: 300 };
    }
  };
  
  const dimensions = getImageDimensions();
  
  // Cálculo del precio del paquete según el día
  const calculatePackagePrice = () => {
    if (!selectedPackage || !watchedFields.fecha_reserva || !(watchedFields.fecha_reserva instanceof Date)) return 0;
    const dayOfWeek = watchedFields.fecha_reserva.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4
      ? parseFloat(selectedPackage.precio_lunes_jueves) || 0
      : parseFloat(selectedPackage.precio_viernes_domingo) || 0;
  };
  // Cálculo del precio de los extras
  const calculateExtrasPrice = () => {
    if (!watchedFields.extras || !Array.isArray(watchedFields.extras)) return 0;
    
    return watchedFields.extras.reduce((total, extra) => {
      const extraInfo = extras.find(e => e.id === extra.id);
      if (extraInfo && extra.cantidad && extra.cantidad > 0) {
        return total + (parseFloat(extraInfo.precio) || 0) * parseInt(extra.cantidad);
      }
      return total;
    }, 0);
  };
  // Descripción de extras seleccionados
  const getExtrasDescription = () => {
    if (!watchedFields.extras || !Array.isArray(watchedFields.extras) || watchedFields.extras.length === 0) {
      return 'No seleccionados';
    }
    const selectedExtrasWithInfo = watchedFields.extras
      .map(extra => {
        const extraInfo = extras.find(e => e.id === extra.id);
        if (!extraInfo || !extra.cantidad || extra.cantidad < 1) return null;
        
        const cantidad = parseInt(extra.cantidad);
        const extraPrice = (parseFloat(extraInfo.precio) || 0) * cantidad;
        
        return {
          nombre: extraInfo.nombre,
          cantidad,
          precio: extraPrice
        };
      })
      .filter(Boolean);
    if (selectedExtrasWithInfo.length === 0) {
      return 'No seleccionados';
    }

    return selectedExtrasWithInfo
      .map(extra => `${extra.nombre} (x${extra.cantidad}) - ${formatCurrency(extra.precio)}`)
      .join('\n');
  };

  // Obtener el tipo de día (L-J o V-D)
  const getDayType = () => {
    if (!watchedFields.fecha_reserva || !(watchedFields.fecha_reserva instanceof Date)) return '';
    const dayOfWeek = watchedFields.fecha_reserva.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4 ? 'L-J' : 'V-D';
  };

  // Cálculo del total
  const calculateTotal = () => {
    let total = calculatePackagePrice();

    if (selectedFoodOption) {
      total += parseFloat(selectedFoodOption.precio_extra) || 0;
    }

    if (selectedMampara) {
      total += parseFloat(selectedMampara.precio) || 0;
    }

    total += parseFloat(tuesdayFee) || 0;
    total += calculateExtrasPrice();

    return total;
  };

  // Información detallada del paquete
  const getPackageInfo = () => {
    if (!selectedPackage) return 'No seleccionado';
    const packagePrice = calculatePackagePrice();
    const dayType = getDayType();
    return `${selectedPackage.nombre}\n${formatCurrency(packagePrice)} (Precio ${dayType})`;
  };

  // Obtener el horario formateado
  const getFormattedTimeSlot = () => {
    if (!watchedFields.hora_inicio) return 'No seleccionada';
    
    const timeSlot = watchedFields.hora_inicio.value === 'mañana' ? TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;
    return timeSlot.label;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-700 flex items-center gap-2">
        <FiInfo className="w-6 h-6" />
        Resumen de tu Reserva
      </h2>

      <div className="space-y-4">
        {/* Información del Paquete */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <SummaryItem
            icon={<FiPackage className="text-blue-600" />}
            label="Paquete"
            value={getPackageInfo()}
            className="font-medium"
          />
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryItem
            icon={<FiCalendar />}
            label="Fecha"
            value={formatDate(watchedFields.fecha_reserva)}
          />
          <SummaryItem
            icon={<FiClock />}
            label="Hora"
            value={getFormattedTimeSlot()}
          />
        </div>

        {/* Información del Festejado */}
        <div className="bg-purple-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiUser className="text-purple-600" />}
            label="Nombre del Festejado"
            value={watchedFields.nombre_festejado || 'No proporcionado'}
          />
          <SummaryItem
            icon={<FiUser className="text-purple-600" />}
            label="Edad del Festejado"
            value={watchedFields.edad_festejado || 'No proporcionada'}
          />
        </div>

        {/* Opciones Seleccionadas */}
        <div className="bg-green-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiDollarSign className="text-green-600" />}
            label="Opción de Alimento"
            value={selectedFoodOption ? 
              `${selectedFoodOption.nombre} - ${formatCurrency(selectedFoodOption.precio_extra)}` : 
              'No seleccionada'}
          />
          
          {/* Temática con imagen */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <FiImage className="text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">Temática:</span>
            </div>
            <div className="ml-7">
              <div className="font-medium">{selectedTematica?.nombre || 'No seleccionada'}</div>
              
              {selectedTematica?.foto && !tematicaImageError ? (
                <div className="mt-2 relative">
                  <div className="relative overflow-hidden rounded-lg group">
                    <img
                      src={optimizeCloudinaryUrl(selectedTematica.foto, dimensions)}
                      alt={selectedTematica.nombre}
                      className="w-full rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-cover"
                      style={{ 
                        maxHeight: dimensions.height, 
                        height: dimensions.height,
                        objectFit: 'cover' 
                      }}
                      loading="lazy"
                      onError={() => setTematicaImageError(true)}
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer touch-action-manipulation"
                      onClick={() => openLightbox('tematica')}
                    >
                      <div className="p-2 bg-white bg-opacity-80 rounded-full">
                        <FiZoomIn size={24} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-indigo-50 transition-colors"
                    onClick={() => openLightbox('tematica')}
                    aria-label="Ver imagen ampliada"
                  >
                    <FiMaximize size={20} className="text-indigo-600" />
                  </button>
                </div>
              ) : selectedTematica?.foto ? (
                <div className="mt-2 text-red-500 text-xs flex items-center">
                  <FiX className="mr-1" size={14} />
                  Error al cargar la imagen
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Mampara con imagen */}
          {selectedMampara && (
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center">
                <FiImage className="text-green-600 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">Mampara:</span>
              </div>
              <div className="ml-7">
                <div className="font-medium">
                  {selectedMampara.piezas} piezas - {formatCurrency(selectedMampara.precio)}
                </div>
                
                {selectedMampara?.foto && !mamparaImageError ? (
                  <div className="mt-2 relative">
                    <div className="relative overflow-hidden rounded-lg group">
                      <img
                        src={optimizeCloudinaryUrl(selectedMampara.foto, dimensions)}
                        alt={`Mampara de ${selectedMampara.piezas} piezas`}
                        className="w-full rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-cover"
                        style={{ 
                          maxHeight: dimensions.height, 
                          height: dimensions.height,
                          objectFit: 'cover' 
                        }}
                        loading="lazy"
                        onError={() => setMamparaImageError(true)}
                      />
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer touch-action-manipulation"
                        onClick={() => openLightbox('mampara')}
                      >
                        <div className="p-2 bg-white bg-opacity-80 rounded-full">
                          <FiZoomIn size={24} className="text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-indigo-50 transition-colors"
                      onClick={() => openLightbox('mampara')}
                      aria-label="Ver imagen ampliada"
                    >
                      <FiMaximize size={20} className="text-indigo-600" />
                    </button>
                  </div>
                ) : selectedMampara?.foto ? (
                  <div className="mt-2 text-red-500 text-xs flex items-center">
                    <FiX className="mr-1" size={14} />
                    Error al cargar la imagen
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Extras y Cargos Adicionales */}
        <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiList className="text-yellow-600" />}
            label="Extras Seleccionados"
            value={getExtrasDescription()}
          />
          {tuesdayFee > 0 && (
            <SummaryItem
              icon={<FiDollarSign className="text-yellow-600" />}
              label="Cargo por Martes"
              value={formatCurrency(tuesdayFee)}
            />
          )}
        </div>

        {/* Total */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <SummaryItem
            icon={<FiDollarSign className="text-indigo-600 w-6 h-6" />}
            label="Total Estimado"
            value={formatCurrency(calculateTotal())}
            className="text-lg font-bold"
          />
        </div>
      </div>
      
      {/* Lightbox unificado para imágenes */}
      <ImageLightbox 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxImages[lightboxIndex]?.url || ''}
        alt={lightboxImages[lightboxIndex]?.alt || 'Imagen de reserva'}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        setCurrentIndex={setLightboxIndex}
      />
    </div>
  );
};

export default ReservationSummary;