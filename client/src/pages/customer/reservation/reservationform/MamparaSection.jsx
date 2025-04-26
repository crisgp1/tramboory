import React, { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiLayout, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles, formatCurrency } from './styles';

const MamparaSection = ({ control, errors, filteredMamparas, setValue }) => {
  // Observar cambios en la mampara y temática seleccionadas
  const selectedMampara = useWatch({
    control,
    name: 'id_mampara'
  });

  // Extraer ID de mampara (puede ser un objeto complejo o un ID directo)
  const selectedMamparaId = typeof selectedMampara === 'object' 
    ? selectedMampara?.value 
    : selectedMampara;

  const selectedThemeObj = useWatch({
    control,
    name: 'id_tematica'
  });
  
  // Extraer ID de temática (puede ser un objeto complejo o un ID directo)
  const selectedTheme = typeof selectedThemeObj === 'object'
    ? selectedThemeObj?.value
    : selectedThemeObj;

  // Actualizar el precio de la mampara cuando cambia la selección
  useEffect(() => {
    // Si ya es un objeto complejo con precio, usamos ese valor directamente
    if (typeof selectedMampara === 'object' && selectedMampara?.precio) {
      setValue('mamparaPrice', parseFloat(selectedMampara.precio) || 0, {
        shouldValidate: true,
        shouldDirty: true
      });
      return;
    }
    
    // Si es un ID, buscamos la mampara correspondiente
    if (selectedMamparaId) {
      const selectedMamparaObj = filteredMamparas.find(m => Number(m.id) === Number(selectedMamparaId));
      if (selectedMamparaObj) {
        setValue('mamparaPrice', parseFloat(selectedMamparaObj.precio) || 0, {
          shouldValidate: true,
          shouldDirty: true
        });
      }
    } else {
      setValue('mamparaPrice', 0, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [selectedMampara, selectedMamparaId, filteredMamparas, setValue]);

  // Limpiar la selección de mampara cuando cambia la temática
  useEffect(() => {
    if (!selectedTheme && !selectedThemeObj) {
      setValue('id_mampara', null);
      setValue('mamparaPrice', 0, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [selectedTheme, selectedThemeObj, setValue]);

  return (
    <FormSection title="Mampara" icon={FiLayout}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selecciona la Mampara
        </label>
        <div className="relative">
          <Controller
            name="id_mampara"
            control={control}
            render={({ field }) => {
              const options = filteredMamparas.map((mampara) => ({
                value: mampara.id,
                label: `${mampara.piezas} piezas - ${formatCurrency(mampara.precio)}`,
                piezas: mampara.piezas,
                precio: mampara.precio
              }));
              
              // Manejar tanto objeto complejo como ID directo
              const selectedOption = typeof field.value === 'object'
                ? field.value // Ya es un objeto completo
                : options.find((option) => Number(option.value) === Number(field.value));

              return (
                <>
                  <Select
                    options={options}
                    value={selectedOption}
                    onChange={(option) => {
                      field.onChange(option ? option.value : null);
                      if (option) {
                        setValue('mamparaPrice', parseFloat(option.precio) || 0, {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      } else {
                        setValue('mamparaPrice', 0, {
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }
                    }}
                    placeholder={selectedTheme || selectedThemeObj ? "Seleccionar mampara" : "Primero selecciona una temática"}
                    isDisabled={!selectedTheme && !selectedThemeObj}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    menuPortalTarget={document.body}
                    isClearable={true}
                  />
                  {selectedOption && (
                    <div className="mt-2 text-sm text-indigo-600 bg-indigo-50 p-2 rounded-md flex items-center gap-2">
                      <FiInfo className="w-4 h-4" />
                      <span>
                        Esta mampara incluye {selectedOption.piezas} piezas - 
                        Precio: {formatCurrency(selectedOption.precio)}
                      </span>
                    </div>
                  )}
                </>
              );
            }}
          />
          {errors.id_mampara && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4" />
              {errors.id_mampara.message}
            </p>
          )}
        </div>
        {(selectedTheme || selectedThemeObj) && filteredMamparas.length === 0 && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md flex items-center gap-2">
            <FiInfo className="w-4 h-4" />
            <span>No hay mamparas disponibles para la temática seleccionada</span>
          </p>
        )}
        {!selectedTheme && !selectedThemeObj && (
          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md flex items-center gap-2">
            <FiInfo className="w-4 h-4" />
            <span>Selecciona una temática para ver las mamparas disponibles</span>
          </p>
        )}
      </div>
    </FormSection>
  );
};

export default MamparaSection;