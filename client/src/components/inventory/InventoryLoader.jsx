import React from 'react';
import { FiPackage } from 'react-icons/fi';

/**
 * Componente de carga para el módulo de inventario
 * Muestra una animación mientras se cargan datos
 */
const InventoryLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="relative mb-4">
          <FiPackage className="text-indigo-500 w-16 h-16 mb-2 mx-auto" />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando Sistema de Inventario</h2>
        <p className="text-gray-500">Por favor espere mientras preparamos todo...</p>
      </div>
    </div>
  );
};

export default InventoryLoader;