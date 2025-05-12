import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiClock
} from 'react-icons/fi';
// Asegurando que todas las importaciones usen el alias @ para resolver correctamente en Docker
import { getInventoryStats, getLowStockItems, getActiveAlerts, getProximosACaducar, getMovementStats } from '@/services/inventoryService';

// Importar componentes modulares del dashboard
import {
  TabNav,
  RefreshButton,
  DashboardLoader,
  FadeInUp,
  ResumenTab,
  AccionesTab,
  GraficosTab,
  AlertasTab
} from '@/components/inventory/dashboard';

// Importar tab de proyecciones
import ProyeccionesTab from '@/components/inventory/dashboard/tabs/ProyeccionesTab';

/**
 * Dashboard principal de inventario con enfoque mobile-first y diseño modular
 */
const InventoryDashboard = () => {
  // Estados para datos del dashboard
  const [stats, setStats] = useState({
    totalItems: 0,
    totalProviders: 0,
    movementsToday: 0,
    activeAlerts: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [movementStats, setMovementStats] = useState([]);
  const [error, setError] = useState(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Referencia para el contenedor principal para scroll al tope al cambiar de tab
  const mainContentRef = useRef(null);

  // Efecto para actualizar los datos al cargar el componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Efecto para hacer scroll al tope cuando se cambia de tab
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  // Función para obtener datos del dashboard
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [
        getInventoryStats(),
        getLowStockItems(),
        getProximosACaducar(7),
        getActiveAlerts(),
        getMovementStats()
      ];
      const results = await Promise.allSettled(promises);
      // stats
      if (results[0].status === 'fulfilled') setStats(results[0].value);
      else {
        console.error('Error stats:', results[0].reason);
        toast.error('Error al obtener estadísticas');
        setStats({ totalItems: 0, totalProviders: 0, movementsToday: 0, activeAlerts: 0 });
      }
      // low stock
      if (results[1].status === 'fulfilled') setLowStockItems(results[1].value);
      else {
        console.error('Error bajo stock:', results[1].reason);
        toast.error('Error al obtener stock bajo');
        setLowStockItems([]);
      }
      // expiring
      if (results[2].status === 'fulfilled') setExpiringItems(results[2].value);
      else {
        console.error('Error proximos caducar:', results[2].reason);
        toast.error('Error al obtener caducidad');
        setExpiringItems([]);
      }
      // alerts
      if (results[3].status === 'fulfilled') setAlerts(results[3].value);
      else {
        console.error('Error alertas:', results[3].reason);
        toast.error('Error al obtener alertas');
        setAlerts([]);
      }
      // movement stats
      if (results[4].status === 'fulfilled') setMovementStats(results[4].value);
      else {
        console.error('Error stats movimientos:', results[4].reason);
        toast.error('Error al obtener estadísticas de movimiento');
        setMovementStats([]);
      }
      // if all failed
      if (results.every(r => r.status === 'rejected')) {
        setError('No se pudo cargar datos del servidor.');
      }
    } catch (err) {
      console.error('Error general dashboard:', err);
      toast.error('Error de conexión con el servidor');
      setError('Error de conexión con el servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 800); // Dar tiempo para la animación
  };

  const handleRetry = () => fetchDashboardData();

  // Mostrar loader durante la carga inicial
  if (loading) {
    return <DashboardLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >Reintentar</button>
      </div>
    );
  }

  return (
    <div
      ref={mainContentRef}
      className="pb-20 lg:pb-6 overflow-auto h-full"
    >
      {/* Cabecera con título y fecha de actualización */}
      <FadeInUp>
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm p-5 mb-5 border border-gray-100 dark:border-[#334155] text-center">
          <div className="flex flex-col items-center gap-4 mb-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center">
                Dashboard de Inventario
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/70 text-indigo-600 dark:text-indigo-300 text-xs rounded-md font-normal">v1.0</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center justify-center">
                <FiClock className="mr-1.5" size={14} />
                Última actualización: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {/* Navegación por pestañas centrada */}
          <div className="flex justify-center">
            <TabNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      </FadeInUp>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'resumen' && (
        <ResumenTab 
          stats={stats}
          lowStockItems={lowStockItems}
          expiringItems={expiringItems}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          // movement stats para gráficas en lugar de mock
          stockMovementData={movementStats}
        />
      )}

      {activeTab === 'acciones' && (
        <AccionesTab />
      )}

      {activeTab === 'graficos' && (
        <GraficosTab 
          stockMovementData={movementStats}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      )}

      {activeTab === 'proyecciones' && (
        <ProyeccionesTab />
      )}

      {activeTab === 'alertas' && (
        <AlertasTab 
          lowStockItems={lowStockItems}
          expiringItems={expiringItems}
          alerts={alerts}
        />
      )}

      {/* Botón de refresco flotante */}
      <div className="fixed bottom-6 right-6 z-10">
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default InventoryDashboard;