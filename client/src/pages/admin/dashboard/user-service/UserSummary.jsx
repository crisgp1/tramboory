import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiUserCheck } from 'react-icons/fi';

const UserSummary = ({ users }) => {
    // Calcular estadísticas de usuarios
    const activeUsers = users.filter(user => user.activo).length;
    const adminUsers = users.filter(user => user.rol === 'admin').length;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Usuarios</h2>
                    <div className="p-2 rounded-full bg-white/20 text-white">
                        <FiUsers className="w-5 h-5" />
                    </div>
                </div>
            </div>
            
            {/* Contenido */}
            <div className="p-6">
                <p className="text-4xl font-bold text-indigo-600">{users.length}</p>
                <p className="text-sm text-gray-500 mb-4">usuarios registrados</p>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                            <FiUserCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{activeUsers}</p>
                            <p className="text-xs text-gray-500">Activos</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                            <FiUserPlus className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{adminUsers}</p>
                            <p className="text-xs text-gray-500">Administradores</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserSummary;
