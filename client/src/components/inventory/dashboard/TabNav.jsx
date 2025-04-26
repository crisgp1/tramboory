import { motion } from 'framer-motion';
import { 
  FiBarChart2, 
  FiPlus, 
  FiPieChart, 
  FiAlertTriangle,
  FiSettings,
  FiSliders
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
    { id: 'alertas', icon: FiAlertTriangle, label: 'Alertas' }
  ];

  // Usar pestañas personalizadas o las predeterminadas
  const tabs = customTabs || defaultTabs;

  return (
    <div className="overflow-x-auto flex space-x-1.5 sm:space-x-2 mb-5 pb-1 no-scrollbar">
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
          className="ml-auto whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 flex items-center bg-white text-gray-600 hover:bg-gray-50 transition-all duration-300"
        >
          <FiSliders className="mr-1.5" size={16} />
          <span className="hidden sm:inline">Configurar</span>
        </button>
      )}
    </div>
  );
};

/**
 * Botón de pestaña individual con animaciones
 */
const TabButton = ({ isActive, onClick, icon: Icon, label }) => (
  <motion.button
    onClick={onClick}
    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 flex items-center transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm' 
        : 'bg-white text-gray-600 hover:bg-gray-50'}`}
    whileTap={{ scale: 0.97 }}
    layout
  >
    <Icon className="mr-2" size={16} />
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