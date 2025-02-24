import { useState, useEffect } from 'react';
import { FiBox, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import InventoryLogin from './InventoryLogin';
import ItemsView from './views/ItemsView';
import ProvidersView from './views/ProvidersView';
import MovementsView from './views/MovementsView';

// Mock data for cards
const MOCK_STATS = {
  totalItems: 156,
  totalProviders: 12,
  movementsToday: 8
};

const InventoryDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { isAuthenticated, userType, loading } = useAuth();

  const hasInventoryAccess = userType === 'admin' || userType === 'inventario';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !hasInventoryAccess) {
    return <InventoryLogin />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'items':
        return <ItemsView />;
      case 'providers':
        return <ProvidersView />;
      case 'movements':
        return <MovementsView />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div 
              onClick={() => setCurrentView('items')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalItems}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <FiBox className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Click para gestionar items
              </p>
            </div>

            <div 
              onClick={() => setCurrentView('providers')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Proveedores</p>
                  <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.totalProviders}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiTruck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Click para gestionar proveedores
              </p>
            </div>

            <div 
              onClick={() => setCurrentView('movements')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Movimientos Hoy</p>
                  <p className="text-2xl font-semibold text-gray-900">{MOCK_STATS.movementsToday}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiRefreshCw className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Click para ver movimientos
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {currentView === 'dashboard' ? 'Inventario' : 
           currentView === 'items' ? 'Gestión de Items' :
           currentView === 'providers' ? 'Gestión de Proveedores' :
           'Movimientos de Inventario'}
        </h1>
        {currentView !== 'dashboard' && (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Volver al Dashboard
          </button>
        )}
      </div>

      {/* Main Content */}
      {renderView()}
    </div>
  );
};

export default InventoryDashboard;