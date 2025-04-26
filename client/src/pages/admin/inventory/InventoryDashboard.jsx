import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { 
  FiClock
} from 'react-icons/fi';
// Asegurando que todas las importaciones usen el alias @ para resolver correctamente en Docker
import { getInventoryStats, getLowStockItems, getActiveAlerts, getProximosACaducar } from '@/services/inventoryService';

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

// Datos de ejemplo para gráficos - En una implementación real, esto vendría de la API
const stockMovementData = [
  { name: 'Ene', entradas: 65, salidas: 28 },
  { name: 'Feb', entradas: 59, salidas: 48 },
  { name: 'Mar', entradas: 80, salidas: 40 },
  { name: 'Abr', entradas: 81, salidas: 67 },
  { name: 'May', entradas: 56, salidas: 43 },
  { name: 'Jun', entradas: 55, salidas: 50 },
  { name: 'Jul', entradas: 40, salidas: 35 },
];

const categoryDistribution = [
  { name: 'Lácteos', value: 30 },
  { name: 'Frescos', value: 25 },
  { name: 'Secos', value: 20 },
  { name: 'Bebidas', value: 15 },
  { name: 'Condimentos', value: 10 },
];

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
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, lowStock, expiringData, alertsData] = await Promise.all([
        getInventoryStats(),
        getLowStockItems(),
        getProximosACaducar(7), // próximos a caducar en 7 días
        getActiveAlerts()
      ]);

      setStats(statsData);
      setLowStockItems(lowStock);
      setExpiringItems(expiringData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 800); // Dar tiempo para la animación
  };

  // Mostrar loader durante la carga inicial
  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <div
      ref={mainContentRef}
      className="pb-20 lg:pb-6 overflow-auto h-full"
    >
      {/* Cabecera con título y fecha de actualización */}
      <FadeInUp>
        <div className="bg-white rounded-xl shadow-sm p-5 mb-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                Dashboard de Inventario
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md font-normal">v1.0</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1 flex items-center">
                <FiClock className="mr-1.5" size={14} />
                Última actualización: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {/* Navegación por pestañas */}
          <TabNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
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
          stockMovementData={stockMovementData}
        />
      )}

      {activeTab === 'acciones' && (
        <AccionesTab />
      )}

      {activeTab === 'graficos' && (
        <GraficosTab 
          stockMovementData={stockMovementData}
          categoryDistribution={categoryDistribution}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      )}

      {activeTab === 'alertas' && (
        <AlertasTab 
          lowStockItems={lowStockItems}
          expiringItems={expiringItems}
          alerts={alerts}
        />
      )}

      {/* Botón de refresco flotante */}
      <RefreshButton 
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        disabled={loading}
      />
    </div>
  );
};

export default InventoryDashboard;