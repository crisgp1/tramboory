import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiImage,
  FiCoffee,
  FiList,
  FiUser,
  FiDollarSign,
  FiShoppingBag,
  FiChevronDown,
  FiChevronUp,
  FiShoppingCart,
  FiAlertTriangle,
  FiTag,
  FiInfo
} from 'react-icons/fi';

const SummarySection = ({ title, children, icon: Icon, visible = true, isExpandable = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!visible) return null;
  
  return (
    <div className="rounded-xl overflow-hidden mb-3 bg-white shadow-sm border border-gray-100 hover:border-indigo-100 transition-all duration-300">
      <div 
        className={`flex items-center justify-between p-3 ${
          isExpandable ? 'cursor-pointer hover:bg-indigo-50 transition-colors duration-200' : ''
        } ${isExpanded ? 'bg-gradient-to-r from-indigo-50 to-white' : 'bg-white'}`}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-indigo-600 w-4 h-4" />}
          <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
        </div>
        
        {isExpandable && (
          <motion.button 
            type="button"
            className="text-gray-500 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-100 transition-colors duration-200"
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {(!isExpandable || isExpanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SummaryItem = ({ label, value, icon: Icon, visible = true, highlight = false }) => {
  if (!visible || !value) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-2 py-1.5 ${highlight ? 'text-indigo-700 font-medium' : 'border-b border-gray-100 last:border-0'}`}
    >
      {Icon && (
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="mt-0.5 flex-shrink-0"
        >
          <Icon className={`w-4 h-4 ${highlight ? 'text-indigo-600' : 'text-indigo-500'}`} />
        </motion.div>
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-gray-600 text-sm ${highlight ? 'font-medium' : ''}`}>{label}:</span>
        <span className={`ml-1 ${highlight ? 'text-indigo-700 font-medium' : 'text-gray-800'} text-sm truncate block sm:inline`}>
          {value}
        </span>
      </div>
    </motion.div>
  );
};

const PriceTag = ({ label, price, highlight = false }) => {
  return (
    <div className={`flex justify-between items-center ${highlight ? 'pt-2 mt-2 border-t border-dashed border-indigo-200' : ''}`}>
      <span className={`text-sm ${highlight ? 'text-indigo-600 font-medium' : 'text-gray-600'} flex items-center gap-1`}>
        {highlight ? <FiTag className="w-3 h-3" /> : null}
        <span>{label}</span>
      </span>
      <span className={`${highlight ? 'text-indigo-600 font-medium' : 'text-gray-700'} text-sm`}>
        {price}
      </span>
    </div>
  );
};

const SummarySidebar = ({
  formValues,
  packages,
  tematicas,
  mamparas,
  foodOptions,
  extras,
  currentStepIndex,
  formatters,
  calculateTotal
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTematica, setSelectedTematica] = useState(null);
  const [selectedMampara, setSelectedMampara] = useState(null);
  const [selectedFoodOption, setSelectedFoodOption] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [total, setTotal] = useState(0);
  
  // Actualizar los valores seleccionados cuando cambia el formulario
  useEffect(() => {
    // Buscar el paquete seleccionado
    if (formValues.id_paquete) {
      const pkg = packages.find(p => p.id === formValues.id_paquete);
      setSelectedPackage(pkg);
    } else {
      setSelectedPackage(null);
    }
    
    // Buscar la temática seleccionada
    if (formValues.id_tematica) {
      const tema = tematicas.find(t => t.id === formValues.id_tematica);
      setSelectedTematica(tema);
    } else {
      setSelectedTematica(null);
    }
    
    // Buscar la mampara seleccionada
    if (formValues.id_mampara) {
      const mampara = mamparas.find(m => m.id === formValues.id_mampara);
      setSelectedMampara(mampara);
    } else {
      setSelectedMampara(null);
    }
    
    // Buscar la opción de alimento seleccionada
    if (formValues.id_opcion_alimento) {
      const food = foodOptions.find(f => f.id === formValues.id_opcion_alimento);
      setSelectedFoodOption(food);
    } else {
      setSelectedFoodOption(null);
    }
    
    // Procesar extras seleccionados
    if (formValues.extras && formValues.extras.length) {
      const extrasWithDetails = formValues.extras.map(selectedExtra => {
        const extraInfo = extras.find(e => e.id === selectedExtra.id);
        return {
          ...extraInfo,
          cantidad: selectedExtra.cantidad
        };
      }).filter(Boolean); // Filtrar valores nulos o undefined
      
      setSelectedExtras(extrasWithDetails);
    } else {
      setSelectedExtras([]);
    }
    
    // Calcular el total
    if (typeof calculateTotal === 'function') {
      setTotal(calculateTotal());
    }
  }, [
    formValues, 
    packages, 
    tematicas, 
    mamparas, 
    foodOptions, 
    extras, 
    calculateTotal
  ]);
  
  // Formatear moneda
  const formatCurrency = formatters?.formatCurrency || (amount => 
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  );
  
  // Formatear fecha
  const formatDate = formatters?.formatDate || (date => {
    if (!date || !(date instanceof Date)) return '';
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  });
  
  // Obtener el horario formateado
  const getFormattedTimeSlot = () => {
    if (!formValues.hora_inicio) return '';
    
    if (typeof formValues.hora_inicio === 'object') {
      return formValues.hora_inicio.label;
    }
    
    return formValues.hora_inicio === 'mañana' 
      ? 'Mañana (11:00 - 16:00)' 
      : 'Tarde (17:00 - 22:00)';
  };
  
  // Verificar si una sección debe estar visible según el paso actual
  const shouldShowSection = (section) => {
    const sections = [
      'package', // Paso 0
      'datetime', // Paso 1
      'theme', // Paso 2
      'mampara', // Paso 3
      'food', // Paso 4
      'extras', // Paso 5
      'celebrant', // Paso 6
    ];
    
    return currentStepIndex >= sections.indexOf(section);
  };
  
  // Obtener el nombre del paso actual
  const getCurrentStepName = () => {
    const steps = [
      'Selección de Paquete',
      'Selección de Fecha y Hora',
      'Selección de Temática',
      'Selección de Mampara',
      'Opciones de Alimentos',
      'Extras',
      'Información del Festejado',
      'Revisión y Confirmación'
    ];
    
    return steps[currentStepIndex] || '';
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div 
        variants={itemVariants}
        className="mb-4 pb-3"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-2 rounded-full shadow-sm">
            <FiShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resumen de tu Reserva</h2>
            <p className="text-sm text-gray-600">
              Paso actual: {getCurrentStepName()}
            </p>
          </div>
        </div>
        
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / 8) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {currentStepIndex >= 0 && (
        <div className="space-y-3">
          {/* Paquete */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Paquete" 
              icon={FiPackage}
              visible={shouldShowSection('package')}
            >
              {selectedPackage ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{selectedPackage.nombre}</span>
                    <span className="text-indigo-600 font-medium">
                      {formatCurrency(formValues.packagePrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    {selectedPackage.min_invitados} - {selectedPackage.max_invitados} invitados
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No seleccionado
                </div>
              )}
            </SummarySection>
          </motion.div>

          {/* Fecha y Hora */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Fecha y Hora" 
              icon={FiCalendar}
              visible={shouldShowSection('datetime')}
            >
              <div className="space-y-2">
                <SummaryItem 
                  label="Fecha" 
                  value={formatDate(formValues.fecha_reserva)}
                  icon={FiCalendar}
                  visible={!!formValues.fecha_reserva}
                />
                <SummaryItem 
                  label="Horario" 
                  value={getFormattedTimeSlot()}
                  icon={FiClock}
                  visible={!!formValues.hora_inicio}
                />
                
                {formValues.tuesdayFee > 0 && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-amber-200 bg-amber-50 p-2 rounded-lg">
                    <span className="text-amber-600 text-xs flex items-center gap-1">
                      <FiAlertTriangle className="w-3 h-3" />
                      <span>Cargo adicional por martes</span>
                    </span>
                    <span className="text-amber-600 font-medium text-xs">
                      {formatCurrency(formValues.tuesdayFee)}
                    </span>
                  </div>
                )}
              </div>
            </SummarySection>
          </motion.div>

          {/* Temática */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Temática" 
              icon={FiImage}
              visible={shouldShowSection('theme')}
            >
              {selectedTematica ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{selectedTematica.nombre}</span>
                    {selectedTematica.precio > 0 && (
                      <span className="text-indigo-600 font-medium">
                        {formatCurrency(selectedTematica.precio)}
                      </span>
                    )}
                  </div>
                  {selectedTematica.descripcion && (
                    <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                      {selectedTematica.descripcion}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No seleccionada
                </div>
              )}
            </SummarySection>
          </motion.div>

          {/* Mampara */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Mampara" 
              icon={FiImage}
              visible={shouldShowSection('mampara')}
            >
              {selectedMampara ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      Mampara de {selectedMampara.piezas} piezas
                    </span>
                    <span className="text-indigo-600 font-medium">
                      {formatCurrency(selectedMampara.precio)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No seleccionada (opcional)
                </div>
              )}
            </SummarySection>
          </motion.div>

          {/* Opción de Alimento */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Opción de Alimentos" 
              icon={FiCoffee}
              visible={shouldShowSection('food')}
            >
              {selectedFoodOption ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{selectedFoodOption.nombre}</span>
                    <span className="text-indigo-600 font-medium">
                      {formatCurrency(selectedFoodOption.precio_extra)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No seleccionada (opcional)
                </div>
              )}
            </SummarySection>
          </motion.div>

          {/* Extras */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title={`Extras${selectedExtras.length > 0 ? ` (${selectedExtras.length})` : ''}`}
              icon={FiList}
              visible={shouldShowSection('extras')}
              isExpandable={selectedExtras.length > 2}
            >
              {selectedExtras.length > 0 ? (
                <div className="space-y-3">
                  {selectedExtras.map((extra, index) => {
                    const cantidad = parseInt(extra.cantidad) || 1;
                    const extraPrice = (parseFloat(extra.precio) || 0) * cantidad;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="flex justify-between items-center text-sm rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-1">
                          <FiShoppingBag className="w-3 h-3 text-indigo-500" />
                          <span className="font-medium text-gray-800">{extra.nombre}</span>
                          {cantidad > 1 && (
                            <span className="text-xs ml-1 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                              x{cantidad}
                            </span>
                          )}
                        </div>
                        <span className="text-indigo-600 font-medium">
                          {formatCurrency(extraPrice)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No seleccionados (opcional)
                </div>
              )}
            </SummarySection>
          </motion.div>

          {/* Información del Festejado */}
          <motion.div variants={itemVariants}>
            <SummarySection 
              title="Información del Festejado" 
              icon={FiUser}
              visible={shouldShowSection('celebrant')}
            >
              {formValues.nombre_festejado || formValues.edad_festejado ? (
                <div className="space-y-2">
                  <SummaryItem 
                    label="Nombre" 
                    value={formValues.nombre_festejado}
                    icon={FiUser}
                    visible={!!formValues.nombre_festejado}
                  />
                  <SummaryItem 
                    label="Edad" 
                    value={formValues.edad_festejado}
                    icon={FiCalendar}
                    visible={!!formValues.edad_festejado}
                  />
                  <SummaryItem 
                    label="Sexo" 
                    value={formValues.sexo_festejado === 'femenino' ? 'Niña' : formValues.sexo_festejado === 'masculino' ? 'Niño' : ''}
                    icon={FiUser}
                    visible={!!formValues.sexo_festejado}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded-lg">
                  No ingresado
                </div>
              )}
            </SummarySection>
          </motion.div>
        </div>
      )}

      {/* Total */}
      <motion.div 
        variants={itemVariants}
        className="mt-6 pt-4 rounded-xl bg-gradient-to-br from-indigo-50 via-indigo-50 to-white p-4 shadow-sm border border-indigo-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-1.5 rounded-full shadow-sm">
              <FiShoppingCart className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-800">Resumen de Costos</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          {selectedPackage && (
            <PriceTag 
              label="Paquete" 
              price={formatCurrency(formValues.packagePrice)} 
            />
          )}
          
          {selectedTematica && selectedTematica.precio > 0 && (
            <PriceTag 
              label="Temática" 
              price={formatCurrency(selectedTematica.precio)} 
            />
          )}
          
          {selectedMampara && (
            <PriceTag 
              label="Mampara" 
              price={formatCurrency(selectedMampara.precio)} 
            />
          )}
          
          {selectedFoodOption && selectedFoodOption.precio_extra > 0 && (
            <PriceTag 
              label="Opción de alimentos" 
              price={formatCurrency(selectedFoodOption.precio_extra)} 
            />
          )}
          
          {selectedExtras.length > 0 && (
            <PriceTag 
              label={`Extras (${selectedExtras.length})`}
              price={formatCurrency(
                selectedExtras.reduce((sum, extra) => {
                  const cantidad = parseInt(extra.cantidad) || 1;
                  return sum + (parseFloat(extra.precio) || 0) * cantidad;
                }, 0)
              )} 
            />
          )}
          
          {formValues.tuesdayFee > 0 && (
            <PriceTag 
              label="Cargo por martes" 
              price={formatCurrency(formValues.tuesdayFee)}
              highlight={true}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-indigo-200">
          <span className="font-bold text-gray-800">Total:</span>
          <span className="text-xl font-bold text-indigo-700">
            {formatCurrency(total)}
          </span>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          El precio incluye todos los elementos seleccionados.
          {formValues.tuesdayFee > 0 && ' Incluye cargo adicional por martes.'}
        </p>
      </motion.div>

      {/* Información adicional */}
      <motion.div 
        variants={itemVariants}
        className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <FiInfo className="w-4 h-4 flex-shrink-0 text-blue-600" />
          <p className="text-xs text-blue-700">
            Puedes personalizar tu evento en cualquier momento del proceso de reserva.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SummarySidebar;