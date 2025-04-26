import { StatCard, AlertList, ChartCard } from '../';
import {
  FiBox,
  FiTruck,
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CHART_GRADIENTS } from '../dashboardConstants';

/**
 * Componente para la pestaña de Resumen del Dashboard
 * 
 * @param {Object} props
 * @param {Object} props.stats - Estadísticas a mostrar
 * @param {Array} props.lowStockItems - Elementos con bajo stock
 * @param {Array} props.expiringItems - Elementos próximos a caducar
 * @param {string} props.timeRange - Rango de tiempo seleccionado
 * @param {Function} props.setTimeRange - Función para cambiar el rango de tiempo
 * @param {Array} props.stockMovementData - Datos para el gráfico de movimientos
 */
const ResumenTab = ({
  stats = {
    totalItems: 0,
    totalProviders: 0,
    movementsToday: 0,
    activeAlerts: 0
  },
  lowStockItems = [],
  expiringItems = [],
  timeRange = '7d',
  setTimeRange,
  stockMovementData = []
}) => {
  // Selector de rango de tiempo para el gráfico
  const TimeRangeSelector = ({ className = "" }) => (
    <div className={`flex bg-gray-50 rounded-lg p-1 ${className}`}>
      {[
        { id: '7d', label: '7 días' },
        { id: '30d', label: '30 días' },
        { id: 'mes', label: 'Este mes' },
        { id: 'año', label: 'Este año' }
      ].map(option => (
        <button
          key={option.id}
          onClick={() => setTimeRange && setTimeRange(option.id)}
          className={`text-xs py-1.5 px-2.5 rounded-md transition-colors flex-1 font-medium
            ${timeRange === option.id 
              ? 'bg-white shadow-sm text-indigo-600' 
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatCard 
          icon={FiBox} 
          title="Materias Primas" 
          value={stats.totalItems} 
          color="primary"
          trend="up"
          percent="5.2"
          delay={0.1}
        />
        <StatCard 
          icon={FiTruck} 
          title="Proveedores" 
          value={stats.totalProviders} 
          color="success"
          delay={0.2}
        />
        <StatCard 
          icon={FiActivity} 
          title="Movimientos Hoy" 
          value={stats.movementsToday} 
          color="purple"
          trend="up"
          percent="12.3"
          delay={0.3}
        />
        <StatCard 
          icon={FiAlertTriangle} 
          title="Alertas Activas" 
          value={stats.activeAlerts} 
          color="warning"
          trend="down"
          percent="3.1"
          delay={0.4}
        />
      </div>

      {/* Gráfico resumen de movimientos */}
      <ChartCard 
        title="Movimiento de Inventario" 
        icon={FiBarChart2} 
        color="primary"
        delay={0.5}
        actionButtons={
          <TimeRangeSelector className="mr-2" />
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={stockMovementData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_GRADIENTS.entrada[0]} />
                <stop offset="95%" stopColor={CHART_GRADIENTS.entrada[1]} />
              </linearGradient>
              <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_GRADIENTS.salida[0]} />
                <stop offset="95%" stopColor={CHART_GRADIENTS.salida[1]} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              width={35}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                padding: '8px 12px'
              }} 
            />
            <Legend 
              iconSize={10} 
              wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
              formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="entradas" 
              stroke="#6366F1" 
              fillOpacity={1} 
              fill="url(#colorEntradas)" 
              activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
              strokeWidth={2} 
            />
            <Area 
              type="monotone" 
              dataKey="salidas" 
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorSalidas)"
              activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Listas de alertas y problemas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <AlertList
          title="Bajo Stock"
          items={lowStockItems}
          emptyMessage="No hay elementos con bajo stock"
          icon={FiBarChart2}
          color="danger"
          viewAllLink="/inventory/bajostock"
          delay={0.6}
        />
        
        <AlertList
          title="Próximos a Caducar"
          items={expiringItems}
          emptyMessage="No hay elementos próximos a caducar"
          icon={FiCalendar}
          color="warning"
          viewAllLink="/inventory/caducidad"
          delay={0.7}
        />
      </div>
    </div>
  );
};

export default ResumenTab;