import { FiEdit2, FiTrash2, FiDownload, FiEye } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { formatDate, formatNumber } from '../../utils/formatters';

const FinanceTable = ({ finances, handleEditItem, handleDeleteItem, handleDownloadFile, handleViewDetails, categories }) => {
    const getCategoryColor = (categoryName) => {
        const category = categories.find(cat => cat.nombre === categoryName);
        return category ? category.color : '#CCCCCC'; // Color por defecto si no se encuentra la categoría
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Archivo
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {finances.map((finance) => (
                    <tr key={finance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{finance.descripcion}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className={`text-sm font-medium ${finance.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                {finance.tipo === 'ingreso' ? '+' : '-'}
                                {formatNumber(Math.abs(finance.monto))}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(finance.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{
                                        backgroundColor: getCategoryColor(finance.categoria),
                                        color: getCategoryColor(finance.categoria) ? '#FFFFFF' : '#000000'
                                    }}
                                >
                                    {finance.categoria}
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            {finance.factura_pdf || finance.factura_xml || finance.archivo_prueba ? (
                                <button
                                    onClick={() => handleDownloadFile(finance.id)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="Descargar archivo"
                                >
                                    <FiDownload className="h-5 w-5" />
                                </button>
                            ) : (
                                <span className="text-gray-400">N/A</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                                onClick={() => handleViewDetails(finance)}
                                className="text-green-600 hover:text-green-900 mr-2"
                                title="Ver detalles"
                            >
                                <FiEye className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleEditItem(finance)}
                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                title="Editar"
                            >
                                <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteItem(finance.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                            >
                                <FiTrash2 className="h-5 w-5" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

FinanceTable.propTypes = {
    finances: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        descripcion: PropTypes.string.isRequired,
        monto: PropTypes.number.isRequired,
        tipo: PropTypes.oneOf(['ingreso', 'gasto']).isRequired,
        fecha: PropTypes.string.isRequired,
        categoria: PropTypes.string,
        factura_pdf: PropTypes.string,
        factura_xml: PropTypes.string,
        archivo_prueba: PropTypes.string
    })).isRequired,
    handleEditItem: PropTypes.func.isRequired,
    handleDeleteItem: PropTypes.func.isRequired,
    handleDownloadFile: PropTypes.func.isRequired,
    handleViewDetails: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        color: PropTypes.string
    })).isRequired
};

export default FinanceTable;