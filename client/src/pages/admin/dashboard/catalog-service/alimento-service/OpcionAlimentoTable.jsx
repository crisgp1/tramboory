import React, { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
// Usar el alias @ para garantizar resolución correcta en Docker
import { formatNumber } from '@/utils/formatters';

const OpcionAlimentoTable = ({ opcionesAlimento, handleEditItem, handleDeleteItem }) => {
  const activeOpcionesAlimento = useMemo(() => {
    return opcionesAlimento.filter(opcion => opcion.activo);
  }, [opcionesAlimento]);

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Descripción</th>
          <th className="px-4 py-2 text-left">Precio Extra</th>
          <th className="px-4 py-2 text-left">Turno</th>
          <th className="px-4 py-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {activeOpcionesAlimento.map((opcion) => (
          <tr key={opcion.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2">{opcion.nombre}</td>
            <td className="px-4 py-2">{opcion.descripcion}</td>
            <td className="px-4 py-2">{formatNumber(opcion.precio_extra)}</td>
            <td className="px-4 py-2">{opcion.turno}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleEditItem(opcion)}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => handleDeleteItem(opcion.id)}
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

export default OpcionAlimentoTable;