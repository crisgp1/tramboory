import { motion } from 'framer-motion';
import { 
  FiBarChart2, 
  FiPlus, 
  FiPieChart, 
  FiAlertTriangle,
  FiSettings,
  FiSliders,
  FiTrendingUp
} from 'react-icons/fi';

/**
 * Componente de navegación por pestañas para el dashboard con diseño centrado vertical
 * 
 * @param {Object} props
 * @param {string} props.activeTab - Pestaña activa actualmente
 * @param {Function} props.setActiveTab - Función para cambiar de pestaña
 * @param {Array} props.customTabs - Pestañas personalizadas (opcional)
 */
const TabNav = ({ activeTab, setActiveTab, customTabs }) => {
  // Pestañas predeterminadas
  const defaultTabs = [
    { id: 'resumen', icon: FiBarChart2, label: 'Resumen' },
    { id: 'acciones', icon: FiPlus, label: 'Acciones Rápidas' },
    { id: 'graficos', icon: FiPieChart, label: 'Gráficos' },
    { id: 'proyecciones', icon: FiTrendingUp, label: 'Proyecciones' },
    { id: 'alertas', icon: FiAlertTriangle, label: 'Alertas' }
  ];

  // Usar pestañas personalizadas o las predeterminadas
  const tabs = customTabs || defaultTabs;

  // Variantes para animación de contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  // Variantes para animación de elemento
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-6 mt-2"
    >
      <div className="flex justify-center items-center flex-wrap gap-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
            variants={itemVariants}
          />
        ))}
      </div>
    </motion.div>
  );
};

/**
 * Botón de pestaña individual con animaciones y diseño vertical centrado
 */
const TabButton = ({ isActive, onClick, icon: Icon, label, variants }) => {
  // Gradientes para el botón activo
  const activeGradient = "bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-indigo-800";
  const hoverGradient = "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-[#1e293b] dark:to-[#263449] dark:hover:from-[#263449] dark:hover:to-[#334155]";
  
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <motion.button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-xl ${
          isActive
            ? `${activeGradient} text-white shadow-lg`
            : `${hoverGradient} text-gray-700 dark:text-gray-200 shadow-sm`
        } transition-all duration-300 overflow-hidden group`}
      >
        {/* Efecto de brillo para hover */}
        <div className={`absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'hidden' : ''}`}></div>
        
        {/* Efecto de borde brillante para botón activo */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-blue-300 opacity-20 animate-pulse"></div>
        )}

        {/* Contenido del botón */}
        <div className="flex flex-col items-center justify-center p-2 relative z-10">
          <motion.div 
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-2"
          >
            <Icon className={`${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`} size={24} />
          </motion.div>
          <p className={`text-xs font-medium text-center leading-tight ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
            {label}
          </p>
        </div>
      </motion.button>
      
      {/* Indicador de posición activa */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white rounded-full shadow-lg"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.div>
  );
};

export default TabNav;