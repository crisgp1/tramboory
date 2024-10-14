import { FiUser, FiMail, FiPhone, FiMapPin, FiKey, FiHash, FiUserCheck, FiLock, FiRefreshCw } from 'react-icons/fi';
import withValidation from '../../components/withValidation';

const Input = withValidation('input');
const Select = withValidation('select');

const UserForm = ({ editingItem, generatedPassword, generateRandomPassword, onSave, activeTab }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
    
        const errors = {};
    
        if (!data.nombre) errors.nombre = 'El nombre es requerido';
        if (!data.email) errors.email = 'El email es requerido';
        if (!data.tipo_usuario) errors.tipo_usuario = 'El tipo de usuario es requerido';
        if (!editingItem && !data.clave && !generatedPassword) errors.clave = 'La contraseña es requerida para nuevos usuarios';
    
        if (Object.keys(errors).length > 0) {
            console.log(errors);
            return;
        }
    
        if (generatedPassword) {
            data.clave = generatedPassword;
        }
    
        onSave(data);
    };
    

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="nombre"
                        placeholder="Nombre completo"
                        defaultValue={editingItem?.nombre || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        isRequired
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        defaultValue={editingItem?.email || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        isRequired
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="telefono"
                        placeholder="Número de teléfono"
                        defaultValue={editingItem?.telefono || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="direccion"
                        placeholder="Dirección completa"
                        defaultValue={editingItem?.direccion || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Personalizado</label>
                <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="id_personalizado"
                        placeholder="ID único"
                        defaultValue={editingItem?.id_personalizado || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
                <div className="relative">
                    <FiUserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Select
                        name="tipo_usuario"
                        defaultValue={editingItem?.tipo_usuario || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        isRequired
                    >
                        <option value="">Seleccionar tipo de usuario</option>
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                    </Select>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        name="clave"
                        type="password"
                        placeholder="Contraseña"
                        defaultValue={generatedPassword || editingItem?.clave || ''}
                        className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        isRequired={!editingItem}
                    />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2">
                <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 flex items-center justify-center"
                >
                    <FiRefreshCw className="mr-2" />
                    Generar contraseña aleatoria
                </button>
            </div>

            {generatedPassword && (
                <div className="col-span-1 md:col-span-2 mt-2 p-2 bg-green-100 border border-green-300 rounded-md">
                    <p className="text-green-800 flex items-center">
                        <FiKey className="mr-2" />
                        Contraseña generada: <strong className="ml-2">{generatedPassword}</strong>
                    </p>
                </div>
            )}
        </form>
    );
};

export default UserForm;