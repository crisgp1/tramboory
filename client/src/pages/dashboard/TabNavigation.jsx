import { FiPlusCircle } from 'react-icons/fi';

const TabNavigation = ({ activeTab, setActiveTab, handleAddItem }) => (
    <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
            <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg ${
                    activeTab === 'users' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Usuarios
            </button>
            <button
                onClick={() => setActiveTab('reservations')}
                className={`px-4 py-2 rounded-lg ${
                    activeTab === 'reservations' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Reservas
            </button>
            <button
                onClick={() => setActiveTab('finances')}
                className={`px-4 py-2 rounded-lg ${
                    activeTab === 'finances' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Finanzas
            </button>
            <button
                onClick={() => setActiveTab('packages')}
                className={`px-4 py-2 rounded-lg ${
                    activeTab === 'packages' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
            >
                Paquetes
            </button>
        </div>
        <button
            onClick={handleAddItem}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center"
        >
            <FiPlusCircle className="mr-2" /> Agregar
        </button>
    </div>
);

export default TabNavigation;