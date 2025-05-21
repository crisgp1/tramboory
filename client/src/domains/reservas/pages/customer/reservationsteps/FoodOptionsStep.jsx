import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FiCoffee,
  FiDollarSign,
  FiCheck,
  FiInfo,
  FiShoppingBag,
  FiUsers,
  FiPlus,
  FiMinus
} from 'react-icons/fi';

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

const FoodOptionsStep = ({ foodOptions }) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const selectedFoodOptionId = watch('id_opcion_alimento');
  const [activeFoodOptions, setActiveFoodOptions] = useState([]);
  
  // Filtrar opciones activas
  useEffect(() => {
    const active = foodOptions.filter(option => option.activo);
    // Ordenar por precio ascendente
    const sorted = [...active].sort((a, b) => parseFloat(a.precio_extra) - parseFloat(b.precio_extra));
    setActiveFoodOptions(sorted);
  }, [foodOptions]);

  // Poder omitir la selección (es opcional)
  const handleSkip = () => {
    setValue('id_opcion_alimento', null);
    // Avanzar al siguiente paso (lo maneja el componente padre)
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Opciones de Alimentos</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecciona una opción de alimentos para complementar tu evento. Puedes personalizar la experiencia culinaria de tus invitados.
        </p>
      </div>

      {/* Grid de opciones de alimentos */}
      <Controller
        control={control}
        name="id_opcion_alimento"
        render={({ field }) => (
          <div className="space-y-6">
            {activeFoodOptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeFoodOptions.map((option) => {
                  const isSelected = field.value === option.id;
                  
                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => field.onChange(isSelected ? null : option.id)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <div className="p-6">
                        {/* Encabezado */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${
                              isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <FiCoffee className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                                {option.nombre}
                              </h3>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <div className="ml-auto flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full">
                              <FiCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        
                        {/* Precio */}
                        <div className="flex items-center gap-2 mb-4">
                          <FiDollarSign className="text-indigo-600 w-5 h-5" />
                          <span className="text-lg font-semibold text-indigo-600">
                            {formatCurrency(option.precio_extra)}
                          </span>
                        </div>
                        
                        {/* Descripción */}
                        {option.descripcion && (
                          <p className="text-sm text-gray-600 mb-4">
                            {option.descripcion}
                          </p>
                        )}
                        
                        {/* Detalles principales */}
                        <div className="space-y-2 mt-4">
                          {option.cantidad_platos && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <FiShoppingBag className="w-4 h-4 text-indigo-500" />
                              <span>{option.cantidad_platos} platos incluidos</span>
                            </div>
                          )}
                          
                          {option.para_personas && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <FiUsers className="w-4 h-4 text-indigo-500" />
                              <span>Para {option.para_personas} personas</span>
                            </div>
                          )}
                          
                          {/* Botones de incrementar/decrementar platillos (opcional para futuras versiones) */}
                          {/* <div className="flex items-center gap-2 mt-4">
                            <button
                              type="button"
                              className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="font-medium">1</span>
                            <button
                              type="button"
                              className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div> */}
                        </div>
                      </div>
                      
                      {/* Botón de selección (alternativa al clic en tarjeta) */}
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange(isSelected ? null : option.id);
                          }}
                          className={`w-full py-2 rounded-lg font-medium ${
                            isSelected
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-500'
                              : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          {isSelected ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FiInfo className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No hay opciones de alimentos disponibles en este momento
                </p>
              </div>
            )}
          </div>
        )}
      />

      {/* Opción para omitir */}
      {activeFoodOptions.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 font-medium underline"
          >
            Continuar sin seleccionar opción de alimentos
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-indigo-50 p-5 rounded-lg">
        <div className="flex gap-3">
          <FiInfo className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800">Información sobre alimentos</h4>
            <p className="text-indigo-700 text-sm mt-1">
              Las opciones de alimentos tienen un costo adicional que se sumará al total de tu reserva.
              Puedes complementar estas opciones con extras adicionales en el siguiente paso.
              Si tienes alguna necesidad dietética especial, puedes mencionarla en la sección de comentarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOptionsStep;