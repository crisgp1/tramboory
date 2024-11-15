import React from 'react';
import { Controller } from 'react-hook-form';
import { FiUser } from 'react-icons/fi';

const CelebrantSection = ({ control, errors }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiUser className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Datos del Festejado</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Festejado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Festejado
          </label>
          <Controller
            name="nombre_festejado"
            control={control}
            rules={{
              required: 'El nombre del festejado es requerido',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres'
              }
            }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  className={`w-full pl-3 pr-10 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.nombre_festejado ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre completo"
                />
                {errors.nombre_festejado && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.nombre_festejado.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Edad del Festejado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Edad del Festejado
          </label>
          <Controller
            name="edad_festejado"
            control={control}
            rules={{
              required: 'La edad es requerida',
              min: {
                value: 1,
                message: 'La edad debe ser mayor a 0'
              },
              max: {
                value: 100,
                message: 'La edad debe ser menor a 100'
              }
            }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="number"
                  min="1"
                  max="100"
                  className={`w-full pl-3 pr-10 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.edad_festejado ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Edad"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 100)) {
                      field.onChange(value);
                    }
                  }}
                />
                {errors.edad_festejado && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.edad_festejado.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <FiUser className="text-indigo-600 w-4 h-4" />
          <h4 className="font-medium text-gray-900">Información importante:</h4>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>El nombre debe ser el nombre completo del festejado</li>
          <li>La edad debe ser un número entre 1 y 100 años</li>
          <li>Estos datos serán utilizados para personalizar la experiencia</li>
        </ul>
      </div>
    </div>
  );
};

export default CelebrantSection;