import { motion } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';

const TuesdayModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center mb-4">
          <FiAlertCircle className="text-yellow-500 text-2xl mr-2" />
          <h2 className="text-xl font-semibold">Reserva en Martes</h2>
        </div>
        <p className="mb-4">
          Has seleccionado un martes para tu reserva. Se aplicará una tarifa adicional de 1500 pesos mexicanos. ¿Deseas continuar?
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Continuar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TuesdayModal;