import React from 'react';
import { useForm } from 'react-hook-form';
import { FaBirthdayCake } from 'react-icons/fa';
import { FiBox, FiCalendar, FiCheckCircle, FiClock, FiCoffee, FiDollarSign, FiGift, FiImage, FiMessageSquare, FiPackage, FiUser } from 'react-icons/fi';

const ReservationForm = ({ initialData, onSubmit, users, packages }) => {
    const { register, handleSubmit, setValue } = useForm({ defaultValues: initialData });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                    <FiUser className="mr-2 text-indigo-600" />
                    <select {...register('id_usuario')} className="w-full p-2 border rounded">
                        <option value="">Seleccionar usuario</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <FiPackage className="mr-2 text-indigo-600" />
                    <select
                        {...register('id_paquete')}
                        className="w-full p-2 border rounded"
                        onChange={(e) => setValue('total', packages.find((p) => p.id === parseInt(e.target.value))?.precio || 0)}
                    >
                        <option value="">Seleccionar paquete</option>
                        {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                                {pkg.nombre} - ${pkg.precio}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <FiCalendar className="mr-2 text-indigo-600" />
                    <input {...register('fecha_reserva')} type="date" className="w-full p-2 border rounded" />
                </div>
                <div className="flex items-center">
                    <FiClock className="mr-2 text-indigo-600" />
                    <select {...register('hora_inicio')} className="w-full p-2 border rounded">
                        <option value="">Seleccionar hora</option>
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <FiCheckCircle className="mr-2 text-indigo-600" />
                    <select {...register('estado')} className="w-full p-2 border rounded">
                        <option value="">Seleccionar estado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <FiDollarSign className="mr-2 text-indigo-600" />
                    <input
                        {...register('total')}
                        type="number"
                        step="0.01"
                        placeholder="Total"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex items-center">
                    <FiUser className="mr-2 text-indigo-600" />
                    <input
                        {...register('nombre_festejado')}
                        placeholder="Nombre del festejado"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex items-center">
                    <FaBirthdayCake className="mr-2 text-indigo-600" />
                    <input
                        {...register('edad_festejado')}
                        type="number"
                        placeholder="Edad del festejado"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex items-center">
                    <FiGift className="mr-2 text-indigo-600" />
                    <input
                        {...register('tematica')}
                        placeholder="Temática"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <FiCoffee className="mr-2 text-indigo-600" />
                        <input {...register('cupcake')} type="checkbox" className="mr-2" />
                        <label>Cupcake</label>
                    </div>
                    <div className="flex items-center">
                        <FiImage className="mr-2 text-indigo-600" />
                        <input {...register('mampara')} type="checkbox" className="mr-2" />
                        <label>Mampara</label>
                    </div>
                    <div className="flex items-center">
                        <FiBox className="mr-2 text-indigo-600" />
                        <input {...register('piñata')} type="checkbox" className="mr-2" />
                        <label>Piñata</label>
                    </div>
                </div>
                <div className="col-span-2 flex items-start">
                    <FiMessageSquare className="mr-2 text-indigo-600 mt-1" />
                    <textarea
                        {...register('comentarios')}
                        placeholder="Comentarios"
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    {initialData ? 'Actualizar' : 'Crear'} Reserva
                </button>
            </div>
        </form>
    );
};

export default ReservationForm;