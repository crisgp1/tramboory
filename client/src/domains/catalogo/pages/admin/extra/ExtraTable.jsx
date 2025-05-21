import React, { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
// Usar el alias @ para garantizar resolución correcta en Docker
import { formatNumber } from '@shared/utils/formatters';

const ExtraTable = ({ extras, handleEditItem, handleDeleteItem }) => {
  const activeExtras = useMemo(() => {
    return extras.filter(extra => extra.activo);
  }, [extras]);

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Descripción</th>
          <th className="px-4 py-2 text-left">Precio</th>
          <th className="px-4 py-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {activeExtras.map((extra) => (
          <tr key={extra.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2">{extra.nombre}</td>
            <td className="px-4 py-2">{extra.descripcion}</td>
            <td className="px-4 py-2">{formatNumber(extra.precio)}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleEditItem(extra)}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => handleDeleteItem(extra.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ExtraTable;