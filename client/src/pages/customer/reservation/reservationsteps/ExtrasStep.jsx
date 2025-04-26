import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart,
  FiDollarSign,
  FiPlus,
  FiMinus,
  FiCheck,
  FiInfo,
  FiFilter,
  FiSearch,
  FiX
} from 'react-icons/fi';

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

// Categorías para filtrar extras
const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'food', label: 'Alimentos' },
  { id: 'decoration', label: 'Decoración' },
  { id: 'entertainment', label: 'Entretenimiento' },
  { id: 'services', label: 'Servicios' }
];

const ExtrasStep = ({ extras = [] }) => {
  const { control, setValue } = useFormContext();
  const selectedExtras = useWatch({
    control,
    name: 'extras',
    defaultValue: []
  });

  // Estados para búsqueda y filtrado
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredExtras, setFilteredExtras] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Función para procesar y eliminar duplicados de extras
  const processExtras = (selectedItems) => {
    if (!selectedItems) return [];
    
    // Crear un mapa con ID como clave para eliminar duplicados
    const uniqueExtras = selectedItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    
    return Object.values(uniqueExtras);
  };

  // Efecto para procesar extras y eliminar duplicados al inicializar
  useEffect(() => {
    if (selectedExtras && selectedExtras.length > 0) {
      const processedExtras = processExtras(selectedExtras);
      if (JSON.stringify(processedExtras) !== JSON.stringify(selectedExtras)) {
        setValue('extras', processedExtras);
      }
    }
  }, []);

  // Filtrar extras activos, por categoría y por búsqueda
  useEffect(() => {
    // Verificar que extras sea un array válido
    if (!Array.isArray(extras) || extras.length === 0) {
      setFilteredExtras([]);
      return;
    }
    
    let filtered = extras.filter(extra => extra.activo);
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(extra => extra.categoria === selectedCategory);
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(extra =>
        extra.nombre.toLowerCase().includes(query) ||
        (extra.descripcion && extra.descripcion.toLowerCase().includes(query))
      );
    }
    
    // Ordenar por categoría y nombre
    filtered.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.nombre.localeCompare(b.nombre);
    });
    
    setFilteredExtras(filtered);
  }, [extras, selectedCategory, searchQuery]);

  // Calcular el total de extras seleccionados
  const calculateExtrasTotal = () => {
    if (!selectedExtras?.length) return 0;
    
    return selectedExtras.reduce((total, extra) => {
      const extraInfo = extras.find(e => e.id === extra.id);
      if (extraInfo?.precio && extra.cantidad) {
        return total + (parseFloat(extraInfo.precio) * parseInt(extra.cantidad));
      }
      return total;
    }, 0);
  };

  // Manejar la activación/desactivación de un extra
  const handleExtraToggle = (extra) => {
    const currentExtras = selectedExtras || [];
    const existingIndex = currentExtras.findIndex((item) => item.id === extra.id);
    
    if (existingIndex === -1) {
      // Añadir extra con cantidad 1
      setValue('extras', [...currentExtras, { 
        id: extra.id, 
        cantidad: 1,
        nombre: extra.nombre,
        precio: extra.precio
      }]);
    } else {
      // Eliminar extra
      setValue('extras', currentExtras.filter((_, index) => index !== existingIndex));
    }
  };

  // Manejar cambio de cantidad de un extra
  const handleQuantityChange = (extraId, newQuantity) => {
    const currentExtras = selectedExtras || [];
    const existingIndex = currentExtras.findIndex((item) => item.id === extraId);
    
    if (newQuantity < 1) {
      // Eliminar extra si la cantidad es menor a 1
      setValue('extras', currentExtras.filter((_, index) => index !== existingIndex));
    } else {
      // Actualizar cantidad
      const updatedExtras = [...currentExtras];
      updatedExtras[existingIndex] = { 
        ...updatedExtras[existingIndex], 
        cantidad: newQuantity 
      };
      setValue('extras', updatedExtras);
    }
  };

  // Renderizar controles de cantidad
  const renderQuantityControls = (extraId, cantidad) => (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleQuantityChange(extraId, cantidad - 1);
        }}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Disminuir cantidad"
      >
        <FiMinus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={cantidad}
        min="1"
        onChange={(e) => {
          e.stopPropagation();
          handleQuantityChange(extraId, parseInt(e.target.value) || 1);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-14 text-center border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        aria-label="Cantidad"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleQuantityChange(extraId, cantidad + 1);
        }}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Aumentar cantidad"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  );

  // Contar extras seleccionados
  const selectedCount = selectedExtras?.length || 0;

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-indigo-900 mb-3 leading-tight">Personaliza tu Evento con Extras</h2>
        <p className="text-indigo-600 max-w-2xl mx-auto opacity-80">
          Añade elementos adicionales para hacer tu celebración aún más especial. Selecciona tantos como desees.
        </p>
      </div>

      {/* Panel de búsqueda y filtros */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar extras..."
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

          {/* Botón de filtros en móvil */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
              <span>Filtrar por categoría</span>
              {selectedCategory !== 'all' && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Filtros desktop */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-500 text-sm">Filtrar:</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`py-1 px-3 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros móvil expandibles */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`py-1 px-3 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contador de seleccionados */}
      {selectedCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-md">
                <FiShoppingCart className="text-indigo-600 w-5 h-5" />
              </div>
              <span className="font-semibold text-indigo-800 text-lg">
                {selectedCount} extra{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="bg-indigo-100 px-4 py-2 rounded-lg text-indigo-700 font-semibold">
              Total: {formatCurrency(calculateExtrasTotal())}
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid de Extras */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {filteredExtras.length > 0 ? (
          filteredExtras.map((extra) => {
            const existingExtra = selectedExtras?.find((item) => item.id === extra.id);
            const isSelected = !!existingExtra;

            return (
              <motion.div
                key={extra.id}
                variants={itemVariants}
                onClick={() => handleExtraToggle(extra)}
                className={`group p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {extra.nombre}
                      </h4>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                          <FiCheck className="w-3 h-3" />
                          Seleccionado
                        </span>
                      )}
                    </div>
                    {extra.descripcion && (
                      <p className={`text-sm mt-1 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {extra.descripcion}
                      </p>
                    )}
                    
                    {extra.categoria && (
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                          {extra.categoria}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExtraToggle(extra);
                    }}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    aria-label={isSelected ? 'Remover extra' : 'Agregar extra'}
                  >
                    {isSelected ? <FiMinus /> : <FiPlus />}
                  </button>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className={`${isSelected ? 'text-indigo-600' : 'text-gray-600'} w-4 h-4`} />
                    <span className={`text-lg font-semibold ${isSelected ? 'text-indigo-600' : 'text-gray-800'}`}>
                      {formatCurrency(extra.precio)}
                    </span>
                    <span className="text-sm text-gray-500">por unidad</span>
                  </div>

                  {isSelected && renderQuantityControls(
                    extra.id, 
                    existingExtra.cantidad || 1
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FiInfo className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all'
                ? 'No se encontraron extras que coincidan con tu búsqueda o filtro'
                : 'No hay extras disponibles en este momento'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Información adicional */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm"
      >
        <div className="flex gap-4">
          <FiInfo className="w-7 h-7 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-indigo-900 text-lg">Información sobre extras</h4>
            <p className="text-indigo-700 mt-2">
              Los extras son completamente opcionales y tienen un costo adicional que se sumará al total de tu reserva.
              Puedes seleccionar múltiples extras y especificar la cantidad deseada de cada uno.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExtrasStep;