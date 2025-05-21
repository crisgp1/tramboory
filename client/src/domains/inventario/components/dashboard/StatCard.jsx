import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import FadeInUp from './FadeInUp';
import { BORDER_COLORS, BG_COLORS, TEXT_COLORS } from './dashboardConstants';

/**
 * Componente de tarjeta de estadísticas con diseño moderno y animaciones
 * 
 * @param {Object} props
 * @param {Function} props.icon - Componente de icono a mostrar
 * @param {string} props.title - Título de la estadística
 * @param {string|number} props.value - Valor de la estadística
 * @param {string} props.color - Color de la tarjeta (primary, success, warning, danger, purple, pink)
 * @param {string} props.trend - Tendencia (up o down)
 * @param {number} props.percent - Porcentaje de la tendencia
 * @param {number} props.delay - Retraso de la animación
 */
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color = 'primary',
  trend, 
  percent, 
  delay = 0 
}) => {
  // Mapear el nombre del color a las clases correspondientes
  const borderColor = BORDER_COLORS[color] || BORDER_COLORS.primary;
  const bgColor = BG_COLORS[color] || BG_COLORS.primary;
  const textColor = TEXT_COLORS[color] || TEXT_COLORS.primary;

  // Clases para la tendencia
  const trendColor = trend === 'up'
    ? 'text-emerald-500 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/40'
    : 'text-rose-500 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/40';
  
  return (
    <FadeInUp delay={delay} className="h-full">
      <motion.div
        className={`bg-white dark:bg-[#1e293b] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 h-full border-l-4 ${borderColor} overflow-hidden relative group`}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        {/* Elemento decorativo de fondo */}
        <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${bgColor} opacity-30 group-hover:opacity-70 transition-opacity`}></div>
        
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center">
            <div className={`p-2.5 mr-3 rounded-lg ${bgColor} group-hover:shadow-sm transition-all`}>
              <Icon className={textColor} size={18} />
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">{title}</h3>
              <p className="text-xl font-bold mt-0.5 dark:text-white">{value}</p>
            </div>
          </div>
          
          {trend && (
            <motion.div 
              className={`flex items-center ${trendColor} px-2 py-1 rounded-full`}
              whileTap={{ scale: 0.95 }}
            >
              {trend === 'up' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
              <span className="text-xs font-medium ml-1">{percent}%</span>
            </motion.div>
          )}
        </div>
        
        {/* Indicador de tendencia en la parte inferior */}
        {trend && (
          <div className="w-full h-1 mt-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'} 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percent * 2, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
            />
          </div>
        )}
      </motion.div>
    </FadeInUp>
  );
};

export default StatCard;