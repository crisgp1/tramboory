import React from 'react';
import { FiTag, FiFileText, FiDollarSign, FiClock, FiCheckSquare } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const OpcionAlimentoForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit, watch } = useForm({
        defaultValues: editingItem || {
            precio_adulto: 0,
            precio_nino: 0
        }
    });

    const precioAdulto = watch('precio_adulto', 0);
    const precioNino = watch('precio_nino', 0);

    const onSubmit = (data) => {
        // Calcular el precio_extra como la suma de precio_adulto y precio_nino
        data.precio_extra = Number(data.precio_adulto) + Number(data.precio_nino);
        onSave(data);
    };

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('nombre', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre de la opción de alimento"
                    />
                </div>
            </div>

            {/* Sección de Precios */}
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Precios por Persona</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Adulto</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                {...register('precio_adulto', { 
                                    required: 'Este campo es requerido',
                                    min: 0,
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Precio por adulto"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Niño</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                {...register('precio_nino', { 
                                    required: 'Este campo es requerido',
                                    min: 0,
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Precio por niño"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-indigo-700">Precio Total por Persona:</span>
                        <span className="text-lg font-bold text-indigo-600">
                            ${(Number(precioAdulto) + Number(precioNino)).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        {...register('turno', { required: 'Este campo es requerido' })}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Seleccionar turno</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                        <option value="ambos">Ambos</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platillo Adulto</label>
                <div className="relative">
                    <FiCheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('platillo_adulto', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Platillo para adultos"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platillo Niño</label>
                <div className="relative">
                    <FiCheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('platillo_nino', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Platillo para niños"
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
                        placeholder="Descripción de la opción de alimento"
                    ></textarea>
                </div>
            </div>
        </form>
    );
};

export default OpcionAlimentoForm;