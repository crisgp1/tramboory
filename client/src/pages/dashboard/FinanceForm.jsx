import React from 'react';
import { useForm } from 'react-hook-form';

const FinanceForm = ({ initialData, onSubmit, reservations }) => {
    const { register, handleSubmit } = useForm({ defaultValues: initialData });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <select {...register('tipo')} className="w-full mb-2 p-2 border rounded">
                <option value="">Seleccionar tipo</option>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
            </select>
            <input
                {...register('monto')}
                type="number"
                step="0.01"
                placeholder="Monto"
                className="w-full mb-2 p-2 border rounded"
            />
            <input {...register('fecha')} type="date" className="w-full mb-2 p-2 border rounded" />
            <input
                {...register('descripcion')}
                placeholder="Descripción"
                className="w-full mb-2 p-2 border rounded"
            />
            <select {...register('id_reserva')} className="w-full mb-2 p-2 border rounded">
                <option value="">Sin reserva asociada</option>
                {reservations.map((reserva) => (
                    <option key={reserva.id} value={reserva.id}>
                        Reserva #{reserva.id} - {new Date(reserva.fecha_reserva).toLocaleDateString()}
                    </option>
                ))}
            </select>
            <div className="flex justify-end mt-4">
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    {initialData ? 'Actualizar' : 'Crear'} Registro Financiero
                </button>
            </div>
        </form>
    );
};

export default FinanceForm;