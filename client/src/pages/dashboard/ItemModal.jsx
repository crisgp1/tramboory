import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import UserForm from './UserForm';
import ReservationForm from './ReservationForm';
import FinanceForm from './FinanceForm';
import PackageForm from './PackageForm';

const ItemModal = ({
                       activeTab,
                       editingItem,
                       setIsModalOpen,
                       handleSubmit,
                       generateRandomPassword,
                       generatedPassword,
                       users,
                       packages,
                       reservations
                   }) => {
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrors({});
        try {
            await handleSubmit(data);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error al guardar:', error);
            setErrors({ submit: 'Hubo un error al guardar los datos. Por favor, intente de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => {
        const props = {
            editingItem,
            onSubmit,
            setErrors
        };

        switch (activeTab) {
            case 'users':
                return (
                    <UserForm
                        {...props}
                        generatedPassword={generatedPassword}
                        generateRandomPassword={generateRandomPassword}
                    />
                );
            case 'reservations':
                return <ReservationForm {...props} users={users} packages={packages} />;
            case 'finances':
                return <FinanceForm {...props} reservations={reservations} />;
            case 'packages':
                return <PackageForm {...props} />;
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
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500">
                        <FiX size={24} />
                    </button>
                </div>
                {renderForm()}
                {Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-md">
                        <ul className="list-disc list-inside">
                            {Object.entries(errors).map(([key, error]) => (
                                <li key={key} className="text-red-700">{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
                    >
                        Cancelar
                    </button>
                    <button
                        form={`${activeTab}Form`}
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;