import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/ui/Modal';
import { FiDollarSign, FiCalendar, FiTag, FiFileText, FiDownload, FiPrinter } from 'react-icons/fi';
import { formatDate, formatNumber } from '../../utils/formatters';

const FinanceDetailModal = ({ finance, onClose, onDownloadFile }) => {
    const IconWrapper = ({ icon: Icon, text, color = "text-gray-700" }) => (
        <div className={`flex items-center mb-3 ${color}`}>
            <Icon className="mr-2 text-xl" />
            <span className="text-sm">{text}</span>
        </div>
    );

    const footerContent = (
        <div className="flex justify-end gap-2 sm:gap-4">
            <button
                onClick={() => {/* Implementar función de impresión */}}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center text-sm"
            >
                <FiPrinter className="mr-2" />
                Imprimir Detalle
            </button>
            <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 flex items-center text-sm"
            >
                Cerrar
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Detalles del Movimiento Financiero"
            footer={footerContent}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Información General</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <IconWrapper
                                icon={FiDollarSign}
                                text={`Monto: ${formatNumber(Math.abs(finance.monto))}`}
                                color={finance.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}
                            />
                            <IconWrapper icon={FiCalendar} text={`Fecha: ${formatDate(finance.fecha)}`} />
                            <IconWrapper icon={FiTag} text={`Tipo: ${finance.tipo.charAt(0).toUpperCase() + finance.tipo.slice(1)}`} />
                            <IconWrapper icon={FiTag} text={`Categoría: ${finance.categoria || 'No especificada'}`} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 text-sm">{finance.descripcion}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Archivos Adjuntos</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {finance.factura_pdf && (
                                <IconWrapper
                                    icon={FiFileText}
                                    text={
                                        <button
                                            onClick={() => onDownloadFile(finance.id, 'pdf')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Descargar Factura PDF
                                        </button>
                                    }
                                />
                            )}
                            {finance.factura_xml && (
                                <IconWrapper
                                    icon={FiFileText}
                                    text={
                                        <button
                                            onClick={() => onDownloadFile(finance.id, 'xml')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Descargar Factura XML
                                        </button>
                                    }
                                />
                            )}
                            {finance.archivo_prueba && (
                                <IconWrapper
                                    icon={FiFileText}
                                    text={
                                        <button
                                            onClick={() => onDownloadFile(finance.id, 'prueba')}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Descargar Archivo de Prueba
                                        </button>
                                    }
                                />
                            )}
                            {!finance.factura_pdf && !finance.factura_xml && !finance.archivo_prueba && (
                                <p className="text-gray-500 text-sm">No hay archivos adjuntos</p>
                            )}
                        </div>
                    </div>
                    {finance.comentarios && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Comentarios</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 text-sm">{finance.comentarios}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </Modal>
    );
};

FinanceDetailModal.propTypes = {
    finance: PropTypes.shape({
        id: PropTypes.number.isRequired,
        descripcion: PropTypes.string.isRequired,
        monto: PropTypes.number.isRequired,
        tipo: PropTypes.oneOf(['ingreso', 'gasto']).isRequired,
        fecha: PropTypes.string.isRequired,
        categoria: PropTypes.string,
        factura_pdf: PropTypes.string,
        factura_xml: PropTypes.string,
        archivo_prueba: PropTypes.string,
        comentarios: PropTypes.string
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onDownloadFile: PropTypes.func.isRequired
};

export default FinanceDetailModal;