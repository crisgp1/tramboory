// PaymentModal.jsx

import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import PaymentForm from './PaymentForm';

export const PaymentModal = ({
  payment,
  isOpen,
  onClose,
  onUpdateStatus,
  onSavePayment,
  reservations,
  mode // 'add', 'edit', 'view'
}) => {
  if (!isOpen) return null;

  if (mode === 'add') {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Agregar Nuevo Pago</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
            >
              <FiX size={24} />
            </button>
          </div>
          <PaymentForm
            payment={null}
            reservations={reservations}
            onSave={onSavePayment}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition duration-150 ease-in-out"
            >
              Cancelar
            </button>
            <button
              form="paymentsForm"
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              Guardar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Modo 'edit' y 'view'
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'edit' ? 'Editar Pago' : 'Detalles del Pago'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
          >
            <FiX size={24} />
          </button>
        </div>
        <PaymentForm
          payment={payment}
          reservations={reservations}
          onUpdateStatus={onUpdateStatus}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
