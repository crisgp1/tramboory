import React, { useState, useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiDollarSign, FiInfo, FiX, FiCheck, FiZoomIn, FiFilter } from 'react-icons/fi';

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

// Optimizador de URL de Cloudinary
const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width = 400, height = 300, quality = 'auto' } = options;
  
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

// Componente modal para vista ampliada de imagen
const ImageModal = ({ isOpen, onClose, mampara }) => {
  if (!isOpen || !mampara) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300">
      <div className="relative w-full max-w-3xl p-4">
        {/* Botón para cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white text-gray-800 hover:bg-gray-200 transition-colors z-10"
          aria-label="Cerrar"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl animate-scaleIn">
          {/* Imagen */}
          <div className="relative">
            {mampara.foto ? (
              <img 
                src={optimizeCloudinaryUrl(mampara.foto, { width: 1200, height: 800, quality: 'auto:best' })}
                alt={`Mampara de ${mampara.piezas} piezas`}
                className="w-full object-cover"
                style={{ maxHeight: 'calc(80vh - 120px)' }}
              />
            ) : (
              <div className="bg-gray-200 w-full h-64 flex items-center justify-center">
                <FiImage className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Información */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Mampara de {mampara.piezas} piezas</h3>
              <div className="flex items-center gap-1 text-indigo-600 font-medium">
                <FiDollarSign className="w-4 h-4" />
                <span>{formatCurrency(mampara.precio)}</span>
              </div>
            </div>
            
            {mampara.descripcion && (
              <p className="text-gray-700 mt-2">{mampara.descripcion}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MamparaStep = ({ mamparas, tematicas }) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const selectedMamparaId = watch('id_mampara');
  const selectedThemeId = watch('id_tematica');
  const [viewingMampara, setViewingMampara] = useState(null);
  const [filteredMamparas, setFilteredMamparas] = useState([]);
  const [showNoThemeWarning, setShowNoThemeWarning] = useState(false);
  
  // Obtener el nombre de la temática seleccionada
  const selectedThemeName = tematicas.find(t => t.id === selectedThemeId)?.nombre || '';
  
  // Filtrar mamparas por la temática seleccionada
  useEffect(() => {
    if (selectedThemeId) {
      setShowNoThemeWarning(false);
      const filtered = mamparas.filter(mampara => 
        mampara.activo && mampara.id_tematica === selectedThemeId
      );
      setFilteredMamparas(filtered);
      
      // Si hay una mampara seleccionada que ya no está en las filtradas, limpiar la selección
      if (selectedMamparaId && !filtered.some(m => m.id === selectedMamparaId)) {
        setValue('id_mampara', null);
      }
    } else {
      setShowNoThemeWarning(true);
      setFilteredMamparas([]);
    }
  }, [mamparas, selectedThemeId, selectedMamparaId, setValue]);

  // Manejar la apertura de vista detallada
  const handleViewDetails = (mampara) => {
    setViewingMampara(mampara);
  };

  // Poder omitir la selección de mampara (es opcional)
  const handleSkip = () => {
    setValue('id_mampara', null);
    // Avanzar al siguiente paso (lo maneja el contenedor)
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Elige tu Mampara</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecciona la mampara que complementará la decoración de tu evento
          {selectedThemeName && (
            <span className="font-medium text-indigo-600"> con la temática de {selectedThemeName}</span>
          )}
        </p>
      </div>

      {/* Alerta si no se ha seleccionado una temática */}
      {showNoThemeWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <div className="flex gap-3">
            <FiInfo className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Selecciona una temática primero</h4>
              <p className="text-amber-700 text-sm mt-1">
                Debes seleccionar una temática en el paso anterior para ver las mamparas disponibles. 
                Las mamparas están relacionadas con cada temática específica.
              </p>
              <button
                type="button"
                onClick={() => {
                  // Regresar al paso de temáticas se maneja desde el componente padre
                }}
                className="mt-3 text-amber-700 font-medium underline hover:text-amber-800"
              >
                Volver al paso de selección de temática
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Mamparas */}
      <Controller
        control={control}
        name="id_mampara"
        render={({ field }) => (
          <div className="space-y-4">
            {filteredMamparas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMamparas.map((mampara) => {
                  const isSelected = field.value === mampara.id;
                  
                  return (
                    <motion.div
                      key={mampara.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                        isSelected
                          ? 'ring-4 ring-indigo-500 transform scale-[1.02]'
                          : 'hover:shadow-xl'
                      }`}
                    >
                      <div className={`border h-full flex flex-col rounded-xl overflow-hidden ${
                        isSelected ? 'border-indigo-500' : 'border-gray-200'
                      }`}>
                        {/* Imagen de la mampara */}
                        <div className="relative group">
                          {mampara.foto ? (
                            <div className="relative overflow-hidden h-48 bg-gray-100">
                              <img
                                src={optimizeCloudinaryUrl(mampara.foto, { width: 500, height: 300 })}
                                alt={`Mampara de ${mampara.piezas} piezas`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(mampara);
                                    }}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-indigo-100"
                                    aria-label="Ver imagen ampliada"
                                  >
                                    <FiZoomIn className="w-5 h-5 text-indigo-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-200 flex items-center justify-center">
                              <FiImage className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <FiCheck className="w-3 h-3" />
                              Seleccionada
                            </div>
                          )}
                        </div>
                        
                        {/* Información de la mampara */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{mampara.piezas} Piezas</h3>
                            <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm">
                              <FiDollarSign className="w-4 h-4" />
                              <span>{formatCurrency(mampara.precio)}</span>
                            </div>
                          </div>
                          
                          {mampara.descripcion && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {mampara.descripcion}
                            </p>
                          )}
                          
                          <div className="mt-auto pt-4">
                            <button
                              type="button"
                              onClick={() => field.onChange(mampara.id)}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                isSelected
                                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {isSelected ? 'Mampara Seleccionada' : 'Seleccionar Mampara'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : selectedThemeId ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FiInfo className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No hay mamparas disponibles para la temática seleccionada
                </p>
              </div>
            ) : null}
          </div>
        )}
      />

      {/* Modal para vista ampliada */}
      <AnimatePresence>
        {viewingMampara && (
          <ImageModal
            isOpen={!!viewingMampara}
            onClose={() => setViewingMampara(null)}
            mampara={viewingMampara}
          />
        )}
      </AnimatePresence>

      {/* Opción para omitir */}
      {filteredMamparas.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 font-medium underline"
          >
            Continuar sin seleccionar mampara
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-indigo-50 p-5 rounded-lg">
        <div className="flex gap-3">
          <FiInfo className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800">¿Qué es una mampara?</h4>
            <p className="text-indigo-700 text-sm mt-1">
              Las mamparas son paneles decorativos para personalizar el fondo del espacio de tu evento.
              Cada mampara está diseñada para complementar una temática específica y tiene un costo adicional.
              La selección de mampara es opcional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MamparaStep;