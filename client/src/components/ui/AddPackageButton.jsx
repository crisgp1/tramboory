import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AddPackageButton = () => {
  const handleAddPackage = () => {
    // Implement modal opening logic here
    console.log('Agregar Package clicked');
    // Example: setIsModalOpen(true);
  };

  return (
    <motion.button
      onClick={handleAddPackage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
    >
      <FiPlus />
      <span>Agregar Package</span>
    </motion.button>
  );
};

export default AddPackageButton;