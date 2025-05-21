import React, { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FiPackage, FiCalendar, FiDollarSign, FiAlertCircle, FiCheck, FiInfo } from 'react-icons/fi';

const PackageSection = ({ control, packages, errors }) => {
  const renderPriceInfo = useCallback((pkg) => (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="flex flex-col bg-gray-50 p-2 rounded-md">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4" />
          <span>L-J</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <FiDollarSign className="w-4 h-4 text-indigo-600" />
          <span className="text-lg font-semibold text-indigo-600">
            {pkg.precio_lunes_jueves}
          </span>
        </div>
      </div>
      <div className="flex flex-col bg-gray-50 p-2 rounded-md">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4" />
          <span>V-D</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <FiDollarSign className="w-4 h-4 text-indigo-600" />
          <span className="text-lg font-semibold text-indigo-600">
            {pkg.precio_viernes_domingo}
          </span>
        </div>
      </div>
    </div>
  ), []);

  const packagesList = useMemo(() => 
    packages.filter(pkg => pkg.activo),
    [packages]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiPackage className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Selección de Paquete</h3>
        </div>
        {packagesList.length > 0 && (
          <span className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            {packagesList.length} paquetes disponibles
          </span>
        )}
      </div>

      <Controller
        name="id_paquete"
        control={control}
        rules={{ required: 'Debes seleccionar un paquete' }}
        render={({ field }) => (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packagesList.map((pkg) => {
                const isSelected = field.value === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-lg border transition-all duration-300 transform cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm hover:scale-[1.01]'
                    }`}
                    onClick={() => field.onChange(pkg.id)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        field.onChange(pkg.id);
                      }
                    }}
                    aria-pressed={isSelected}
                    aria-label={`Seleccionar paquete ${pkg.nombre}`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {pkg.nombre}
                          </h4>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                              <FiCheck className="w-3 h-3" />
                              Seleccionado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {pkg.descripcion}
                        </p>
                      </div>
                      {renderPriceInfo(pkg)}
                    </div>

                    {pkg.caracteristicas && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FiInfo className="text-indigo-600 w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Características
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {pkg.caracteristicas.split(',').map((caracteristica, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <FiCheck className="w-3 h-3 text-green-500" />
                              {caracteristica.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.id_paquete && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.id_paquete.message}
              </p>
            )}
          </div>
        )}
      />

      {packagesList.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FiInfo className="w-5 h-5" />
          <span>No hay paquetes disponibles</span>
        </div>
      )}
    </div>
  );
};

export default PackageSection;