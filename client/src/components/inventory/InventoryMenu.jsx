import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, 
  FiHome, 
  FiArchive, 
  FiTruck, 
  FiBox, 
  FiRepeat, 
  FiSettings, 
  FiAlertTriangle,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

const InventoryMenu = ({ activeSection, setActiveSection }) => {
  // Inicialmente cerrado en móvil, abierto en desktop
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Detectar si estamos en desktop o móvil para configuración inicial
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };
    
    // Configuración inicial
    handleResize();
    
    // Listener para cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: FiHome, label: 'Dashboard' },
    { id: 'materias-primas', icon: FiPackage, label: 'Materias Primas' },
    { id: 'unidades-medida', icon: FiRepeat, label: 'Unidades de Medida' },
    { id: 'proveedores', icon: FiTruck, label: 'Proveedores' },
    { id: 'lotes', icon: FiBox, label: 'Lotes' },
    { id: 'movimientos', icon: FiRefreshCw, label: 'Movimientos' },
    { id: 'tipos-ajuste', icon: FiSettings, label: 'Tipos de Ajuste' },
    { id: 'conversiones', icon: FiRepeat, label: 'Conversiones' },
    { id: 'alertas', icon: FiAlertTriangle, label: 'Alertas' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mini barra lateral para dispositivos móviles cuando el menú está cerrado
  const MiniNavbar = () => (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-indigo-700 text-white flex justify-around items-center py-2 px-1 z-10 shadow-lg">
      {menuItems.slice(0, 5).map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveSection(item.id);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
            activeSection === item.id
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-100'
          }`}
          aria-label={item.label}
        >
          <item.icon className="text-lg" />
          <span className="text-xs mt-1 hidden sm:block">{item.label.substring(0, 5)}</span>
        </button>
      ))}
      <button
        onClick={toggleMenu}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-indigo-100"
        aria-label="Más opciones"
      >
        <FiChevronRight className="text-lg" />
        <span className="text-xs mt-1 hidden sm:block">Más</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        className="lg:hidden fixed top-3 left-3 z-30 p-2 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center w-10 h-10"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Menú lateral principal */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className={`fixed lg:static z-20 h-[calc(100%-4rem)] lg:h-full bg-indigo-700 text-white w-[260px] lg:w-64 p-4 pt-16 lg:pt-6 shadow-lg overflow-y-auto flex flex-col`}
            >
              <div className="flex items-center mb-6 px-2">
                <FiArchive className="text-white mr-3 text-xl" />
                <h1 className="text-xl font-bold">Inventario</h1>
              </div>

              <nav className="flex-1">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          if (window.innerWidth < 1024) {
                            setIsMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                          activeSection === item.id
                            ? 'bg-indigo-500 text-white font-medium shadow-sm'
                            : 'text-indigo-100 hover:bg-indigo-600'
                        }`}
                      >
                        <item.icon className="mr-3 text-lg" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pt-4 mt-auto border-t border-indigo-600 hidden lg:block">
                <p className="px-3 text-xs text-indigo-300">Sistema de Inventario v1.0</p>
              </div>
            </motion.aside>

            {/* Overlay para cerrar el menú en móvil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsMenuOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Barra inferior de navegación rápida en móvil */}
      {!isMenuOpen && <MiniNavbar />}
    </>
  );
};

export default InventoryMenu;