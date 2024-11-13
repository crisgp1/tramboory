const TabNavigation = ({ activeTab, setActiveTab, handleAddItem }) => (
    <div className="flex justify-between items-center mb-4">
        <div>
            {[
                { id: 'users', label: 'Usuarios' },
                { id: 'reservations', label: 'Reservas' },
                { id: 'finances', label: 'Finanzas' },
                { id: 'packages', label: 'Paquetes' },
                { id: 'extras', label: 'Extras' },
                { id: 'opcionesAlimento', label: 'Opc. Alimento' },
                { id: 'tematicas', label: 'Temáticas' },
                { id: 'mamparas', label: 'Mamparas' },
                { id: 'payments', label: 'Pagos' },
            ].map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`mr-4 py-2 px-4 rounded-lg ${
                        activeTab === id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
        <button
            onClick={handleAddItem}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
            Agregar
        </button>
    </div>
);

export default TabNavigation;