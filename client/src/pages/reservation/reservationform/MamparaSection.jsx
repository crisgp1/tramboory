import React, { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiLayout, FiAlertCircle, FiInfo } from 'react-icons/fi';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles, formatCurrency } from './styles';

const MamparaSection = ({ control, errors, filteredMamparas, setValue }) => {
  // Observar cambios en la mampara y temática seleccionadas
  const selectedMamparaId = useWatch({
    control,
    name: 'id_mampara'
  });

  const selectedTheme = useWatch({
    control,
    name: 'id_tematica'
  });

  // Actualizar el precio de la mampara cuando cambia la selección
  useEffect(() => {
    if (selectedMamparaId) {
      const selectedMampara = filteredMamparas.find(m => m.id === selectedMamparaId);
      if (selectedMampara) {
        setValue('mamparaPrice', parseFloat(selectedMampara.precio) || 0, {
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
  }, [selectedMamparaId, filteredMamparas, setValue]);

  // Limpiar la selección de mampara cuando cambia la temática
  useEffect(() => {
    if (!selectedTheme) {
      setValue('id_mampara', null);
      setValue('mamparaPrice', 0, {
        shouldValidate: true,
        shouldDirty: true
      });
    }
  }, [selectedTheme, setValue]);

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
              const selectedOption = options.find((option) => option.value === field.value);

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
                    placeholder={selectedTheme ? "Seleccionar mampara" : "Primero selecciona una temática"}
                    isDisabled={!selectedTheme}
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
        {selectedTheme && filteredMamparas.length === 0 && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md flex items-center gap-2">
            <FiInfo className="w-4 h-4" />
            <span>No hay mamparas disponibles para la temática seleccionada</span>
          </p>
        )}
        {!selectedTheme && (
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