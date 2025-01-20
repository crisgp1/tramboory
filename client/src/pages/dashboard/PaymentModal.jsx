import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../components/ui/Modal';
import PaymentForm from './PaymentForm';

const PaymentModal = ({
    payment,
    isOpen,
    onClose,
    onUpdateStatus,
    onSavePayment,
    reservations,
    mode // 'add', 'edit', 'view'
}) => {
    const getTitle = () => {
        switch (mode) {
            case 'add':
                return 'Agregar Nuevo Pago';
            case 'edit':
                return 'Editar Pago';
            default:
                return 'Detalles del Pago';
        }
    };

    const footerContent = (
        <div className="flex justify-end gap-2">
            {mode === 'add' && (
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
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
                </>
            )}
            {mode !== 'add' && (
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150 ease-in-out"
                >
                    Cerrar
                </button>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            footer={footerContent}
        >
            <PaymentForm
                payment={mode === 'add' ? null : payment}
                reservations={reservations}
                onSave={mode === 'add' ? onSavePayment : undefined}
                onUpdateStatus={mode !== 'add' ? onUpdateStatus : undefined}
            />
        </Modal>
    );
};

PaymentModal.propTypes = {
    payment: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUpdateStatus: PropTypes.func,
    onSavePayment: PropTypes.func,
    reservations: PropTypes.array.isRequired,
    mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired
};

export default PaymentModal;
