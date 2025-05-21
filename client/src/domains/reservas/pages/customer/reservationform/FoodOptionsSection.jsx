import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FiCoffee, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles, formatCurrency } from './styles';

const FoodOptionLabel = React.memo(({ foodOption }) => (
  <div className="space-y-1">
    <div className="font-medium text-gray-900">{foodOption.nombre}</div>
    <div className="text-xs text-gray-500">
      {foodOption.descripcion || 'Opción estándar de alimentos'}
    </div>
  </div>
));

FoodOptionLabel.displayName = 'FoodOptionLabel';

const FoodOptionDetails = React.memo(({ foodOption }) => (
  <div className="p-2 space-y-2">
    <div className="font-medium text-gray-900">{foodOption.nombre}</div>
    <div className="text-sm text-gray-600 space-y-1">
      <div>Menú para Adultos: {foodOption.menu_adulto || 'Menú estándar'}</div>
      <div>Menú para Niños: {foodOption.menu_nino || 'Menú infantil estándar'}</div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">Precios por persona:</div>
        <div>Adultos: {formatCurrency(foodOption.precio_adulto)}</div>
        <div>Niños: {formatCurrency(foodOption.precio_nino)}</div>
        <div className="text-indigo-600 font-medium mt-1">
          Total estimado: {formatCurrency(foodOption.precio_extra)}
        </div>
      </div>
    </div>
  </div>
));

FoodOptionDetails.displayName = 'FoodOptionDetails';

const FoodSelect = React.memo(({ field, options, customStyles }) => {
  // Manejar tanto objetos complejos como IDs directos
  const selectedOption = useMemo(() => {
    // Si es un objeto complejo (formato dashboard)
    if (typeof field.value === 'object' && field.value?.value) {
      return options.find(option => Number(option.value) === Number(field.value.value));
    }
    
    // Si es un ID directo (formato cliente)
    return options.find(option => Number(option.value) === Number(field.value));
  }, [options, field.value]);

  return (
    <Select
      {...field}
      options={options}
      value={selectedOption}
      onChange={(option) => {
        // Mantener el formato de ID simple para compatibilidad
        field.onChange(option ? option.value : null);
      }}
      placeholder="Seleccionar opción de alimento"
      className="react-select-container"
      classNamePrefix="react-select"
      styles={{
        ...customStyles,
        option: (base) => ({
          ...base,
          padding: '8px 12px',
          cursor: 'pointer'
        })
      }}
      formatOptionLabel={(option) => (
        <FoodOptionLabel foodOption={option.foodOption} />
      )}
      components={{
        Option: ({ data, ...props }) => (
          <div {...props.innerProps}>
            <FoodOptionDetails foodOption={data.foodOption} />
          </div>
        )
      }}
      isClearable
    />
  );
});

FoodSelect.displayName = 'FoodSelect';

const FoodOptionsSection = ({ control, errors, foodOptions, setValue }) => {
  const foodOptionsList = useMemo(() => 
    foodOptions
      // Filtrar por opciones activas (si aplica)
      .filter(food => food.activo !== false)
      .map((food) => ({
        value: food.id,
        label: food.nombre,
        foodOption: food, // Pasar la opción completa
        // Propiedades directas para compatibilidad con ambos formatos
        precio_extra: food.precio_extra,
        turno: food.turno,
        descripcion: food.descripcion
      })),
    [foodOptions]
  );

  return (
    <FormSection title="Opción de Alimento" icon={FiCoffee}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona la Opción de Alimento
          </label>
          <Controller
            name="id_opcion_alimento"
            control={control}
            rules={{ required: 'La opción de alimento es requerida' }}
            render={({ field }) => (
              <div>
                <FoodSelect
                  field={field}
                  options={foodOptionsList}
                  customStyles={customSelectStyles}
                />
                {errors.id_opcion_alimento && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.id_opcion_alimento.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Información adicional sobre las opciones de alimento */}
        {foodOptions.length > 0 ? (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <FiInfo className="w-4 h-4" />
              <span className="text-sm font-medium">Información importante</span>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Cada opción de alimento incluye menús específicos para adultos y niños.
                Los precios mostrados son por persona y se suman al paquete base.
              </p>
              <p>
                Puedes solicitar cambios específicos (como papas fritas) al momento de la reserva
                en la sección de comentarios adicionales.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <FiInfo className="mx-auto h-6 w-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No hay opciones de alimento disponibles en este momento
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default FoodOptionsSection;