import React from 'react';
import { motion } from 'framer-motion';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiLock, FiPrinter, FiEdit, FiXCircle, FiPackage,
    FiDollarSign, FiClock, FiList
} from 'react-icons/fi';

const UserModal = ({ user, reservations, onClose, onEdit, onSendEmail }) => {
    if (!user) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('printable-user');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        winPrint.document.write(printContent.innerHTML);
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    const IconWrapper = ({ icon: Icon, text, color = "text-gray-700" }) => (
        <div className={`flex items-center mb-3 ${color}`}>
            <Icon className="mr-2 text-xl" />
            <span className="text-sm">{text}</span>
        </div>
    );

    // Calcular estadísticas de reservas
    const totalReservations = reservations.length;
    const totalSpent = reservations.reduce((sum, res) => sum + res.total, 0);
    const lastReservation = reservations.length > 0 ? new Date(Math.max(...reservations.map(r => new Date(r.fecha_reserva)))) : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8"
            >
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">Detalles del Usuario</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition duration-300">
                        <FiXCircle size={24} />
                    </button>
                </div>

                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Información Personal</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <IconWrapper icon={FiUser} text={`Nombre: ${user.nombre}`} />
                                    <IconWrapper icon={FiMail} text={`Email: ${user.email}`} />
                                    <IconWrapper icon={FiPhone} text={`Teléfono: ${user.telefono || 'No especificado'}`} />
                                    <IconWrapper icon={FiMapPin} text={`Dirección: ${user.direccion || 'No especificada'}`} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles de la Cuenta</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <IconWrapper icon={FiCalendar} text={`Fecha de registro: ${new Date(user.fecha_registro).toLocaleDateString()}`} />
                                    <IconWrapper icon={FiLock} text={`Tipo de usuario: ${user.tipo_usuario}`} />
                                    <IconWrapper icon={FiUser} text={`ID Personalizado: ${user.id_personalizado || 'No asignado'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Resumen de Reservas</h3>
                        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <IconWrapper icon={FiList} text={`Total de Reservas: ${totalReservations}`} color="text-blue-600" />
                            </div>
                            <div>
                                <IconWrapper icon={FiDollarSign} text={`Total Gastado: $${totalSpent.toFixed(2)}`} color="text-green-600" />
                            </div>
                            <div>
                                <IconWrapper icon={FiCalendar} text={`Última Reserva: ${lastReservation ? lastReservation.toLocaleDateString() : 'N/A'}`} color="text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Últimas Reservas</h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {reservations.slice(0, 5).map((reservation) => (
                                    <li key={reservation.id} className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                Reserva #{reservation.id}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    reservation.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                                                        reservation.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                    {reservation.estado}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <FiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {new Date(reservation.fecha_reserva).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <FiPackage className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {reservation.nombre_paquete}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <FiDollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                <p>
                                                    ${reservation.total}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-wrap justify-end gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiPrinter className="mr-2" />
                        Imprimir Detalles
                    </button>
                    <button
                        onClick={() => onEdit(user)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiEdit className="mr-2" />
                        Editar Usuario
                    </button>
                    <button
                        onClick={() => onSendEmail(user)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center text-sm"
                    >
                        <FiMail className="mr-2" />
                        Enviar Correo
                    </button>
                </div>
            </motion.div>
            <div id="printable-user" className="hidden">
                <PrintableUser user={user} reservations={reservations} />
            </div>
        </div>
    );
};

export default UserModal;