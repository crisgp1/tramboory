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
 * Componente de navegación por pestañas para el dashboard
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

  return (
    <div className="overflow-x-auto flex space-x-2 mb-5 pb-1 no-scrollbar justify-center">
      <div className="bg-gray-100 rounded-xl p-1 flex space-x-1 shadow-sm">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
        
        {/* Botón de configuración (opcional) */}
        {customTabs && (
          <button
            className="ml-1 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 flex items-center bg-white text-gray-600 hover:bg-gray-50 transition-all duration-300"
          >
            <FiSliders className="mr-1.5" size={16} />
            <span className="hidden sm:inline">Configurar</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Botón de pestaña individual con animaciones
 */
const TabButton = ({ isActive, onClick, icon: Icon, label }) => (
  <motion.button
    onClick={onClick}
    className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 flex items-center transition-all duration-300 relative
      ${isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-200'}`}
    whileTap={{ scale: 0.97 }}
    layout
  >
    <Icon className="mr-1.5" size={16} />
    {label}
    
    {isActive && (
      <motion.div
        className="absolute inset-0 rounded-lg"
        layoutId="activeTab"
        initial={false}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35
        }}
      />
    )}
  </motion.button>
);

export default TabNav;