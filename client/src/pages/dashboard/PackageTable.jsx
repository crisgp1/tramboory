import React, { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';

const PackageTable = ({ packages, handleEditItem, handleDeleteItem }) => {
  const activePackages = useMemo(() => {
    return packages.filter(pkg => pkg.activo);
  }, [packages]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Precio Lunes-Jueves</th>
            <th className="px-4 py-2 text-left">Precio Viernes-Domingo</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activePackages.map((pkg) => (
            <tr key={pkg.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2">{pkg.nombre}</td>
              <td className="px-4 py-2">{formatNumber(pkg.precio_lunes_jueves)}</td>
              <td className="px-4 py-2">{formatNumber(pkg.precio_viernes_domingo)}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEditItem(pkg)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  aria-label="Editar paquete"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDeleteItem(pkg.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Eliminar paquete"
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackageTable;