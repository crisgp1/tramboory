import { FiX } from 'react-icons/fi';
import MamparaForm from './MamparaForm';

const MamparaModal = ({
  isOpen,
  onClose,
  activeTab,
  handleSubmit,
  editingItem,
  tematicas,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingItem ? 'Editar Mampara' : 'Crear Mampara'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <MamparaForm
            editingItem={editingItem}
            onSave={handleSubmit}
            activeTab={activeTab}
            tematicas={tematicas}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            form={`${activeTab}Form`}
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
          >
            {editingItem ? 'Guardar Cambios' : 'Crear Mampara'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MamparaModal;
