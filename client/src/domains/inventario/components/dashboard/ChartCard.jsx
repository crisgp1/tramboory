import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMaximize2, FiEye, FiDownload, FiMoreVertical } from 'react-icons/fi';
import FadeInUp from './FadeInUp';
import { BG_COLORS, TEXT_COLORS } from './dashboardConstants';

/**
 * Componente contenedor para gráficos con diseño moderno
 * 
 * @param {Object} props
 * @param {string} props.title - Título del gráfico
 * @param {Function} props.icon - Componente de icono a mostrar
 * @param {string} props.color - Color del gráfico (primary, success, warning, danger, purple, pink)
 * @param {React.ReactNode} props.children - Contenido del gráfico (generalmente un componente de recharts)
 * @param {number} props.delay - Retraso de la animación
 * @param {React.ReactNode} props.actionButtons - Botones de acción personalizados
 * @param {string} props.className - Clases CSS adicionales
 */
const ChartCard = ({ 
  title, 
  icon: Icon, 
  color = 'primary', 
  children, 
  delay = 0, 
  actionButtons,
  className = ""
}) => {
  const [showActions, setShowActions] = useState(false);
  
  // Mapear el nombre del color a las clases correspondientes
  const bgColor = BG_COLORS[color] || BG_COLORS.primary;
  const textColor = TEXT_COLORS[color] || TEXT_COLORS.primary;

  return (
    <FadeInUp delay={delay} className={`h-full ${className}`}>
      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl shadow-sm h-full border border-gray-100 dark:border-[#334155] relative overflow-hidden">
        {/* Elemento decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-50 dark:from-gray-800 to-transparent rounded-bl-full opacity-80"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg ${bgColor} mr-2`}>
              <Icon className={textColor} size={18} />
            </div>
            <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          </div>
          
          <div className="flex space-x-1">
            {actionButtons}
            
            <div className="relative">
              <button
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowActions(!showActions)}
              >
                <FiMoreVertical size={16} />
              </button>
              
              {/* Menú de acciones */}
              {showActions && (
                <motion.div
                  className="absolute right-0 mt-1 bg-white dark:bg-[#263449] shadow-lg rounded-lg py-1 z-20 min-w-[120px] border border-gray-100 dark:border-[#334155]"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#334155] flex items-center">
                    <FiMaximize2 className="mr-2" size={14} />
                    Ampliar
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#334155] flex items-center">
                    <FiDownload className="mr-2" size={14} />
                    Exportar
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#334155] flex items-center">
                    <FiEye className="mr-2" size={14} />
                    Ver detalles
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        
        <div className="h-[220px] sm:h-[250px] md:h-[280px] relative z-10">
          {children}
        </div>
        
        {/* Borde inferior decorativo */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${bgColor} opacity-30`}></div>
      </div>
    </FadeInUp>
  );
};

export default ChartCard;