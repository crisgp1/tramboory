import React from 'react';
import {
    FiBox,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiCoffee,
    FiDollarSign,
    FiGift,
    FiImage,
    FiMessageSquare,
    FiPackage,
    FiUser,
    FiX
} from 'react-icons/fi';
import {FaBirthdayCake} from 'react-icons/fa';

const ReservationModal = ({reservation, isOpen, onClose}) => {
    if (!isOpen || !reservation) return null;

    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Detalles de la Reserva</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24}/>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex items-center">
                        <FiCalendar className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Nº Reserva:</span>
                        <span className="ml-2">{reservation.id}</span>
                    </div>
                    <div className="flex items-center">
                        <FiUser className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Cliente:</span>
                        <span className="ml-2">{reservation.nombre_cliente}</span>
                    </div>
                    <div className="flex items-center">
                        <FiCalendar className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Fecha:</span>
                        <span className="ml-2">{reservation.fecha_reserva}</span>
                    </div>
                    <div className="flex items-center">
                        <FiClock className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Hora:</span>
                        <span className="ml-2">{reservation.hora_inicio}</span>
                    </div>
                    <div className="flex items-center">
                        <FiPackage className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Paquete:</span>
                        <span className="ml-2">{reservation.nombre_paquete}</span>
                    </div>
                    <div className="flex items-center">
                        <FiDollarSign className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Total:</span>
                        <span className="ml-2">${reservation.total}</span>
                    </div>
                    <div className="flex items-center">
                        <FiUser className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Festejado:</span>
                        <span className="ml-2">{reservation.nombre_festejado}</span>
                    </div>
                    <div className="flex items-center">
                        <FaBirthdayCake className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Edad:</span>
                        <span className="ml-2">{reservation.edad_festejado} años</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                        <FiGift className="mr-2 text-indigo-600"/>
                        <span className="font-semibold">Temática:</span>
                        <span className="ml-2">{reservation.tematica}</span>
                    </div>
                    <div className="flex items-center">
                        <FiCheckCircle
                            className={mr - 2 ${reservation.cupcake ? 'text-green-600' : 'text-red-600'}}
                        />
                        <span className="font-semibold">Cupcake:</span>
                        <span className="ml-2">{reservation.cupcake ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center">
                        <FiCheckCircle
                            className={mr - 2 ${reservation.mampara ? 'text-green-600' : 'text-red-600'}}
                        />
                        <span className="font-semibold">Mampara:</span>
                        <span className="ml-2">{reservation.mampara ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center">
                        <FiCheckCircle
                            className={mr - 2 ${reservation.piñata ? 'text-green-600' : 'text-red-600'}}
                        />
                        <span className="font-semibold">Piñata:</span>
                        <span className="ml-2">{reservation.piñata ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="col-span-2 flex items-start">
                        <FiMessageSquare className="mr-2 text-indigo-600 mt-1"/>
                        <span className="font-semibold">Comentarios:</span>
                        <span className="ml-2">{reservation.comentarios || 'Sin comentarios'}</span>
                    </div>
                </div>
            </div>
        </div>);
};
export default ReservationModal;