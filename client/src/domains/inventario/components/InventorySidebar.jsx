import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FiHome,
  FiBox,
  FiTruck,
  FiActivity,
  FiAlertTriangle,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiDatabase,
  FiPackage,
  FiRepeat,
  FiMenu,
  FiUser,
  FiSearch,
  FiBell,
  FiHelpCircle,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import Logo from '../../img/logo.webp';
import DatabaseConnectionStatus from '../ui/DatabaseConnectionStatus';

// Componente para cada item de navegación
const NavItem = ({ icon: Icon, label, path, active, isCollapsed, hasBadge }) => {
  return (
    <Link
      to={path}
      className="relative group flex items-center p-3 my-1 rounded-lg transition-all duration-300"
      style={active 
        ? { background: 'var(--accent-color)', color: '#ffffff', boxShadow: '0 4px 6px -1px var(--shadow-color)' } 
        : { 
            color: 'var(--text-secondary)',
            ':hover': {
              backgroundColor: 'var(--component-hover)',
              color: 'var(--accent-color)'
            } 
          }
      }
    >
      {/* Indicador lateral para item activo */}
      {active && (
        <motion.div 
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full"
          style={{ backgroundColor: 'var(--accent-color)' }}
          layoutId="activeIndicator"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      <div className="relative flex items-center">
        <Icon size={20} className={active ? 'drop-shadow-md' : ''} />
        
        {/* Efecto de ping para alertas */}
        {hasBadge && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="ml-3 font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

const InventorySidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const timeoutRef = useRef(null);
  // const { user, logout } = useAuth(); // Uncomment when using real auth
  const { theme, toggleTheme } = useTheme(); // Hook para acceder al tema
  const isDark = theme === 'dark';
  
  // Estado para la animación inicial
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Efecto para la animación inicial
  useEffect(() => {
    if (!hasAnimated) {
      setTimeout(() => setHasAnimated(true), 300);
    }
  }, [hasAnimated]);
  
  // Función de logout temporal para pruebas
  const logout = () => {
    // Uncomment for real logout functionality
    // try {
    //   await logoutUser();
    //   navigate('/signin');
    //   toast.success('Sesión cerrada exitosamente');
    // } catch (error) {
    //   toast.error('Error al cerrar sesión');
    // }
    console.log('Logout clicked');
    toast.success('Sesión cerrada exitosamente');
    navigate('/signin');
  };

  // Función para manejar el mouseEnter
  const handleMouseEnter = () => {
    if (isCollapsed) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsCollapsed(false);
      }, 300); // Pequeño delay para evitar expansiones accidentales
    }
  };

  // Función para manejar el mouseLeave
  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 500); // Delay para dar tiempo al usuario si quiere volver
  };
  
  // Definir los elementos de navegación
  const mainNavItems = [
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
      icon: FiPackage, 
      label: 'Lotes', 
      path: '/inventory/lotes',
      active: location.pathname.includes('/lotes')
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
      active: location.pathname.includes('/alertas'),
      hasBadge: true
    }
  ];

  const secondaryNavItems = [
    { 
      icon: FiTruck, 
      label: 'Proveedores', 
      path: '/inventory/proveedores',
      active: location.pathname.includes('/proveedores')
    },
    { 
      icon: FiRepeat, 
      label: 'Unidades', 
      path: '/inventory/unidades-medida',
      active: location.pathname.includes('/unidades-medida')
    },
    { 
      icon: FiRepeat, 
      label: 'Conversiones', 
      path: '/inventory/conversiones',
      active: location.pathname.includes('/conversiones')
    },
    { 
      icon: FiSettings, 
      label: 'Tipos de Ajuste', 
      path: '/inventory/tipos-ajuste',
      active: location.pathname.includes('/tipos-ajuste')
    }
  ];

  // Animaciones para la barra lateral
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '72px' }
  };

  return (
    <motion.div 
      ref={sidebarRef}
      className="h-screen flex flex-col shadow-lg z-30 fixed left-0 top-0 overflow-hidden"
      style={{ 
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        borderRight: '1px solid var(--sidebar-border)'
      }}
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cabecera de la barra lateral */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
        <div className={`px-4 py-3 flex ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          style={{ 
            borderBottom: '1px solid var(--sidebar-border)',
            backgroundColor: 'var(--sidebar-bg)'
          }}>
          <Link to="/inventory" className="flex items-center">
            <img src={Logo} alt="Logo" className="h-10 w-auto" />
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="ml-2 font-bold text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Inventario
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-full"
              style={{ 
                color: 'var(--text-secondary)',
                ':hover': { backgroundColor: 'var(--component-hover)' } 
              }}
            >
              <FiChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className={`px-3 py-2 ${isCollapsed ? 'hidden' : 'block'}`} 
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-1"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                color: 'var(--input-text)', 
                borderColor: 'var(--input-border)',
                ":focus": { 
                  borderColor: 'var(--color-accent-primary)',
                  ringColor: 'var(--color-accent-primary)' 
                }
              }}
            />
            <FiSearch className="absolute left-2.5 top-2.5" style={{ color: 'var(--icon-color)' }} size={16} />
          </div>
        </div>

        {/* User profile section (Movido desde TopBar) */}
        <div className={`px-3 py-2 ${isCollapsed ? 'justify-center' : 'flex items-center'}`}
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          {isCollapsed ? (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                style={{ 
                  backgroundColor: 'var(--color-accent-secondary)', 
                  color: 'var(--accent-text)' 
                }}>
                <FiUser size={16} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                  style={{ 
                    backgroundColor: 'var(--color-accent-secondary)', 
                    color: 'var(--accent-text)' 
                  }}>
                  <FiUser size={16} />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Admin User</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>admin@example.com</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="p-1.5 rounded-full relative"
                  style={{ 
                    color: 'var(--icon-color)',
                    ':hover': { backgroundColor: 'var(--component-hover)' } 
                  }}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FiBell size={18} />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Elementos de navegación principal */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="px-3 my-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Principal</h3>
          )}
          
          {mainNavItems.map((item, index) => (
            <NavItem 
              key={item.path}
              icon={item.icon} 
              label={item.label} 
              path={item.path} 
              active={item.active}
              isCollapsed={isCollapsed}
              hasBadge={item.hasBadge}
            />
          ))}
        </div>
        
        {/* Navegación secundaria */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="px-3 my-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Configuración</h3>
          )}
          
          {secondaryNavItems.map((item, index) => (
            <NavItem 
              key={item.path}
              icon={item.icon} 
              label={item.label} 
              path={item.path} 
              active={item.active}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
      
      {/* Pie de la barra lateral */}
      <div className="mt-auto pt-2 pb-4 px-2" style={{ 
        borderTop: '1px solid var(--sidebar-border)',
        backgroundColor: 'var(--sidebar-footer-bg)'
      }}>
        {/* Estado de conexión a la base de datos */}
        <div className="mb-2 px-1">
          {isCollapsed ? (
            <div className="flex justify-center">
              <FiDatabase size={18} style={{ color: 'var(--alert-success-text)' }} title="Conexión a base de datos: Activa" />
            </div>
          ) : (
            <DatabaseConnectionStatus />
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          {/* Botón de alternancia de tema */}
          {!isCollapsed ? (
            <ThemeToggle className="flex items-center p-2 rounded-lg" style={{ 
              color: 'var(--text-secondary)',
              ':hover': { 
                backgroundColor: 'var(--component-hover)', 
                color: 'var(--accent-color)' 
              }
            }} />
          ) : (
            <div className="flex justify-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg"
                style={{ color: isDark ? 'var(--theme-toggle-light)' : 'var(--theme-toggle-dark)' }}
              >
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          )}
          
          {!isCollapsed && (
            <Link to="/help" className="flex items-center p-2 rounded-lg" style={{ 
              color: 'var(--text-secondary)',
              ':hover': { 
                backgroundColor: 'var(--component-hover)', 
                color: 'var(--accent-color)' 
              }
            }}>
              <FiHelpCircle size={20} />
              <span className="ml-3">Ayuda</span>
            </Link>
          )}
          
          <button
            onClick={logout}
            className="flex items-center p-2 rounded-lg"
            style={{ 
              color: 'var(--text-secondary)',
              ':hover': { 
                backgroundColor: 'var(--component-hover)', 
                color: 'var(--accent-color)' 
              }
            }}
          >
            <FiLogOut size={20} />
            {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
      
      {/* Panel de notificaciones (expandible) */}
      <AnimatePresence>
        {showNotifications && !isCollapsed && (
          <motion.div 
            className="absolute top-20 right-3 rounded-lg shadow-lg border w-72 z-50"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderColor: 'var(--card-border)' 
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-3" style={{ 
              borderBottom: '1px solid var(--card-border)' 
            }}>
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Notificaciones</h3>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="flex items-start p-2 rounded-lg cursor-pointer transition-colors duration-200"
                style={{ 
                  ':hover': { backgroundColor: 'var(--component-hover)' } 
                }}>
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full">
                  <FiAlertTriangle size={16} />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Stock bajo</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Azúcar: por debajo del mínimo</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Hace 10 minutos</p>
                </div>
              </div>
              <div className="flex items-start p-2 rounded-lg cursor-pointer transition-colors duration-200"
                style={{ 
                  ':hover': { backgroundColor: 'var(--component-hover)' } 
                }}>
                <div className="p-1.5 bg-red-100 text-red-600 rounded-full">
                  <FiAlertTriangle size={16} />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Alerta de caducidad</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lote L0023 caducará en 3 días</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Hace 35 minutos</p>
                </div>
              </div>
            </div>
            <div className="p-2" style={{ borderTop: '1px solid var(--card-border)' }}>
              <button 
                className="w-full text-center text-xs font-medium p-1 rounded transition-colors duration-200"
                style={{ 
                  color: 'var(--accent-color)',
                  ':hover': { 
                    backgroundColor: 'var(--component-hover)' 
                  }
                }}
              >
                Ver todas las notificaciones
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile menu button */}
      {isCollapsed && (
        <button
          className="lg:hidden fixed bottom-4 right-4 z-30 p-3 rounded-full shadow-lg"
          style={{ 
            backgroundColor: 'var(--accent-color)', 
            color: 'var(--accent-text)' 
          }}
          onClick={() => setIsCollapsed(false)}
        >
          <FiMenu size={20} />
        </button>
      )}
    </motion.div>
  );
};

export default InventorySidebar;