import React from 'react';
import { Controller } from 'react-hook-form';
import { FiUser, FiAlertCircle } from 'react-icons/fi';
import FormSection from './FormSection';

const CelebrantSection = ({ control, errors }) => {
  return (
    <FormSection title="Información del Festejado" icon={FiUser}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del Festejado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Festejado *
          </label>
          <div className="relative">
            <Controller
              name="nombre_festejado"
              control={control}
              defaultValue=""
              rules={{
                required: 'Nombre del festejado es requerido',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres',
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nombre completo"
                />
              )}
            />
            {errors.nombre_festejado && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.nombre_festejado.message}
              </p>
            )}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Edad del Festejado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad del Festejado *
          </label>
          <div className="relative">
            <Controller
              name="edad_festejado"
              control={control}
              defaultValue=""
              rules={{
                required: 'Edad del festejado es requerida',
                min: {
                  value: 1,
                  message: 'La edad debe ser mayor a 0',
                },
                max: {
                  value: 100,
                  message: 'La edad no puede ser mayor a 100',
                },
              }}
              render={({ field: { onChange, ...field } }) => (
                <input
                  {...field}
                  type="number"
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    onChange(isNaN(value) ? '' : value);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Edad"
                />
              )}
            />
            {errors.edad_festejado && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.edad_festejado.message}
              </p>
            )}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CelebrantSection;