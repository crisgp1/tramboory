import React, { useEffect } from 'react';
import { FiDollarSign, FiGrid } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import CloudinaryImageSelector from '@shared/components/cloudinary/CloudinaryImageSelector';

const MamparaForm = ({ editingItem, onSave, activeTab, tematicas }) => {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: editingItem || {}
  });
  
  const foto = watch('foto');

  // Establecer el select de temática cuando se está editando
  useEffect(() => {
    if (editingItem && editingItem.id_tematica) {
      const tematicaOption = tematicas.find(t => t.id === editingItem.id_tematica);
      if (tematicaOption) {
        setValue('id_tematica', { value: tematicaOption.id, label: tematicaOption.nombre });
      }
    }
  }, [editingItem, tematicas, setValue]);

  // Manejar cambios en la imagen
  const handleImageChange = (imageUrl) => {
    setValue('foto', imageUrl);
  };

  const onSubmit = (data) => {
    // Extraer el valor de id_tematica del objeto select
    const adjustedData = {
      ...data,
      id_tematica: data.id_tematica ? data.id_tematica.value : null,
    };
    onSave(adjustedData);
  };

  return (
    <form id={activeTab + 'Form'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Piezas</label>
        <div className="relative">
          <FiGrid className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            {...register('piezas', { required: 'Este campo es requerido', valueAsNumber: true })}
            type="number"
            className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Número de piezas"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
        <div className="relative">
          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            {...register('precio', { required: 'Este campo es requerido', valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Precio de la mampara"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Temática</label>
        <div className="relative">
          <Controller
            name="id_tematica"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Select
                {...field}
                options={tematicas?.map(tematica => ({
                  value: tematica.id,
                  label: tematica.nombre,
                })) || []}
                placeholder="Seleccionar temática"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
        <CloudinaryImageSelector 
          value={foto} 
          onChange={handleImageChange}
          previewSize="medium"
          placeholder="URL de la imagen de la mampara"
        />
      </div>
    </form>
  );
};

export default MamparaForm;