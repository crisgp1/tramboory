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
            <div className="p-4 md:p-6">
                <div className="flex flex-col items-center text-center mb-4 md:mb-6">
                    <p className="text-3xl md:text-4xl font-bold text-indigo-600">{users.length}</p>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">usuarios registrados</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-2 md:mb-3">
                            <FiUserCheck className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">{activeUsers}</p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Activos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-2 md:mb-3">
                            <FiUserPlus className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">{adminUsers}</p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Administradores</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserSummary;
