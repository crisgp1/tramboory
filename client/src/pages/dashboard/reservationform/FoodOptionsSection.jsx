import React, { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FiCoffee, FiDollarSign, FiUsers, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';

const FoodOptionsSection = ({ control, errors, foodOptions }) => {
  const formatFoodOption = useCallback((option) => ({
    value: option.id,
    label: `${option.nombre} - $${option.precio_extra}`,
    data: option,
  }), []);

  const foodOptionsList = useMemo(() => 
    foodOptions.map(formatFoodOption),
    [foodOptions, formatFoodOption]
  );

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.id_opcion_alimento ? '#ef4444' : state.isFocused ? '#6366f1' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#e5e7eb'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      transition: 'all 0.2s ease',
      '&:active': {
        backgroundColor: '#6366f1'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50
    })
  };

  const renderOptionDetails = useCallback((option) => {
    if (!option) return null;

    const details = [
      { 
        icon: FiUsers,
        title: 'Platillo Adulto',
        value: option.platillo_adulto,
        price: option.precio_adulto,
        highlight: true
      },
      { 
        icon: FiUsers,
        title: 'Platillo Niño',
        value: option.platillo_nino,
        price: option.precio_nino,
        highlight: true
      },
      { 
        icon: FiDollarSign,
        title: 'Precio Extra',
        value: `$${option.precio_extra}`,
        isPrice: true
      },
      { 
        icon: FiClock,
        title: 'Turno',
        value: option.turno.charAt(0).toUpperCase() + option.turno.slice(1)
      }
    ];

    return (
      <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FiInfo className="text-indigo-600" />
          Detalles de la opción seleccionada
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map(({ icon: Icon, title, value, price, highlight, isPrice }) => (
            <div
              key={title}
              className={`flex items-start gap-3 bg-gray-50 p-3 rounded-md ${
                highlight ? 'col-span-full' : ''
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${isPrice ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div className="flex-1">
                <span className="text-sm text-gray-600">{title}:</span>
                <div className="font-medium text-gray-900">
                  {value}
                  {price && (
                    <span className="ml-2 text-indigo-600">
                      (${price})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {option.opcion_papas && (
          <div className="mt-4 bg-green-50 p-3 rounded-md border border-green-100">
            <div className="flex items-center gap-2">
              <FiInfo className="text-green-600" />
              <div>
                <span className="font-medium text-green-800">Opción de Papas Disponible</span>
                <span className="ml-2 text-green-600">+${option.precio_papas}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiCoffee className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Opción de Alimentos</h3>
        </div>
        {foodOptionsList.length > 0 && (
          <span className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            {foodOptionsList.length} opciones disponibles
          </span>
        )}
      </div>

      <Controller
        name="id_opcion_alimento"
        control={control}
        rules={{ required: 'Debes seleccionar una opción de alimentos' }}
        render={({ field }) => (
          <div>
            <Select
              {...field}
              isClearable
              placeholder="Selecciona una opción de alimentos"
              options={foodOptionsList}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={customSelectStyles}
              noOptionsMessage={() => "No hay opciones disponibles"}
            />
            {errors.id_opcion_alimento && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {errors.id_opcion_alimento.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        name="id_opcion_alimento"
        control={control}
        render={({ field }) => renderOptionDetails(field.value?.data)}
      />

      {foodOptionsList.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FiInfo className="w-5 h-5" />
          <span>No hay opciones de alimentos disponibles</span>
        </div>
      )}
    </div>
  );
};

export default FoodOptionsSection;