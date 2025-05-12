import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiClock } from 'react-icons/fi';
import FadeInUp from './FadeInUp';
import { BG_COLORS, TEXT_COLORS } from './dashboardConstants';

/**
 * Componente para mostrar listas de alertas o notificaciones con diseño moderno
 * 
 * @param {Object} props
 * @param {string} props.title - Título de la lista de alertas
 * @param {Array} props.items - Array de elementos a mostrar
 * @param {string} props.emptyMessage - Mensaje a mostrar cuando no hay elementos
 * @param {Function} props.icon - Componente de icono a mostrar
 * @param {string} props.color - Color de las alertas (primary, success, warning, danger, purple, pink)
 * @param {string} props.viewAllLink - Enlace para ver todos los elementos
 * @param {number} props.delay - Retraso de la animación
 * @param {Function} props.onItemClick - Función a ejecutar al hacer clic en un elemento
 */
const AlertList = ({ 
  title, 
  items = [], 
  emptyMessage, 
  icon: Icon, 
  color = 'danger', 
  viewAllLink, 
  delay = 0,
  onItemClick
}) => {
  // Mapear el nombre del color a las clases correspondientes
  const bgColor = BG_COLORS[color] || BG_COLORS.danger;
  const textColor = TEXT_COLORS[color] || TEXT_COLORS.danger;

  return (
    <FadeInUp delay={delay} className="h-full">
      <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm p-5 h-full border border-gray-100 dark:border-[#334155]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg ${bgColor}`}>
              <Icon size={16} className={textColor} />
            </div>
            <h3 className="text-base font-semibold ml-2 dark:text-white">{title}</h3>
          </div>
          
          {items.length > 0 && viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-medium flex items-center px-2 py-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Ver todos
              <FiChevronRight size={14} className="ml-1" />
            </Link>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-3">
              <Icon size={24} className="opacity-50" />
            </div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 4).map((item, index) => (
              <motion.div 
                key={item.id || index} 
                className={`border border-gray-100 dark:border-[#334155] rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-[#263449] transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: delay + index * 0.1 }}
                onClick={() => onItemClick && onItemClick(item)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`p-1.5 rounded-lg ${bgColor} flex-shrink-0 mt-0.5 mr-2`}>
                      <Icon size={14} className={textColor} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm dark:text-white">{item.nombre || item.mensaje}</h4>
                      {item.materiaPrima && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.materiaPrima.nombre}</p>
                      )}
                      {item.descripcion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.descripcion}</p>
                      )}
                      {item.fecha_creacion && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                          <FiClock size={12} className="mr-1" />
                          {new Date(item.fecha_creacion).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {item.stock_actual !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900">
                        {item.stock_actual} / {item.stock_minimo}
                      </span>
                    )}
                    {item.fecha_caducidad && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
                        <FiClock size={12} className="mr-1" />
                        {new Date(item.fecha_caducidad).toLocaleDateString()}
                      </span>
                    )}
                    {item.nivel && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.nivel === 'crítico' ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-100 dark:border-rose-900' :
                        item.nivel === 'advertencia' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900' :
                        'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900'
                      }`}>
                        {item.nivel}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FadeInUp>
  );
};

export default AlertList;