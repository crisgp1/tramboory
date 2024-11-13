import React, { useMemo } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';

const MamparaTable = ({ mamparas, tematicas, handleEditItem, handleDeleteItem }) => {
  const activeMamparas = useMemo(() => {
    return Array.isArray(mamparas) ? mamparas.filter(mampara => mampara.activo) : [];
  }, [mamparas]);

  const getTematicaNombre = (id_tematica) => {
    if (Array.isArray(tematicas)) {
      const tematica = tematicas.find(t => t.id === id_tematica);
      return tematica ? tematica.nombre : 'No especificada';
    }
    return 'No especificada';
  };

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 text-left">ID</th>
          <th className="px-4 py-2 text-left">Piezas</th>
          <th className="px-4 py-2 text-left">Precio</th>
          <th className="px-4 py-2 text-left">Temática</th>
          <th className="px-4 py-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {activeMamparas.map((mampara) => (
          <tr key={mampara.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2">{mampara.id}</td>
            <td className="px-4 py-2">{mampara.piezas}</td>
            <td className="px-4 py-2">{formatNumber(mampara.precio)}</td>
            <td className="px-4 py-2">{getTematicaNombre(mampara.id_tematica)}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleEditItem(mampara)}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                <FiEdit2/>
              </button>
              <button
                onClick={() => handleDeleteItem(mampara.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2/>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MamparaTable;