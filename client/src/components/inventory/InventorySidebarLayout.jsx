import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InventorySidebar from './InventorySidebar';

const InventorySidebarLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Alternar el estado de la barra lateral
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Variantes para la animación del contenido principal
  const mainContentVariants = {
    expanded: { marginLeft: '240px' },
    collapsed: { marginLeft: '70px' },
    mobile: { marginLeft: '0px' }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Barra lateral */}
      <InventorySidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      
      {/* Contenido principal */}
      <motion.main 
        className="flex-1 overflow-auto"
        initial={isMobile ? "mobile" : (isCollapsed ? "collapsed" : "expanded")}
        animate={isMobile ? "mobile" : (isCollapsed ? "collapsed" : "expanded")}
        variants={mainContentVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Botón para mostrar sidebar en móvil */}
        {isMobile && isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-30 bg-indigo-600 text-white p-2 rounded-md shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Contenedor centrado para el contenido */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          {children}
        </div>
      </motion.main>
      
      {/* Overlay para cerrar sidebar en móvil */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  );
};

export default InventorySidebarLayout;