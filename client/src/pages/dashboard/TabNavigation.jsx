import React from 'react';
import { FiPlusCircle } from 'react-icons/fi';

const TabNavigation = ({ activeTab, onTabChange, onAddItem }) => {
    const tabs = ['users', 'reservations', 'finances', 'packages'];

    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === tab ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
            <button
                onClick={onAddItem}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center"
            >
                <FiPlusCircle className="mr-2" /> Agregar
            </button>
        </div>
    );
};

export default TabNavigation;