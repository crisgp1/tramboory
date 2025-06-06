import React from 'react';
import { Controller } from 'react-hook-form';
import { FiStar, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles } from './styles';

const ThemeSelect = ({ field, options, error }) => {
  // Manejar tanto objeto complejo como ID directo
  const selectedValue = typeof field.value === 'object' 
    ? field.value // Ya es un objeto completo
    : options.find((option) => Number(option.value) === Number(field.value));
  
  return (
    <div>
      <Select
        options={options}
        value={selectedValue}
        onChange={(option) => {
          // En modo dashboard queremos preservar el objeto completo
          // En modo cliente solo el valor es suficiente
          // Usamos el valor directo para compatibilidad con ambos
          field.onChange(option ? option.value : null);
        }}
        placeholder="Seleccionar temática"
        className="react-select-container"
        classNamePrefix="react-select"
        styles={customSelectStyles}
        menuPortalTarget={document.body}
        isClearable={true}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <FiAlertCircle className="w-4 h-4" />
          {error.message}
        </p>
      )}
    </div>
  );
};

const ThemeSection = ({ control, errors, tematicas, setValue }) => {
  // Filtrar por temáticas activas y mapear a formato para select
  const themeOptions = tematicas
    .filter(tematica => tematica.activo) // Solo temáticas activas
    .map((tematica) => ({
      value: tematica.id,
      label: tematica.nombre,
      // Preservar propiedades importantes para compatibilidad
      descripcion: tematica.descripcion,
      foto: tematica.foto,
      // Datos completos para compatibilidad
      data: tematica
    }));

  return (
    <FormSection title="Temática del Evento" icon={FiStar}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona la Temática
          </label>
          <Controller
            name="id_tematica"
            control={control}
            rules={{ required: 'Temática es requerida' }}
            render={({ field }) => (
              <ThemeSelect
                field={field}
                options={themeOptions}
                error={errors.id_tematica}
              />
            )}
          />
          <p className="mt-1 text-xs text-gray-500">
            Tu selección de temática afectará las opciones de mampara disponibles.
          </p>
        </div>

        {/* Información adicional sobre las temáticas */}
        {themeOptions.length > 0 ? (
          <div className="mt-4 bg-indigo-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-indigo-700 mb-2">
              <FiInfo className="w-4 h-4" />
              <span className="text-sm font-medium">Información sobre temáticas</span>
            </div>
            <p className="text-sm text-indigo-600">
              Selecciona la temática que mejor se adapte a tu celebración. 
              Cada temática incluye decoración y ambientación específica.
            </p>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <FiInfo className="mx-auto h-6 w-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No hay temáticas disponibles en este momento
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default ThemeSection;
