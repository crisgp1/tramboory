import React from 'react';
import { Controller } from 'react-hook-form';
import { FiUser } from 'react-icons/fi';

const GenderSelector = ({ control, errors }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiUser className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Género del Festejado</h3>
      </div>

      <Controller
        name="genero"
        control={control}
        render={({ field }) => (
          <fieldset role="radiogroup" aria-labelledby="genero-label" className="space-y-2">
            <legend id="genero-label" className="sr-only">Género del festejado</legend>
            
            <div className="flex flex-wrap gap-4">
              {["niño", "niña", "no-binario", "prefiero-no-decirlo"].map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    {...field}
                    value={option}
                    checked={field.value === option}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            
            {errors?.genero && (
              <p className="mt-1 text-xs text-red-500">{errors.genero.message}</p>
            )}
          </fieldset>
        )}
      />
    </div>
  );
};

export default GenderSelector;