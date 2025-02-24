import { motion } from 'framer-motion';
import { FiBox, FiLoader } from 'react-icons/fi';

const InventoryLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-95">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-indigo-600"
          >
            <FiLoader className="w-12 h-12" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <FiBox className="w-6 h-6 text-indigo-800" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Cargando Inventario
          </h2>
          <p className="text-sm text-gray-600">
            Preparando el sistema...
          </p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="h-1 bg-indigo-600 mt-6 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default InventoryLoader;