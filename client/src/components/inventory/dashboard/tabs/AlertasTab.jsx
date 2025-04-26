import { useState } from 'react';
import { AlertList, FadeInUp } from '../';
import { 
  FiAlertTriangle, 
  FiBarChart2, 
  FiCalendar,
  FiFilter,
  FiCheckCircle,
  FiBell,
  FiClock,
  FiSettings
} from 'react-icons/fi';

/**
 * Componente para la pestaña de Alertas del Dashboard
 * 
 * @param {Object} props
 * @param {Array} props.lowStockItems - Elementos con bajo stock
 * @param {Array} props.expiringItems - Elementos próximos a caducar
 * @param {Array} props.alerts - Alertas del sistema
 */
const AlertasTab = ({
  lowStockItems = [],
  expiringItems = [],
  alerts = []
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [alertStatus, setAlertStatus] = useState('active');
  
  // Filtrar alertas por tipo y estado
  const filteredLowStock = lowStockItems.filter(item => {
    if (activeFilter !== 'all' && activeFilter !== 'lowstock') return false;
    return true;
  });

  const filteredExpiring = expiringItems.filter(item => {
    if (activeFilter !== 'all' && activeFilter !== 'expiring') return false;
    return true;
  });

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter !== 'all' && activeFilter !== 'system') return false;
    if (alertStatus === 'active' && alert.estado === 'resuelta') return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Banner informativo */}
      <FadeInUp>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
              <FiAlertTriangle size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-amber-800">Centro de Alertas</h3>
              <p className="text-sm text-amber-700 mt-1">
                Aquí puedes ver y gestionar todas las alertas del sistema de inventario.
                Mantén bajo control tu inventario atendiendo las alertas prioritarias.
              </p>
            </div>
            <button className="bg-white text-amber-600 hover:bg-amber-50 transition-colors border border-amber-200 rounded-lg px-3 py-1.5 text-sm font-medium flex items-center shadow-sm whitespace-nowrap">
              <FiSettings size={14} className="mr-1.5" />
              Configurar
            </button>
          </div>
        </div>
      </FadeInUp>
      
      {/* Filtros */}
      <FadeInUp delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${activeFilter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-indigo-50'}`}
            >
              <FiBell className="mr-1.5 inline-block" size={12} />
              Todas
            </button>
            <button
              onClick={() => setActiveFilter('lowstock')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${activeFilter === 'lowstock' 
                  ? 'bg-rose-600 text-white' 
                  : 'text-gray-600 hover:bg-rose-50'}`}
            >
              <FiBarChart2 className="mr-1.5 inline-block" size={12} />
              Bajo Stock
            </button>
            <button
              onClick={() => setActiveFilter('expiring')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${activeFilter === 'expiring' 
                  ? 'bg-amber-500 text-white' 
                  : 'text-gray-600 hover:bg-amber-50'}`}
            >
              <FiCalendar className="mr-1.5 inline-block" size={12} />
              Por Caducar
            </button>
            <button
              onClick={() => setActiveFilter('system')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${activeFilter === 'system' 
                  ? 'bg-violet-600 text-white' 
                  : 'text-gray-600 hover:bg-violet-50'}`}
            >
              <FiAlertTriangle className="mr-1.5 inline-block" size={12} />
              Sistema
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-1 flex ml-auto">
            <button
              onClick={() => setAlertStatus('active')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${alertStatus === 'active' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Activas
            </button>
            <button
              onClick={() => setAlertStatus('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${alertStatus === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Todas
            </button>
          </div>
        </div>
      </FadeInUp>
      
      {/* Alertas de bajo stock */}
      {(activeFilter === 'all' || activeFilter === 'lowstock') && (
        <AlertList
          title="Productos con Bajo Stock"
          items={filteredLowStock}
          emptyMessage="No hay elementos con bajo stock"
          icon={FiBarChart2}
          color="danger"
          viewAllLink="/inventory/bajostock"
          delay={0.2}
          onItemClick={(item) => console.log('Ver detalles:', item)}
        />
      )}
      
      {/* Elementos por caducar */}
      {(activeFilter === 'all' || activeFilter === 'expiring') && (
        <AlertList
          title="Productos Próximos a Caducar"
          items={filteredExpiring}
          emptyMessage="No hay elementos próximos a caducar"
          icon={FiCalendar}
          color="warning"
          viewAllLink="/inventory/caducidad"
          delay={0.3}
          onItemClick={(item) => console.log('Ver detalles:', item)}
        />
      )}
      
      {/* Alertas del sistema */}
      {(activeFilter === 'all' || activeFilter === 'system') && (
        <AlertList
          title="Alertas del Sistema"
          items={filteredAlerts}
          emptyMessage="No hay alertas activas en el sistema"
          icon={FiAlertTriangle}
          color="purple"
          viewAllLink="/inventory/alertas"
          delay={0.4}
          onItemClick={(item) => console.log('Ver detalles:', item)}
        />
      )}
      
      {/* Panel de información con métricas */}
      <FadeInUp delay={0.5}>
        <div className="bg-white rounded-lg shadow-sm p-5 mt-6">
          <h3 className="text-base font-semibold mb-4 text-gray-700 flex items-center">
            <FiCheckCircle className="mr-2 text-indigo-500" />
            Resumen de Estado
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-indigo-600 font-medium">Total Alertas</p>
                  <h4 className="text-2xl font-bold text-indigo-700 mt-1">
                    {lowStockItems.length + expiringItems.length + alerts.length}
                  </h4>
                </div>
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <FiBell size={18} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="h-1.5 flex-1 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ 
                      width: `${(lowStockItems.length/(lowStockItems.length + expiringItems.length + alerts.length)*100) || 0}%` 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-indigo-600 ml-2">
                  {lowStockItems.length}
                </span>
              </div>
            </div>
            
            <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Bajo Stock</p>
                  <h4 className="text-2xl font-bold text-rose-700 mt-1">
                    {lowStockItems.length}
                  </h4>
                </div>
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <FiBarChart2 size={18} />
                </div>
              </div>
              <p className="text-xs text-rose-600 mt-3 flex items-center">
                <FiClock className="mr-1" size={12} />
                Última alerta: {lowStockItems.length > 0 ? 'Hace 2 horas' : 'N/A'}
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-amber-600 font-medium">Por Caducar</p>
                  <h4 className="text-2xl font-bold text-amber-700 mt-1">
                    {expiringItems.length}
                  </h4>
                </div>
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <FiCalendar size={18} />
                </div>
              </div>
              <p className="text-xs text-amber-600 mt-3 flex items-center">
                <FiClock className="mr-1" size={12} />
                Próxima caducidad: {expiringItems.length > 0 ? '2 días' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default AlertasTab;