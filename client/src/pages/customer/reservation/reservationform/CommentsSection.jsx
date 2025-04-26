import React from 'react';
import { Controller } from 'react-hook-form';
import { FiMessageSquare } from 'react-icons/fi';
import FormSection from './FormSection';

const CommentsSection = ({ control }) => {
  return (
    <FormSection title="Comentarios Adicionales" icon={FiMessageSquare}>
      <div>
        <div className="relative">
          <Controller
            name="comentarios"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <textarea
                {...field}
                rows="3"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                placeholder="¿Tienes algún requerimiento especial o comentario adicional para tu reserva?"
              />
            )}
          />
          <div className="absolute top-3 left-3">
            <FiMessageSquare className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CommentsSection;
