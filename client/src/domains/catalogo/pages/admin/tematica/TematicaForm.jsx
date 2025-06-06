import React from 'react';
import { FiTag, FiFileText } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import CloudinaryImageSelector from '@/components/cloudinary/CloudinaryImageSelector';

const TematicaForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: editingItem || {}
    });
    
    const foto = watch('foto');

    const onSubmit = (data) => {
        onSave(data);
    };

    // Manejar cambios en la imagen
    const handleImageChange = (imageUrl) => {
        setValue('foto', imageUrl);
    };

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('nombre', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre de la temática"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        {...register('descripcion')}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Descripción de la temática"
                    ></textarea>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <CloudinaryImageSelector 
                    value={foto} 
                    onChange={handleImageChange}
                    previewSize="medium"
                    placeholder="URL de la imagen de la temática"
                />
            </div>
        </form>
    );
};

export default TematicaForm;