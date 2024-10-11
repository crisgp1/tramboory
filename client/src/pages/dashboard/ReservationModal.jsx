import  { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiCalendar, FiClock, FiDollarSign, FiUser, FiPackage,
    FiMail, FiPhone, FiGift,
      FiCheckCircle, FiXCircle, FiPrinter,
    FiAlertCircle
} from 'react-icons/fi';
import PrintableReservation from '../../components/PrintableReservation';
import axiosInstance from '../../components/axiosConfig';
import { toast } from 'react-toastify';

const ReservationModal = ({ reservation, onClose, onSendEmail, onContactUser, onStatusChange }) => {
    const [status, setStatus] = useState(reservation.estado);

    if (!reservation) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('printable-reservation');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        winPrint.document.write(printContent.innerHTML);
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axiosInstance.put(`/api/reservas/${reservation.id}/status`, { estado: newStatus });
            setStatus(newStatus);
            onStatusChange(newStatus);
            toast.success(`Estado de la reserva actualizado a ${newStatus}`);
        } catch (error) {
            console.error('Error al actualizar el estado de la reserva:', error);
            toast.error('Error al actualizar el estado de la reserva');
        }
    };

    const IconWrapper = ({ icon: Icon, text, color = "text-gray-700" }) => (
        <div className={`flex items-center mb-3 ${color}`}>
            <Icon className="mr-2 text-xl" />
            <span className="text-sm">{text}</span>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente':
                return 'text-yellow-500';
            case 'confirmada':
                return 'text-green-500';
            case 'cancelada':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8"
            >
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Detalles de la Reserva</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition duration-300">
                        <FiXCircle size={24} />
                    </button>
                </div>

                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Información General</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <IconWrapper icon={FiCalendar} text={`Fecha: ${new Date(reservation.fecha_reserva).toLocaleDateString()}`} />
                                    <IconWrapper icon={FiClock} text={`Hora: ${reservation.hora_inicio}`} />
                                    <IconWrapper icon={FiDollarSign} text={`Total: $${reservation.total}`} />
                                    <IconWrapper icon={FiPackage} text={`Paquete: ${reservation.nombre_paquete}`} />
                                    <IconWrapper
                                        icon={FiAlertCircle}
                                        text={`Estado: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                                        color={getStatusColor(status)}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles del Cliente</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <IconWrapper icon={FiUser} text={`Cliente: ${reservation.nombre_cliente}`} />
                                    <IconWrapper icon={FiPhone} text={`Teléfono: ${reservation.telefono_cliente || 'No especificado'}`} />
                                    <IconWrapper icon={FiMail} text={`Email: ${reservation.email_cliente || 'No especificado'}`} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles del Evento</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <IconWrapper icon={FiUser} text={`Festejado: ${reservation.nombre_festejado}`} />
                                    <IconWrapper icon={FiGift} text={`Edad: ${reservation.edad_festejado} años`} />
                                    <IconWrapper icon={FiGift} text={`Temática: ${reservation.tematica || 'No especificada'}`} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Extras</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Cupcake', 'Mampara', 'Piñata'].map((item) => (
                                        <div key={item} className={`flex items-center p-2 rounded-md ${reservation[item.toLowerCase()] ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {reservation[item.toLowerCase()] ?
                                                <FiCheckCircle className="text-green-600 mr-2" /> :
                                                <FiXCircle className="text-red-600 mr-2" />
                                            }
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Comentarios</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 text-sm">{reservation.comentarios || 'Sin comentarios'}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Cambiar Estado de la Reserva</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleStatusChange('pendiente')}
                                className={`px-4 py-2 rounded ${
                                    status === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                Pendiente
                            </button>
                            <button
                                onClick={() => handleStatusChange('confirmada')}
                                className={`px-4 py-2 rounded ${
                                    status === 'confirmada' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                Confirmada
                            </button>
                            <button
                                onClick={() => handleStatusChange('cancelada')}
                                className={`px-4 py-2 rounded ${
                                    status === 'cancelada' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                Cancelada
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-wrap justify-end gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiPrinter className="mr-2" />
                        Imprimir Reserva
                    </button>
                    <button
                        onClick={() => onSendEmail(reservation)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiMail className="mr-2" />
                        Enviar por Correo
                    </button>
                    <button
                        onClick={() => onContactUser(reservation)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiPhone className="mr-2" />
                        Contactar Cliente
                    </button>
                </div>
            </motion.div>
            <div id="printable-reservation" className="hidden">
                <PrintableReservation reservation={reservation} />
            </div>
        </div>
    );
};

export default ReservationModal;