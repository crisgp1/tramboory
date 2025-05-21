import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import InventorySidebar from './InventorySidebar';
import { Breadcrumb } from '../ui'; // Import from ui components
const InventorySidebarLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Variantes para la animación del contenido principal
  const mainContentVariants = {
    expanded: { marginLeft: '240px' },
    collapsed: { marginLeft: '72px' },
    mobile: { marginLeft: '0px' }
  };

  // Handle navigation for breadcrumbs
  const handleNavigate = (path) => {
    console.log('Navigate to:', path);
    // Implementation of navigation logic
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--crm-bg)' }}>
      {/* Barra lateral */}
      <InventorySidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      {/* Contenido principal */}
      <motion.main 
        className="flex-1 overflow-auto"
        style={{ 
          backgroundColor: 'var(--crm-bg)',
          color: 'var(--crm-text)'
        }}
        initial={isMobile ? "mobile" : (isCollapsed ? "collapsed" : "expanded")}
        animate={isMobile ? "mobile" : (isCollapsed ? "collapsed" : "expanded")}
        variants={mainContentVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Contenedor centrado para el contenido */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={breadcrumbItems} 
            onNavigate={handleNavigate} 
          />
          
          {/* Page Content */}
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default InventorySidebarLayout;