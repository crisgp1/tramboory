import { useState, useEffect } from 'react';
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
  FiChevronLeft,
  FiDatabase
} from 'react-icons/fi';
import Logo from '../../img/logo.webp';
import DatabaseConnectionStatus from '../ui/DatabaseConnectionStatus';

// Componente para cada item de navegación
const NavItem = ({ icon: Icon, label, path, active, isCollapsed }) => {
  return (
    <Link
      to={path}
      className={`relative group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      {/* Animación de brillo en hover */}
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      )}
      
      {/* Indicador lateral para item activo */}
      {active && (
        <motion.div 
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-indigo-400 rounded-full"
          layoutId="activeIndicator"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      <motion.div
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon size={isCollapsed ? 24 : 22} className={active ? 'drop-shadow-md' : ''} />
        
        {/* Efecto de ping para alertas */}
        {label === 'Alertas' && (
          <motion.span 
            className="absolute -top-1 -right-1 flex h-2 w-2"
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </motion.span>
        )}
      </motion.div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-xs font-medium mt-2 text-center"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

const InventorySidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  // Comentado temporalmente para pruebas
  // const { user, logout } = useAuth();
  
  // Estado para la animación inicial
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Efecto para la animación inicial
  useEffect(() => {
    if (!hasAnimated) {
      setTimeout(() => setHasAnimated(true), 300);
    }
  }, [hasAnimated]);
  
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
    collapsed: { width: '80px' }
  };

  return (
    <motion.div 
      className="h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col shadow-xl z-20 fixed left-0 top-0 overflow-hidden"
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Cabecera de la barra lateral */}
      <div className="relative">
        <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} 
          border-b border-gray-800/50 bg-gradient-to-r from-gray-900/70 to-gray-900/70`}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full"
              >
                <img src={Logo} alt="Logo" className="h-10 mr-2" />
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-100"
                >
                  Inventario
                </motion.span>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <img src={Logo} alt="Logo" className="h-10 drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isCollapsed && (
            <motion.button 
              onClick={toggleSidebar}
              className="p-1.5 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiChevronLeft size={18} />
            </motion.button>
          )}
        </div>
        
        {/* Efecto decorativo superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0"></div>
      </div>
      
      {/* Elementos de navegación */}
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <AnimatePresence>
          {hasAnimated && (
            <motion.ul 
              className="space-y-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {navItems.map((item, index) => (
                <motion.li 
                  key={index}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                  }}
                >
                  <NavItem 
                    icon={item.icon} 
                    label={item.label} 
                    path={item.path} 
                    active={item.active}
                    isCollapsed={isCollapsed}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      
      {/* Pie de la barra lateral */}
      <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/70 to-gray-900/70">
        {/* Estado de conexión a la base de datos */}
        <div className="mb-4">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <DatabaseConnectionStatus />
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <FiDatabase
                  size={22}
                  className="text-green-500 drop-shadow-md cursor-pointer"
                  title="Estado de conexión a la base de datos"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <ul className="space-y-3">
          <li className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <Link
                to="/settings"
                className={`flex flex-col items-center p-2 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors ${isCollapsed ? 'w-full justify-center' : 'w-full justify-center'}`}
              >
                <FiSettings size={isCollapsed ? 22 : 20} className="drop-shadow-sm" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5"
                    >
                      Configuración
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          </li>
          <li className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full"
            >
              <button
                onClick={logout}
                className={`w-full flex flex-col items-center p-2 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors ${isCollapsed ? 'justify-center' : 'justify-center'}`}
              >
                <FiLogOut size={isCollapsed ? 22 : 20} className="drop-shadow-sm" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5"
                    >
                      Cerrar Sesión
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </li>
        </ul>
        
        {/* Efecto decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0"></div>
      </div>
      
      {/* Toggle button para móvil */}
      {isCollapsed && (
        <motion.div 
          className="absolute top-20 -right-3 z-30"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={toggleSidebar}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-1.5 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiMenu size={16} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InventorySidebar;