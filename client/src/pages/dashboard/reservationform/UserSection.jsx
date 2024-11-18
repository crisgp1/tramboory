import React from 'react';

const UserSection = ({ register, errors, users, addLog }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Usuario
      </label>
      <div className="relative">
        <select
          {...register('id_usuario', {
            required: 'Este campo es requerido',
          })}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => {
            register('id_usuario').onChange(e);
            addLog('Usuario seleccionado');
          }}
        >
          <option value="">Seleccionar usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nombre}
            </option>
          ))}
        </select>
        {errors.id_usuario && (
          <p className="mt-1 text-xs text-red-500">
            {errors.id_usuario.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserSection;