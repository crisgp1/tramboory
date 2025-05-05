// Example usage in any component
import { useState } from 'react';
import Modal from '../Modal';
import { Button } from '../Button';

const ModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>
        Abrir Modal
      </Button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Operación"
        type="warning"
        description="Esta acción no se puede deshacer."
        maxWidth="md"
      >
        <div className="py-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas realizar esta acción?
          </p>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // Perform action
              setIsModalOpen(false);
            }}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ModalExample;