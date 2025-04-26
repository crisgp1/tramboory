import { FiTag, FiHash } from 'react-icons/fi';
import ColorPicker from '@/components/ColorPicker';
import { useForm } from 'react-hook-form';

const CategoriaForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: editingItem || {}
    });

    const onSubmit = (data) => {
        onSave(data);
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
                        placeholder="Nombre de la categoría"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <ColorPicker
                        {...register('color')}
                        defaultValue={editingItem?.color || '#000000'}
                    />
                </div>
            </div>
        </form>
    );
};

export default CategoriaForm;