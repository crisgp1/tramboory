import { useState } from 'react';
import { ChartCard, FadeInUp } from '../';
import { 
  FiBarChart2, 
  FiPieChart, 
  FiFilter, 
  FiRefreshCw,
  FiTrendingUp,
  FiCalendar,
  FiPackage,
  FiDownload,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CHART_COLORS, CHART_GRADIENTS } from '../dashboardConstants';

/**
 * Componente para la pestaña de Gráficos
 * 
 * @param {Object} props
 * @param {Array} props.stockMovementData - Datos para el gráfico de movimientos
 * @param {Array} props.categoryDistribution - Datos para el gráfico de categorías
 * @param {string} props.timeRange - Rango de tiempo seleccionado
 * @param {Function} props.setTimeRange - Función para cambiar el rango de tiempo
 */
const GraficosTab = ({
  stockMovementData = [],
  categoryDistribution = [],
  timeRange = '7d',
  setTimeRange
}) => {
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    view: 'monthly',
    chartType: 'area'
  });

  // Función para actualizar filtros
  const updateFilter = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  // Selector de rango de tiempo
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

  // Botones de tipo de gráfico
  const ChartTypeSelector = ({ className = "" }) => (
    <div className={`flex bg-gray-50 rounded-lg p-1 ${className}`}>
      {[
        { id: 'area', label: 'Área', icon: FiTrendingUp },
        { id: 'bar', label: 'Barras', icon: FiBarChart2 }
      ].map(option => {
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            onClick={() => updateFilter('chartType', option.id)}
            className={`text-xs py-1.5 px-2.5 rounded-md transition-colors flex-1 font-medium flex items-center justify-center
              ${activeFilters.chartType === option.id 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon size={12} className="mr-1" />
            {option.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Panel de filtros */}
      <FadeInUp>
        <div className="bg-white p-4 rounded-xl shadow-sm mb-5">
          <h3 className="text-base font-semibold mb-3 flex items-center">
            <FiFilter className="mr-2 text-indigo-500" size={16} />
            Filtros para Gráficos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <select 
              className="text-sm border border-gray-200 rounded-lg p-2 bg-gray-50"
              value={activeFilters.category}
              onChange={e => updateFilter('category', e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              <option value="lacteos">Lácteos</option>
              <option value="frescos">Frescos</option>
              <option value="secos">Secos</option>
              <option value="bebidas">Bebidas</option>
            </select>
            
            <TimeRangeSelector />
            
            <ChartTypeSelector />
            
            <div className="flex space-x-2">
              <button className="text-sm bg-indigo-600 text-white py-2 px-3 rounded-lg flex items-center justify-center flex-1 hover:bg-indigo-700 transition-colors">
                <FiFilter className="mr-1.5" size={14} />
                Aplicar
              </button>
              <button className="text-sm bg-white text-gray-700 border border-gray-200 py-2 px-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <FiRefreshCw className="mr-1.5" size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gráfico de Movimientos */}
        <ChartCard 
          title="Movimiento de Inventario" 
          icon={FiBarChart2} 
          color="primary"
          delay={0.1}
          actionButtons={
            <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <FiDownload size={16} />
            </button>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            {activeFilters.chartType === 'area' ? (
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
            ) : (
              <BarChart
                data={stockMovementData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
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
                <Bar 
                  dataKey="entradas" 
                  fill="#6366F1" 
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                  name="Entradas"
                />
                <Bar 
                  dataKey="salidas" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]}
                  barSize={16}
                  name="Salidas"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico de Distribución */}
        <ChartCard 
          title="Distribución por Categoría" 
          icon={FiPieChart} 
          color="purple"
          delay={0.2}
          actionButtons={
            <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors">
              <FiDownload size={16} />
            </button>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} unidades`, 'Cantidad']}
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
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Sección de métricas adicionales */}
      <FadeInUp delay={0.3}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
          <MetricCard 
            title="Rotación de Inventario" 
            value="3.2x" 
            trend="up" 
            description="Trimestre actual"
            icon={FiRefreshCw}
            color="primary"
          />
          <MetricCard 
            title="Días de Inventario" 
            value="24.5" 
            trend="down" 
            description="Promedio mensual"
            icon={FiCalendar}
            color="success"
          />
          <MetricCard 
            title="Utilización" 
            value="86%" 
            trend="up" 
            description="Capacidad actual"
            icon={FiPackage}
            color="warning"
          />
        </div>
      </FadeInUp>
    </div>
  );
};

// Componente para métricas con tendencia
const MetricCard = ({ title, value, trend, description, icon: Icon, color = "primary" }) => {
  const colorClasses = {
    primary: "border-indigo-500 bg-indigo-50 text-indigo-500",
    success: "border-emerald-500 bg-emerald-50 text-emerald-500",
    warning: "border-amber-500 bg-amber-50 text-amber-500",
    danger: "border-rose-500 bg-rose-50 text-rose-500",
    purple: "border-violet-500 bg-violet-50 text-violet-500"
  };

  const borderColor = colorClasses[color]?.split(' ')[0] || colorClasses.primary.split(' ')[0];
  const bgColor = colorClasses[color]?.split(' ')[1] || colorClasses.primary.split(' ')[1];
  const textColor = colorClasses[color]?.split(' ')[2] || colorClasses.primary.split(' ')[2];

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${borderColor} hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-gray-400 text-xs mt-1">{description}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={textColor} size={20} />
        </div>
      </div>

      {trend && (
        <div className={`absolute bottom-3 right-3 flex items-center ${
          trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {trend === 'up' ? (
            <FiArrowUp size={12} className="mr-1" />
          ) : (
            <FiArrowDown size={12} className="mr-1" />
          )}
          <span className="text-xs font-medium">
            {trend === 'up' ? '+' : '-'}7.2%
          </span>
        </div>
      )}
    </div>
  );
};

export default GraficosTab;