import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { FiUser } from 'react-icons/fi';

const GenderSelector = ({ control, errors }) => {
  const [showCustomField, setShowCustomField] = useState(false);
  const [customGender, setCustomGender] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiUser className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Género del Festejado</h3>
      </div>

      <Controller
        name="genero"
        control={control}
        render={({ field }) => {
          // Verificar si debemos mostrar el campo personalizado
          useEffect(() => {
            if (field.value && !["niño", "niña", "otro"].includes(field.value)) {
              setShowCustomField(true);
              setCustomGender(field.value);
            } else if (field.value === "otro") {
              setShowCustomField(true);
            }
          }, [field.value]);

          return (
            <fieldset role="radiogroup" aria-labelledby="genero-label" className="space-y-2">
              <legend id="genero-label" className="sr-only">Género del festejado</legend>
              
              <div className="flex flex-wrap gap-4">
                {["niño", "niña", "otro"].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={option}
                      checked={option === "otro" ? showCustomField : field.value === option}
                      onChange={(e) => {
                        if (e.target.value === "otro") {
                          setShowCustomField(true);
                          // Si es la primera vez que seleccionan "otro", establecemos un valor vacío
                          if (field.value !== "otro" && !customGender) {
                            field.onChange("");
                          } else {
                            // Si ya tenían un valor personalizado, lo mantenemos
                            field.onChange(customGender);
                          }
                        } else {
                          setShowCustomField(false);
                          field.onChange(e.target.value);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              
              {showCustomField && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customGender}
                    onChange={(e) => {
                      setCustomGender(e.target.value);
                      field.onChange(e.target.value);
                    }}
                    placeholder="Especifica el género"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
              
              {errors?.genero && (
                <p className="mt-1 text-xs text-red-500">{errors.genero.message}</p>
              )}
            </fieldset>
          );
        }}
      />
    </div>
  );
};

export default GenderSelector;