import React, { useState, useCallback, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import UserForm from './UserForm';
import ReservationForm from './ReservationForm';
import FinanceForm from './FinanceForm';
import PackageForm from './PackageForm';

const ItemModal = ({
                       isOpen,
                       onClose,
                       title,
                       loading,
                       activeTab,
                       handleSubmit,
                       editingItem,
                       generatedPassword,
                       generateRandomPassword,
                       users,
                       packages,
                       reservations,
                       categories,
                       onAddCategory
                   }) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState(editingItem || {});

    useEffect(() => {
        setFormData(editingItem || {});
        setErrors({});
    }, [editingItem]);

    const updateFormData = useCallback((newData) => {
        setFormData(prevData => ({ ...prevData, ...newData }));
        setErrors(prevErrors => {
            const updatedErrors = { ...prevErrors };
            Object.keys(newData).forEach(key => {
                delete updatedErrors[key];
            });
            return updatedErrors;
        });
    }, []);

    const onSave = useCallback(async (data) => {
        try {
            await handleSubmit(data);
            onClose();
        } catch (error) {
            console.error('Error al guardar:', error);
            setErrors(prev => ({ ...prev, submit: 'Hubo un error al guardar los datos. Por favor, intente de nuevo.' }));
        }
    }, [handleSubmit, onClose]);

    const renderForm = () => {
        const commonProps = {
            editingItem: formData,
            onSave: updateFormData,
            errors,
            setErrors
        };

        switch (activeTab) {
            case 'users':
                return (
                    <UserForm
                        {...commonProps}
                        generatedPassword={generatedPassword}
                        generateRandomPassword={generateRandomPassword}
                    />
                );
            case 'reservations':
                return (
                    <ReservationForm
                        {...commonProps}
                        users={users}
                        packages={packages}
                    />
                );
            case 'finances':
                return (
                    <FinanceForm
                        {...commonProps}
                        categories={categories}
                        onAddCategory={onAddCategory}
                        reservations={reservations}
                    />
                );
            case 'packages':
                return <PackageForm {...commonProps} />;
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {title || `${editingItem ? 'Editar' : 'Agregar'} ${activeTab?.slice(0, -1)}`}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-grow overflow-y-auto px-6 py-4">
                    {renderForm()}
                    {errors.submit && (
                        <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-md">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition duration-150 ease-in-out"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || Object.keys(errors).length > 0}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;