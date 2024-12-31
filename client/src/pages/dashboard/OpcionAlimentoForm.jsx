import React from 'react';
import { FiTag, FiFileText, FiDollarSign, FiClock, FiCheckSquare } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const OpcionAlimentoForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: editingItem || {
            precio_adulto: 0,
            precio_nino: 0,
            precio_extra: 0,
            precio_papas: 19.00,
            disponible: true,
            opcion_papas: false,
            turno: 'ambos'
        }
    });

    const opcionPapas = watch('opcion_papas', false);

    const onSubmit = (data) => {
        const formData = {
            ...data,
            precio_adulto: Number(data.precio_adulto) || 0,
            precio_nino: Number(data.precio_nino) || 0,
            precio_extra: Number(data.precio_extra) || 0,
            precio_papas: data.opcion_papas ? (Number(data.precio_papas) || 19.00) : 19.00,
            disponible: Boolean(data.disponible),
            opcion_papas: Boolean(data.opcion_papas),
            activo: true
        };
        
        onSave(formData);
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
                    {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
                </div>
            </div>

            {/* Sección de Precios */}
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Precios</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Adulto</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                {...register('precio_adulto', { 
                                    required: 'Este campo es requerido',
                                    min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Precio por adulto"
                            />
                            {errors.precio_adulto && <span className="text-red-500 text-sm">{errors.precio_adulto.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Niño</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                {...register('precio_nino', { 
                                    required: 'Este campo es requerido',
                                    min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Precio por niño"
                            />
                            {errors.precio_nino && <span className="text-red-500 text-sm">{errors.precio_nino.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Extra</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                {...register('precio_extra', { 
                                    required: 'Este campo es requerido',
                                    min: { value: 0, message: 'El precio debe ser mayor o igual a 0' },
                                    valueAsNumber: true
                                })}
                                type="number"
                                step="0.01"
                                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Precio extra"
                            />
                            {errors.precio_extra && <span className="text-red-500 text-sm">{errors.precio_extra.message}</span>}
                        </div>
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
                        <option value="manana">Mañana</option>
                        <option value="tarde">Tarde</option>
                        <option value="ambos">Ambos</option>
                    </select>
                    {errors.turno && <span className="text-red-500 text-sm">{errors.turno.message}</span>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                <div className="relative">
                    <select
                        {...register('disponible')}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="true">Disponible</option>
                        <option value="false">No Disponible</option>
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
                    {errors.platillo_adulto && <span className="text-red-500 text-sm">{errors.platillo_adulto.message}</span>}
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
                    {errors.platillo_nino && <span className="text-red-500 text-sm">{errors.platillo_nino.message}</span>}
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                    <input
                        {...register('opcion_papas')}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                        Incluye opción de papas
                    </label>
                </div>
                {opcionPapas && (
                    <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            {...register('precio_papas', {
                                valueAsNumber: true,
                                min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                            })}
                            type="number"
                            step="0.01"
                            defaultValue={19.00}
                            className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Precio de las papas"
                        />
                        {errors.precio_papas && <span className="text-red-500 text-sm">{errors.precio_papas.message}</span>}
                    </div>
                )}
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