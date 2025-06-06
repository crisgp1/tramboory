import React from 'react';
import { FiTag, FiFileText, FiDollarSign } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const ExtraForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: editingItem || {}
    });

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('nombre', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre del extra"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('precio', { required: 'Este campo es requerido' })}
                        type="number"
                        step="0.01"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Precio del extra"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        {...register('descripcion')}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Descripción del extra"
                    ></textarea>
                </div>
            </div>
        </form>
    );
};

export default ExtraForm;