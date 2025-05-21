import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
    FiLock, FiPrinter, FiEdit, FiXCircle, FiPackage,
    FiDollarSign, FiClock, FiList, 
} from 'react-icons/fi';

// Componente para la versión imprimible
const PrintableUser = ({ user, reservations }) => {
    // Calcular estadísticas de reservas
    const totalReservations = reservations.length;
    const totalSpent = reservations.reduce((sum, res) => sum + res.total, 0);
    const lastReservation = reservations.length > 0 ? new Date(Math.max(...reservations.map(r => new Date(r.fecha_reserva)))) : null;

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
                Detalles del Usuario
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Información Personal</h2>
                <p><strong>Nombre:</strong> {user.nombre}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Teléfono:</strong> {user.telefono || 'No especificado'}</p>
                <p><strong>Dirección:</strong> {user.direccion || 'No especificada'}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Detalles de la Cuenta</h2>
                <p><strong>Fecha de registro:</strong> {new Date(user.fecha_registro).toLocaleDateString()}</p>
                <p><strong>Tipo de usuario:</strong> {user.tipo_usuario}</p>
                <p><strong>ID Personalizado:</strong> {user.id_personalizado || 'No asignado'}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Resumen de Reservas</h2>
                <p><strong>Total de Reservas:</strong> {totalReservations}</p>
                <p><strong>Total Gastado:</strong> ${totalSpent.toFixed(2)}</p>
                <p><strong>Última Reserva:</strong> {lastReservation ? lastReservation.toLocaleDateString() : 'N/A'}</p>
            </div>
            
            {reservations.length > 0 && (
                <div>
                    <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Últimas Reservas</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Reserva #</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Paquete</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Estado</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.slice(0, 5).map((reservation) => (
                                <tr key={reservation.id}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.id}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(reservation.fecha_reserva).toLocaleDateString()}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.nombre_paquete}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservation.estado}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>${reservation.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                <p>Documento generado el {new Date().toLocaleString()}</p>
                <p>TRAMBOORY - Sistema de Administración</p>
            </div>
        </div>
    );
};



const UserModal = ({ user, reservations, onClose, onEdit, onSendEmail }) => {
    if (!user) return null;
    
    // Add event listener for escape key
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleEscKey);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

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