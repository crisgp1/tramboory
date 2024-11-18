import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiLayout, FiAlertCircle, FiImage, FiDollarSign, FiLayers } from 'react-icons/fi';
import Select from 'react-select';

const MamparaSection = ({ control, errors, filteredMamparas, setValue }) => {
  // Usar useWatch para observar los cambios en los campos relevantes
  const selectedTheme = useWatch({
    control,
    name: 'id_tematica',
  });

  const selectedMampara = useWatch({
    control,
    name: 'id_mampara',
  });

  const formatMamparaOption = useCallback((mampara) => {
    console.log('[MamparaSection] Formatting mampara option:', mampara);
    return {
      value: mampara.id,
      label: `${mampara.piezas} pieza(s) - ${new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(parseFloat(mampara.precio) || 0)}`,
      piezas: mampara.piezas,
      precio: mampara.precio,
      foto: mampara.foto,
    };
  }, []);

  const isThemeSelected = useMemo(() => {
    const hasTheme = Boolean(selectedTheme?.value);
    console.log('[MamparaSection] Theme selected:', hasTheme, selectedTheme);
    return hasTheme;
  }, [selectedTheme]);

  const mamparaOptions = useMemo(() => {
    const options = filteredMamparas.map(formatMamparaOption);
    console.log('[MamparaSection] Available mampara options:', options);
    return options;
  }, [filteredMamparas, formatMamparaOption]);

  // Efecto para limpiar la mampara cuando cambia la temática
  useEffect(() => {
    console.log('[MamparaSection] Theme changed:', selectedTheme);
    if (!isThemeSelected) {
      console.log('[MamparaSection] Clearing mampara selection');
      setValue('id_mampara', null);
    }
  }, [isThemeSelected, setValue]);

  // Efecto para actualizar el total cuando cambia la mampara
  useEffect(() => {
    console.log('[MamparaSection] Mampara changed:', selectedMampara);
    // Forzar actualización del total
    setValue('total', null, { shouldValidate: true });
  }, [selectedMampara, setValue]);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.id_mampara ? '#ef4444' : state.isFocused ? '#6366f1' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      backgroundColor: !isThemeSelected ? '#f9fafb' : 'white',
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
    placeholder: (base) => ({
      ...base,
      color: !isThemeSelected ? '#9ca3af' : '#6b7280'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50
    })
  };

  const renderMamparaDetails = useCallback((mampara) => {
    if (!mampara) return null;
    console.log('[MamparaSection] Rendering details for mampara:', mampara);

    const details = [
      { icon: FiLayers, label: 'Piezas', value: mampara.piezas },
      { 
        icon: FiDollarSign, 
        label: 'Precio', 
        value: new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN'
        }).format(parseFloat(mampara.precio) || 0),
        highlight: true 
      }
    ];

    return (
      <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FiLayout className="text-indigo-600" />
          Detalles de la mampara
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {details.map(({ icon: Icon, label, value, highlight }) => (
            <div key={label} className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
              <Icon className={`w-5 h-5 ${highlight ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div>
                <span className="text-sm text-gray-600">{label}:</span>
                <span className={`ml-2 font-medium ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
        {mampara.foto && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FiImage className="text-indigo-600" />
              <span>Imagen de referencia</span>
            </div>
            <div className="relative group">
              <img
                src={mampara.foto}
                alt={`Mampara de ${mampara.piezas} piezas`}
                className="w-full max-w-md rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
            </div>
          </div>
        )}
      </div>
    );
  }, []);

  const handleMamparaChange = useCallback((selectedOption, onChange) => {
    console.log('[MamparaSection] Mampara selection changed:', selectedOption);
    onChange(selectedOption);
    // Forzar actualización del total
    setValue('total', null, { shouldValidate: true });
  }, [setValue]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FiLayout className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Mampara</h3>
        </div>
        {isThemeSelected && selectedTheme?.label && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            <span className="font-medium">Temática:</span>
            <span>{selectedTheme.label}</span>
          </div>
        )}
      </div>

      <div className={`transition-all duration-300 ${!isThemeSelected ? 'opacity-50' : ''}`}>
        <Controller
          name="id_mampara"
          control={control}
          render={({ field }) => (
            <div>
              <Select
                {...field}
                isClearable
                isDisabled={!isThemeSelected}
                placeholder={
                  isThemeSelected
                    ? "Selecciona una mampara"
                    : "Primero selecciona una temática"
                }
                options={mamparaOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={customSelectStyles}
                noOptionsMessage={() => "No hay mamparas disponibles"}
                onChange={(selectedOption) => handleMamparaChange(selectedOption, field.onChange)}
                onBlur={() => {
                  console.log('[MamparaSection] Mampara selection blurred');
                  field.onBlur();
                }}
              />
              {errors.id_mampara && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  {errors.id_mampara.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Controller
        name="id_mampara"
        control={control}
        render={({ field }) => renderMamparaDetails(field.value)}
      />

      {!isThemeSelected && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
          <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Selección de temática requerida</p>
            <p className="text-sm mt-1">
              Para ver las mamparas disponibles, primero debes seleccionar una temática en la sección anterior.
            </p>
          </div>
        </div>
      )}

      {isThemeSelected && mamparaOptions.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
          <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No hay mamparas disponibles</p>
            <p className="text-sm mt-1">
              No se encontraron mamparas disponibles para la temática seleccionada.
              Por favor, selecciona otra temática o contacta al administrador.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MamparaSection;