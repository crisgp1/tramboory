import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/ui/Modal';
import { FiDollarSign, FiCalendar, FiTag, FiFileText, FiDownload, FiPrinter, FiEye, FiCode, FiFile } from 'react-icons/fi';
import ReservationPreviewModal from './ReservationPreviewModal';
import { formatDate, formatNumber } from '../../utils/formatters';
import CloudinaryFileSelector from '../../components/CloudinaryFileSelector';

const FinanceDetailModal = ({ finance, onClose }) => {
    const [showReservationPreview, setShowReservationPreview] = useState(false);
    const IconWrapper = ({ icon: Icon, text, color = "text-gray-700" }) => (
        <div className={`flex items-center mb-3 group hover:scale-[1.02] transition-all duration-200 ${color}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color} bg-opacity-10 mr-3`}>
                <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform duration-200`} />
            </div>
            <span className="text-sm font-medium">{text}</span>
        </div>
    );

    const footerContent = (
        <div className="flex justify-end gap-2 sm:gap-4">
            <button
                onClick={() => {/* Implementar función de impresión */}}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center text-sm hover:shadow-md"
                title="Imprimir detalle del movimiento"
            >
                <FiPrinter className="mr-2" />
                Imprimir Detalle
            </button>
            <button
                onClick={onClose}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center text-sm border border-gray-300"
                title="Cerrar ventana"
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
            className="animate-modalEntry"
            overlayClassName="backdrop-blur-sm"
        >
            <style jsx global>{`
                @keyframes modalEntry {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-modalEntry {
                    animation: modalEntry 0.3s ease-out;
                }
            `}</style>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Información General</h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <IconWrapper
                                icon={FiDollarSign}
                                text={`Monto: ${formatNumber(Math.abs(finance.monto))}`}
                                color={finance.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}
                            />
                            <IconWrapper icon={FiCalendar} text={`Fecha: ${formatDate(finance.fecha)}`} />
                            <IconWrapper icon={FiTag} text={`Tipo: ${finance.tipo.charAt(0).toUpperCase() + finance.tipo.slice(1)}`} />
            <div className="flex items-center mb-3 group">
                <FiTag className="mr-2 text-xl text-gray-700 group-hover:text-indigo-500 transition-colors duration-200" />
                <span className="text-sm flex items-center">
                    Categoría: {finance.categoria ? (
                        <span className="flex items-center ml-1">
                            <span 
                                className="w-3 h-3 rounded-full mr-1 inline-block"
                                style={{ backgroundColor: finance.categoria.color }}
                            />
                            {finance.categoria.nombre}
                        </span>
                    ) : 'No especificada'}
                </span>
            </div>
            {finance.reserva && (
                <div 
                    className="flex items-center mb-3 text-blue-600 hover:text-blue-800 transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-95 hover:bg-blue-50/50 p-2 rounded-lg"
                    title="Ver detalles de la reserva"
                    onClick={() => setShowReservationPreview(true)}
                >
                    <FiEye className="mr-2 text-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                    <FiCalendar className="mr-2 text-xl group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                        Reserva: #{finance.reserva.id} - {finance.reserva.nombre_festejado}
                        <span className="text-gray-500 ml-2">
                            ({formatDate(finance.reserva.fecha_reserva)})
                        </span>
                    </span>
                </div>
            )}
            {showReservationPreview && finance.reserva && (
                <ReservationPreviewModal
                    reservation={finance.reserva}
                    onClose={() => setShowReservationPreview(false)}
                />
            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción</h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                            <p className="text-gray-700 text-sm">{finance.descripcion}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Archivos Adjuntos</h3>
                        <div className="space-y-4">
                            {finance.factura_pdf && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                        <FiFileText className="mr-2 text-indigo-600" />
                                        Factura PDF
                                    </h4>
                                    <CloudinaryFileSelector
                                        value={finance.factura_pdf}
                                        readOnly={true}
                                        icon={FiFileText}
                                        acceptTypes="application/pdf"
                                        showPreview={true}
                                    />
                                </div>
                            )}
                            
                            {finance.factura_xml && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                        <FiCode className="mr-2 text-indigo-600" />
                                        Factura XML
                                    </h4>
                                    <CloudinaryFileSelector
                                        value={finance.factura_xml}
                                        readOnly={true}
                                        icon={FiCode}
                                        acceptTypes="application/xml"
                                        showPreview={true}
                                    />
                                </div>
                            )}
                            
                            {finance.archivo_prueba && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                        <FiFile className="mr-2 text-indigo-600" />
                                        Archivo de Prueba
                                    </h4>
                                    <CloudinaryFileSelector
                                        value={finance.archivo_prueba}
                                        readOnly={true}
                                        icon={FiFile}
                                        acceptTypes="application/pdf,image/jpeg,image/png"
                                        showPreview={true}
                                    />
                                </div>
                            )}
                            
                            {!finance.factura_pdf && !finance.factura_xml && !finance.archivo_prueba && (
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                    <p className="text-gray-500 text-sm">No hay archivos adjuntos</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {finance.comentarios && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Comentarios</h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
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
        categoria: PropTypes.shape({
            id: PropTypes.number,
            nombre: PropTypes.string,
            color: PropTypes.string
        }),
        reserva: PropTypes.shape({
            id: PropTypes.number,
            nombre_festejado: PropTypes.string,
            fecha_reserva: PropTypes.string,
            estado: PropTypes.string,
            hora_inicio: PropTypes.string,
            hora_fin: PropTypes.string,
            total: PropTypes.number,
            comentarios: PropTypes.string,
            edad_festejado: PropTypes.number
        }),
        factura_pdf: PropTypes.string,
        factura_xml: PropTypes.string,
        archivo_prueba: PropTypes.string,
        comentarios: PropTypes.string
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default FinanceDetailModal;