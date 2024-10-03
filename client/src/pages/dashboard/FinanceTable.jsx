import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const FinanceTable = ({
                          finances,
                          handleEditItem,
                          handleDeleteItem
                      }) => {
    const calculateTotalIncome = () => {
        return finances
            .filter((finance) => finance.tipo === 'ingreso')
            .reduce((total, finance) => total + finance.monto, 0)
            .toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    };

    const calculateTotalExpense = () => {
        return finances
            .filter((finance) => finance.tipo === 'gasto')
            .reduce((total, finance) => total + Math.abs(finance.monto), 0)
            .toLocaleString('es-MX', {
                style: 'currency',
                currency: 'MXN',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
    };

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
            {finances.map((finance) => (
                <tr
                    key={finance.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                >
                    <td className="px-4 py-2">{finance.descripcion}</td>
                    <td
                        className={`px-4 py-2 ${
                            finance.tipo === 'ingreso'
                                ? 'text-blue-600'
                                : 'text-red-600'
                        }`}
                    >
                        {finance.tipo === 'ingreso' ? '$' : '-$'}
                        {Math.abs(finance.monto).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </td>
                    <td className="px-4 py-2">{finance.fecha}</td>
                    <td className="px-4 py-2">
                        <button
                            onClick={() => handleEditItem(finance)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                            <FiEdit2 />
                        </button>
                        <button
                            onClick={() => handleDeleteItem(finance.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FiTrash2 />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
            <tfoot>
            <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2">Total de Ingresos:</td>
                <td className="px-4 py-2 text-blue-600">
                    ${calculateTotalIncome()}
                </td>
                <td className="px-4 py-2">Total de Gastos:</td>
                <td className="px-4 py-2 text-red-600">
                    ${calculateTotalExpense()}
                </td>
            </tr>
            </tfoot>
        </table>
    );
};

export default FinanceTable;