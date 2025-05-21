import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiDollarSign, FiSearch, FiInfo, FiX, FiCheck, FiZoomIn } from 'react-icons/fi';

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
const ImageModal = ({ isOpen, onClose, tematica }) => {
  if (!isOpen || !tematica) return null;
  
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
            {tematica.foto ? (
              <img 
                src={optimizeCloudinaryUrl(tematica.foto, { width: 1200, height: 800, quality: 'auto:best' })}
                alt={tematica.nombre}
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
              <h3 className="text-xl font-bold text-gray-900">{tematica.nombre}</h3>
              {tematica.precio > 0 && (
                <div className="flex items-center gap-1 text-indigo-600 font-medium">
                  <FiDollarSign className="w-4 h-4" />
                  <span>{formatCurrency(tematica.precio)}</span>
                </div>
              )}
            </div>
            
            {tematica.descripcion && (
              <p className="text-gray-700 mt-2">{tematica.descripcion}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeStep = ({ tematicas }) => {
  const { control, watch, formState: { errors } } = useFormContext();
  const selectedThemeId = watch('id_tematica');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingTematica, setViewingTematica] = useState(null);
  const [filteredTematicas, setFilteredTematicas] = useState([]);
  
  // Filtrar temáticas activas
  useEffect(() => {
    const activeTematicas = tematicas.filter(tematica => tematica.activo);
    
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const filtered = activeTematicas.filter(tematica => 
        tematica.nombre.toLowerCase().includes(normalizedQuery) ||
        (tematica.descripcion && tematica.descripcion.toLowerCase().includes(normalizedQuery))
      );
      setFilteredTematicas(filtered);
    } else {
      setFilteredTematicas(activeTematicas);
    }
  }, [tematicas, searchQuery]);

  // Ordenar temáticas (primero las destacadas, luego por nombre)
  const sortedTematicas = [...filteredTematicas].sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return a.nombre.localeCompare(b.nombre);
  });

  // Manejar la apertura de vista detallada
  const handleViewDetails = (tematica) => {
    setViewingTematica(tematica);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Elige tu Temática</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecciona el tema que hará mágico tu evento. Puedes personalizar tu espacio con uno de nuestros diseños de temáticas
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          placeholder="Buscar temáticas por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Grid de Temáticas */}
      <Controller
        control={control}
        name="id_tematica"
        rules={{ required: "Por favor selecciona una temática" }}
        render={({ field }) => (
          <div className="space-y-4">
            {sortedTematicas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedTematicas.map((tematica) => {
                  const isSelected = field.value === tematica.id;
                  
                  return (
                    <motion.div
                      key={tematica.id}
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
                        {/* Imagen de la temática */}
                        <div className="relative group">
                          {tematica.foto ? (
                            <div className="relative overflow-hidden h-48 bg-gray-100">
                              <img
                                src={optimizeCloudinaryUrl(tematica.foto, { width: 500, height: 300 })}
                                alt={tematica.nombre}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(tematica);
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
                          
                          {tematica.destacado && (
                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              Destacado
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <FiCheck className="w-3 h-3" />
                              Seleccionado
                            </div>
                          )}
                        </div>
                        
                        {/* Información de la temática */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{tematica.nombre}</h3>
                            {tematica.precio > 0 && (
                              <div className="flex items-center gap-1 text-indigo-600 font-medium text-sm">
                                <FiDollarSign className="w-4 h-4" />
                                <span>{formatCurrency(tematica.precio)}</span>
                              </div>
                            )}
                          </div>
                          
                          {tematica.descripcion && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {tematica.descripcion}
                            </p>
                          )}
                          
                          <div className="mt-auto pt-4">
                            <button
                              type="button"
                              onClick={() => field.onChange(tematica.id)}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                isSelected
                                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {isSelected ? 'Temática Seleccionada' : 'Seleccionar Temática'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FiInfo className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery
                    ? 'No se encontraron temáticas que coincidan con tu búsqueda'
                    : 'No hay temáticas disponibles en este momento'}
                </p>
                {searchQuery && (
                  <button
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
            
            {errors.id_tematica && (
              <p className="text-red-500 flex items-center gap-1 text-sm mt-2">
                <FiInfo className="w-4 h-4 flex-shrink-0" />
                <span>{errors.id_tematica.message}</span>
              </p>
            )}
          </div>
        )}
      />

      {/* Modal para vista ampliada */}
      <AnimatePresence>
        {viewingTematica && (
          <ImageModal
            isOpen={!!viewingTematica}
            onClose={() => setViewingTematica(null)}
            tematica={viewingTematica}
          />
        )}
      </AnimatePresence>

      {/* Información adicional */}
      <div className="mt-6 bg-indigo-50 p-5 rounded-lg">
        <div className="flex gap-3">
          <FiInfo className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800">Personalización de Temáticas</h4>
            <p className="text-indigo-700 text-sm mt-1">
              La temática define el aspecto visual de tu evento. Algunas temáticas tienen un costo adicional
              por los materiales y decoración especializada que requieren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeStep;