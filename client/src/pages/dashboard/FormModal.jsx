import React from 'react';
import { FiX } from 'react-icons/fi';
import UserForm from './forms/UserForm';
import ReservationForm from './forms/ReservationForm';
import FinanceForm from './forms/FinanceForm';
import PackageForm from './forms/PackageForm';

const FormModal = ({ isOpen, onClose, activeTab, editingItem, onSubmit }) => {
    if (!isOpen) return null;

    const renderForm = () => {
        switch (activeTab) {
            case 'users':
                return <UserForm initialData={editingItem} onSubmit={onSubmit} />;
            case 'reservations':
                return <ReservationForm initialData={editingItem} onSubmit={onSubmit} />;
            case 'finances':
                return <FinanceForm initialData={editingItem} onSubmit={onSubmit} />;
            case 'packages':
                return <PackageForm initialData={editingItem} onSubmit={onSubmit} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">
                        {editingItem ? 'Editar' : 'Agregar'} {activeTab.slice(0, -1)}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>
                {renderForm()}
            </div>
        </div>
    );
};

export default FormModal;