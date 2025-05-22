import { FiPackage, FiFileText, FiDollarSign, FiToggleRight } from 'react-icons/fi';
import { useForm } from 'react-hook-form';

const PackageForm = ({ editingItem, onSave, activeTab }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const errors = {};
        onSave(data);
    };

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Paquete</label>
                <div className="relative">
                    <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="nombre"
                        type="text"
                        defaultValue={editingItem?.nombre || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del paquete"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        name="descripcion"
                        defaultValue={editingItem?.descripcion || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Descripción detallada del paquete"
                    ></textarea>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Lunes a Jueves</label>
                <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="precio_lunes_jueves"
                        type="number"
                        step="0.01"
                        defaultValue={editingItem?.precio_lunes_jueves || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Precio de lunes a jueves"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Viernes a Domingo</label>
                <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="precio_viernes_domingo"
                        type="number"
                        step="0.01"
                        defaultValue={editingItem?.precio_viernes_domingo || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Precio de viernes a domingo"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Paquete</label>
                <div className="relative">
                    <FiToggleRight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        name="activo"
                        defaultValue={editingItem?.activo !== undefined ? editingItem.activo : 1}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={1}>Activo</option>
                        <option value={0}>Inactivo</option>
                    </select>
                </div>
            </div>
        </form>
    );
};

export default PackageForm;