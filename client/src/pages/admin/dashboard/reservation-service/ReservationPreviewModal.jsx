import React from 'react';
import PropTypes from 'prop-types';
// Usar el alias @ para garantizar resolución correcta en Docker
import Modal from '@/components/ui/Modal';
import { 
    FiCalendar, FiUser, FiPhone, FiMail, FiPackage, 
    FiClock, FiDollarSign, FiImage, FiInfo, FiCoffee 
} from 'react-icons/fi';
import { formatDate, formatTime, formatNumber } from '@/utils/formatters';

const ReservationPreviewModal = ({ reservation, onClose }) => {
    const InfoItem = ({ icon: Icon, label, value, color = "text-gray-500" }) => (
        <div className="flex items-center mb-3 last:mb-0 group">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color} bg-opacity-10 mr-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
        </div>
    );

    const Section = ({ title, children, icon: Icon }) => (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-3">
                <Icon className="w-5 h-5 text-indigo-500 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Vista Rápida - Reserva #${reservation.id}`}
            size="md"
            className="animate-modalEntry"
            overlayClassName="backdrop-blur-sm bg-black/30 animate-fadeIn"
        >
            <style jsx global>{`
                @keyframes modalEntry {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        backdrop-filter: blur(0px);
                    }
                    to {
                        opacity: 1;
                        backdrop-filter: blur(8px);
                    }
                }
                
                .animate-modalEntry {
                    animation: modalEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información del Evento */}
                <Section title="Información del Evento" icon={FiCalendar}>
                    <InfoItem 
                        icon={FiUser} 
                        label="Festejado"
                        value={`${reservation.nombre_festejado} (${reservation.edad_festejado} años)`}
                        color="text-blue-500"
                    />
                    <InfoItem 
                        icon={FiCalendar} 
                        label="Fecha"
                        value={formatDate(reservation.fecha_reserva)}
                        color="text-purple-500"
                    />
                    <InfoItem 
                        icon={FiClock} 
                        label="Horario"
                        value={`${formatTime(reservation.hora_inicio)} - ${formatTime(reservation.hora_fin)}`}
                        color="text-green-500"
                    />
                    <InfoItem 
                        icon={FiDollarSign} 
                        label="Total"
                        value={formatNumber(reservation.total)}
                        color="text-emerald-500"
                    />
                </Section>

                {/* Detalles del Paquete */}
                <Section title="Detalles del Paquete" icon={FiPackage}>
                    <InfoItem 
                        icon={FiPackage} 
                        label="Paquete"
                        value={reservation.paquete?.nombre || 'No especificado'}
                        color="text-orange-500"
                    />
                    <InfoItem 
                        icon={FiImage} 
                        label="Temática"
                        value={reservation.tematica?.nombre || 'No especificada'}
                        color="text-pink-500"
                    />
                    {reservation.opcion_alimento && (
                        <InfoItem 
                            icon={FiCoffee} 
                            label="Opción de Alimentos"
                            value={reservation.opcion_alimento.nombre}
                            color="text-yellow-500"
                        />
                    )}
                </Section>

                {/* Estado y Comentarios */}
                <div className="md:col-span-2">
                    <Section title="Estado y Comentarios" icon={FiInfo}>
                        <div className="flex items-center mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                !reservation.estado ? 'bg-gray-100 text-gray-800' :
                                reservation.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                reservation.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {reservation.estado ? 
                                    (reservation.estado.charAt(0).toUpperCase() + reservation.estado.slice(1)) :
                                    'No especificado'
                                }
                            </span>
                        </div>
                        {reservation.comentarios && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {reservation.comentarios}
                            </p>
                        )}
                    </Section>
                </div>
            </div>
        </Modal>
    );
};

ReservationPreviewModal.propTypes = {
    reservation: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre_festejado: PropTypes.string.isRequired,
        edad_festejado: PropTypes.number.isRequired,
        fecha_reserva: PropTypes.string.isRequired,
        hora_inicio: PropTypes.string.isRequired,
        hora_fin: PropTypes.string.isRequired,
        estado: PropTypes.oneOf(['pendiente', 'confirmada', 'cancelada']),
        total: PropTypes.number.isRequired,
        comentarios: PropTypes.string,
        paquete: PropTypes.shape({
            nombre: PropTypes.string,
            descripcion: PropTypes.string
        }),
        tematica: PropTypes.shape({
            nombre: PropTypes.string
        }),
        opcion_alimento: PropTypes.shape({
            nombre: PropTypes.string
        })
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default ReservationPreviewModal;