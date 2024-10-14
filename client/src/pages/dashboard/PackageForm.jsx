import { FiPackage, FiFileText, FiDollarSign, FiClock, FiUsers, FiCalendar, FiImage, FiToggleRight } from 'react-icons/fi';
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
        <form  id={activeTab + 'Form'} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base</label>
                <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="precio"
                        type="number"
                        step="0.01"
                        defaultValue={editingItem?.precio || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Precio base del paquete"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="duracion"
                        type="number"
                        step="0.5"
                        defaultValue={editingItem?.duracion || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Duración del evento"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="capacidad_maxima"
                        type="number"
                        defaultValue={editingItem?.capacidad_maxima || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número máximo de invitados"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        name="disponibilidad"
                        defaultValue={editingItem?.disponibilidad || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar disponibilidad</option>
                        <option value="todos_los_dias">Todos los días</option>
                        <option value="fines_de_semana">Fines de semana</option>
                        <option value="entre_semana">Entre semana</option>
                        <option value="personalizado">Personalizado</option>
                    </select>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Paquete</label>
                <div className="relative">
                    <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        name="imagen"
                        type="file"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicios Incluidos</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Decoración', 'Catering', 'Música', 'Fotografía', 'Animación', 'Limpieza'].map((servicio) => (
                        <div key={servicio} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`servicio-${servicio}`}
                                name="servicios_incluidos"
                                value={servicio}
                                defaultChecked={editingItem?.servicios_incluidos?.includes(servicio)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`servicio-${servicio}`} className="ml-2 block text-sm text-gray-900">
                                {servicio}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Paquete</label>
                <div className="relative">
                    <FiToggleRight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        name="estado"
                        defaultValue={editingItem?.estado || 'activo'}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="temporal">Temporal</option>
                    </select>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        name="notas_adicionales"
                        defaultValue={editingItem?.notas_adicionales || ''}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Cualquier información adicional sobre el paquete"
                    ></textarea>
                </div>
            </div>
        </form>
    );

};
export default PackageForm;