import React from 'react';
import { useForm } from 'react-hook-form';

const PackageForm = ({ initialData, onSubmit }) => {
    const { register, handleSubmit } = useForm({ defaultValues: initialData });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre
                </label>
                <input
                    {...register('nombre')}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                </label>
                <textarea
                    {...register('descripcion')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                    Precio
                </label>
                <input
                    {...register('precio')}
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div className="flex justify-end mt-4">
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    {initialData ? 'Actualizar' : 'Crear'} Paquete
                </button>
            </div>
        </form>
    );
};

export default PackageForm;