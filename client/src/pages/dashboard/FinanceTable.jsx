import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

import { filterDataByMonth } from '../../services/dashboardService';

const FinanceTable = ({ data, selectedMonth, onEditItem }) => {
    const filteredData = filterDataByMonth(data, 'fecha', selectedMonth);

    return (
        <table className="w-full">
            <thead>
            <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Monto</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {filteredData.map((finance) => (
                <tr key={finance.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{finance.descripcion}</td>
                    <td className={`px-4 py-2 ${finance.tipo === 'ingreso' ? 'text-blue-600' : 'text-red-600'}`}>
                        {finance.tipo === 'ingreso' ? '$' : '-$'}
                        {Math.abs(finance.monto)}
                    </td>
                    <td className="px-4 py-2">{finance.fecha}</td>
                    <td className="px-4 py-2">
                        <button onClick={() => onEditItem(finance)} className="text-blue-500 hover:text-blue-700 mr-2">
                            <FiEdit2 />
                        </button>
                        <button className="text-red-500 hover:text-red-700">
                            <FiTrash2 />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default FinanceTable;