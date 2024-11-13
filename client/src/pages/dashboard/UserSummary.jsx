import { motion } from 'framer-motion';
import { FiUsers } from 'react-icons/fi';

const UserSummary = ({ users }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Usuarios</h2>
            <FiUsers className="text-3xl text-indigo-500" />
        </div>
        <p className="text-4xl font-bold text-indigo-600">{users.length}</p>
    </motion.div>
);

export default UserSummary;
