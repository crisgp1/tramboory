import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiBox, 
  FiTruck, 
  FiActivity, 
  FiAlertTriangle, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiChevronLeft
} from 'react-icons/fi';
import Logo from '../../img/logo.webp';

const InventorySidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  // Comentado temporalmente para pruebas
  // const { user, logout } = useAuth();
  
  // Función de logout temporal para pruebas
  const logout = () => {
    console.log('Logout clicked');
  };
  
  // Definir los elementos de navegación
  const navItems = [
    { 
      icon: FiHome, 
      label: 'Dashboard', 
      path: '/inventory',
      active: location.pathname === '/inventory'
    },
    { 
      icon: FiBox, 
      label: 'Materias Primas', 
      path: '/inventory/materias-primas',
      active: location.pathname.includes('/materias-primas')
    },
    { 
      icon: FiTruck, 
      label: 'Proveedores', 
      path: '/inventory/proveedores',
      active: location.pathname.includes('/proveedores')
    },
    { 
      icon: FiActivity, 
      label: 'Movimientos', 
      path: '/inventory/movimientos',
      active: location.pathname.includes('/movimientos')
    },
    { 
      icon: FiAlertTriangle, 
      label: 'Alertas', 
      path: '/inventory/alertas',
      active: location.pathname.includes('/alertas')
    }
  ];

  // Animaciones para la barra lateral
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '70px' }
  };

  return (
    <motion.div 
      className="h-screen bg-gray-900 text-white flex flex-col shadow-lg z-20 fixed left-0 top-0"
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Cabecera de la barra lateral */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <img src={Logo} alt="Logo" className="h-8 mr-2" />
              <span className="font-bold text-lg">Inventario</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>
      
      {/* Elementos de navegación */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} className="min-w-[20px]" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pie de la barra lateral */}
      <div className="p-4 border-t border-gray-800">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings"
              className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiSettings size={20} className="min-w-[20px]" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3"
                  >
                    Configuración
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiLogOut size={20} className="min-w-[20px]" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="ml-3"
                  >
                    Cerrar Sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default InventorySidebar;