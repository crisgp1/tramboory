import React, { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FiImage, FiAlertCircle, FiInfo, FiTag, FiFileText } from 'react-icons/fi';
import Select from 'react-select';

const ThemeSection = ({ control, errors, tematicas, setValue }) => {
  const formatThemeOption = useCallback((tematica) => ({
    value: tematica.id,
    label: tematica.nombre,
    descripcion: tematica.descripcion || '',
    foto: tematica.foto || null,
    key: `theme-${tematica.id}`
  }), []);

  const formatOptionLabel = useCallback(({ label, value }) => (
    <div key={`theme-label-${value}`} className="flex items-center gap-2">
      <FiImage className="w-4 h-4 text-gray-500" />
      <span>{label}</span>
    </div>
  ), []);

  const themeOptions = useMemo(() => {
    const options = tematicas
      .filter(tematica => tematica.activo)
      .map(formatThemeOption);
    console.log('[ThemeSection] Available theme options:', options);
    return options;
  }, [tematicas, formatThemeOption]);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.id_tematica ? '#ef4444' : state.isFocused ? '#6366f1' : '#e5e7eb',
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

  const renderThemeDetails = useCallback((theme) => {
    if (!theme) return null;
    console.log('[ThemeSection] Rendering details for theme:', theme);

    const details = [
      { icon: FiTag, label: 'Nombre', value: theme.label },
      ...(theme.descripcion ? [{ 
        icon: FiFileText, 
        label: 'Descripción', 
        value: theme.descripcion,
        fullWidth: true 
      }] : [])
    ];

    return (
      <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FiInfo className="text-indigo-600" />
          Detalles de la temática
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {details.map(({ icon: Icon, label, value, fullWidth }) => (
            <div 
              key={`theme-detail-${label}-${value}`}
              className={`flex items-start gap-3 bg-gray-50 p-3 rounded-md ${
                fullWidth ? 'col-span-full' : ''
              }`}
            >
              <Icon className="w-5 h-5 mt-0.5 text-gray-500" />
              <div className="flex-1">
                <span className="text-sm text-gray-600">{label}:</span>
                <div className={`${fullWidth ? 'mt-1' : 'ml-1 inline'} font-medium text-gray-900`}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
        {theme.foto && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FiImage className="text-indigo-600" />
              <span>Imagen de referencia</span>
            </div>
            <div className="relative group">
              <img
                src={theme.foto}
                alt={theme.label}
                className="w-full max-w-md rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
            </div>
          </div>
        )}
      </div>
    );
  }, []);

  const handleThemeChange = useCallback((selectedOption, onChange) => {
    console.log('[ThemeSection] Theme selection changed:', selectedOption);
    onChange(selectedOption);
    // Limpiar la mampara cuando se cambia la temática
    setValue('id_mampara', null);
  }, [setValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiImage className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Temática</h3>
        </div>
        {themeOptions.length > 0 && (
          <span className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            {themeOptions.length} temáticas disponibles
          </span>
        )}
      </div>

      <Controller
        name="id_tematica"
        control={control}
        rules={{ required: 'Debes seleccionar una temática' }}
        render={({ field }) => (
          <div>
            <Select
              {...field}
              isClearable
              placeholder="Selecciona una temática"
              options={themeOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={customSelectStyles}
              formatOptionLabel={formatOptionLabel}
              noOptionsMessage={() => "No hay temáticas disponibles"}
              onChange={(selectedOption) => handleThemeChange(selectedOption, field.onChange)}
              onBlur={() => {
                console.log('[ThemeSection] Theme selection blurred');
                field.onBlur();
              }}
            />
            {errors.id_tematica && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-3 h-3" />
                {errors.id_tematica.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Use the current form value directly */}
      {renderThemeDetails(control._formValues.id_tematica)}

      {themeOptions.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
          <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No hay temáticas disponibles</p>
            <p className="text-sm mt-1">
              No se encontraron temáticas activas en el sistema.
              Por favor, contacta al administrador para más información.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSection;