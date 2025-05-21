import React from 'react';

const StatusSection = ({ register }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado Activo
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('activo')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">
            Reservación activa
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusSection;