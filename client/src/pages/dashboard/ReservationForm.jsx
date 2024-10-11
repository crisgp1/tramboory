import React from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiPackage, FiCalendar, FiClock, FiCheckCircle, FiDollarSign, FiGift, FiCoffee, FiImage, FiBox, FiMessageSquare, FiTag, FiPercent } from 'react-icons/fi';
import { FaBirthdayCake } from "react-icons/fa";
import CurrencyInput from '../../components/CurrencyInput';

const ReservationForm = ({ editingItem, users, packages, onSave }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: editingItem || {}
    });

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        {...register('id_usuario', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Seleccionar usuario</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.nombre}</option>
                        ))}
                    </select>
                </div>
                {errors.id_usuario && <span className="text-red-500 text-sm">{errors.id_usuario.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paquete</label>
                <div className="relative">
                    <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        {...register('id_paquete', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Seleccionar paquete</option>
                        {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>{pkg.nombre}</option>
                        ))}
                    </select>
                </div>
                {errors.id_paquete && <span className="text-red-500 text-sm">{errors.id_paquete.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reserva</label>
                <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="date"
                        {...register('fecha_reserva', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {errors.fecha_reserva && <span className="text-red-500 text-sm">{errors.fecha_reserva.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio</label>
                <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        {...register('hora_inicio', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Seleccionar hora</option>
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                    </select>
                </div>
                {errors.hora_inicio && <span className="text-red-500 text-sm">{errors.hora_inicio.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <CurrencyInput
                        name="total"
                        {...register('total', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {errors.total && <span className="text-red-500 text-sm">{errors.total.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Festejado</label>
                <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        {...register('nombre_festejado', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre del festejado"
                    />
                </div>
                {errors.nombre_festejado && <span className="text-red-500 text-sm">{errors.nombre_festejado.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad del Festejado</label>
                <div className="relative">
                    <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="number"
                        {...register('edad_festejado', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Edad"
                    />
                </div>
                {errors.edad_festejado && <span className="text-red-500 text-sm">{errors.edad_festejado.message}</span>}
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Temática</label>
                <div className="relative">
                    <FiGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        {...register('tematica')}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Temática de la fiesta"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('cupcake')}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Cupcake</span>
                    </label>
                </div>
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('mampara')}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mampara</span>
                    </label>
                </div>
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            {...register('piñata')}
                            className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Piñata</span>
                    </label>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        {...register('comentarios')}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Comentarios adicionales"
                    ></textarea>
                </div>
            </div>
        </form>
    );
}

export default ReservationForm;