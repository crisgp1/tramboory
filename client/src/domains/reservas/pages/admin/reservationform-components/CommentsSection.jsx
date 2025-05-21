import React from 'react';
import { Controller } from 'react-hook-form';
import { FiMessageSquare } from 'react-icons/fi';

const CommentsSection = ({ control }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiMessageSquare className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Comentarios</h3>
      </div>

      <Controller
        name="comentarios"
        control={control}
        render={({ field }) => (
          <div>
            <textarea
              {...field}
              rows={4}
              className="w-full pl-3 pr-10 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Agrega cualquier comentario o instrucción especial para la reserva..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Puedes incluir detalles adicionales como:
            </p>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-500 space-y-1">
              <li>Requerimientos especiales</li>
              <li>Alergias o restricciones alimenticias</li>
              <li>Instrucciones específicas para la decoración</li>
              <li>Cualquier otra información relevante</li>
            </ul>
          </div>
        )}
      />

      {/* Panel informativo */}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <FiMessageSquare className="text-indigo-600 w-4 h-4" />
          <h4 className="font-medium text-gray-900">Información importante:</h4>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Los comentarios son visibles para el personal del establecimiento</li>
          <li>Serán considerados durante la preparación del evento</li>
          <li>No incluyas información sensible o confidencial</li>
        </ul>
      </div>

      {/* Contador de caracteres */}
      <Controller
        name="comentarios"
        control={control}
        render={({ field }) => (
          <div className="flex justify-end">
            <span className="text-sm text-gray-500">
              {field.value?.length || 0} caracteres
            </span>
          </div>
        )}
      />
    </div>
  );
};

export default CommentsSection;