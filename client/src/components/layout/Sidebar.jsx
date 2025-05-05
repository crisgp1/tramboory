import { useState, useCallback, useEffect } from 'react';
import { useUiStore } from '@/store';
import { 
  HiOutlineUsers, HiOutlineCalendar, HiOutlineCurrencyDollar,
  HiOutlineShoppingBag, HiOutlineTicket, HiOutlineCake,
  HiOutlinePhotograph, HiOutlineCreditCard, HiOutlineDocumentReport,
  HiOutlineArchive, HiOutlineChartBar, HiX, HiChevronDown, 
  HiChevronRight, HiOutlineHome, HiOutlineCog, HiOutlineClipboardList
} from 'react-icons/hi';

// Estructura de navegación organizada por categorías con submenús
const navigationStructure = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HiOutlineHome,
    items: [
      { id: 'dashboard', label: 'Panel Principal', icon: HiOutlineChartBar }
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: HiOutlineUsers,
    items: [
      { id: 'users', label: 'Gestión de Usuarios', icon: HiOutlineUsers }
    ]
  },
  {
    id: 'reservaciones',
    label: 'Reservaciones',
    icon: HiOutlineCalendar,
    items: [
      { id: 'reservations', label: 'Reservas Activas', icon: HiOutlineCalendar },
      { id: 'archived', label: 'Reservas Archivadas', icon: HiOutlineArchive }
    ]
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: HiOutlineCurrencyDollar,
    items: [
      { id: 'finances', label: 'Registro Financiero', icon: HiOutlineCurrencyDollar },
      { id: 'payments', label: 'Pagos', icon: HiOutlineCreditCard }
    ]
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    icon: HiOutlineClipboardList,
    items: [
      { id: 'packages', label: 'Paquetes', icon: HiOutlineShoppingBag },
      { id: 'extras', label: 'Extras', icon: HiOutlineTicket },
      { id: 'opcionesAlimento', label: 'Alimentos', icon: HiOutlineCake },
      { id: 'tematicas', label: 'Temáticas', icon: HiOutlinePhotograph },
      { id: 'mamparas', label: 'Mamparas', icon: HiOutlinePhotograph }
    ]
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: HiOutlineCog,
    items: [
      { id: 'galeria', label: 'Galería', icon: HiOutlinePhotograph },
      { id: 'auditoria', label: 'Auditoría', icon: HiOutlineDocumentReport }
    ]
  }
];

const Sidebar = ({ open, setOpen, isMobile }) => {
  const { activeTab, setActiveTab } = useUiStore();
  
  // Estado para controlar qué categorías están expandidas
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Encuentra la categoría activa basada en el activeTab actual
  useEffect(() => {
    const findCategoryForTab = () => {
      for (const category of navigationStructure) {
        const foundItem = category.items.find(item => item.id === activeTab);
        if (foundItem) {
          setExpandedCategories(prev => ({
            ...prev,
            [category.id]: true
          }));
          return;
        }
      }
    };
    
    findCategoryForTab();
  }, [activeTab]);
  
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  const handleNavClick = useCallback((tabId) => {
    setActiveTab(tabId);
    if (isMobile) setOpen(false);
  }, [setActiveTab, isMobile, setOpen]);
  
  // Función para obtener la ruta de navegación actual (breadcrumb)
  const getCurrentPath = useCallback(() => {
    for (const category of navigationStructure) {
      const item = category.items.find(item => item.id === activeTab);
      if (item) {
        return `${category.label} / ${item.label}`;
      }
    }
    return '';
  }, [activeTab]);
  
  return (
    <div 
      className={`${open ? 'w-64' : 'w-0 lg:w-20'} transition-all duration-300 h-full shadow-lg z-50 ${isMobile && open ? 'fixed' : ''} flex flex-col`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {isMobile && open && (
        <div className="flex justify-end p-4">
          <button onClick={() => setOpen(false)} style={{ color: 'var(--icon-color)' }}>
            <HiX className="h-6 w-6" />
          </button>
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="p-4" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <img
            src={open ? "/img/LogoComplete.webp" : "/img/logo.webp"}
            alt=""
            className={`${open ? 'mx-auto w-32' : 'mx-auto w-10'} transition-all duration-300`}
          />
        </div>
        
        {/* Ruta de navegación actual (breadcrumb) */}
        {open && (
          <div className="text-xs px-4 py-2" 
            style={{ 
              color: 'var(--color-text-secondary)', 
              borderBottom: '1px solid var(--sidebar-border)' 
            }}
          >
            {getCurrentPath()}
          </div>
        )}
        
        <div className="flex-1 py-2 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {navigationStructure.map((category) => (
              <div key={category.id} className="mb-2">
                {/* Encabezado de categoría */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full p-2 rounded-md transition-colors duration-200"
                  style={{ 
                    backgroundColor: category.items.some(item => item.id === activeTab) 
                      ? 'var(--crm-active-bg)' 
                      : 'transparent',
                    color: category.items.some(item => item.id === activeTab)
                      ? 'var(--crm-active-text)'
                      : 'var(--sidebar-text)'
                  }}
                >
                  <div className="flex items-center">
                    <category.icon className="w-5 h-5 mr-3" />
                    {open && <span className="font-medium">{category.label}</span>}
                  </div>
                  {open && (
                    expandedCategories[category.id] 
                      ? <HiChevronDown className="w-5 h-5" /> 
                      : <HiChevronRight className="w-5 h-5" />
                  )}
                </button>
                
                {/* Elementos de la categoría */}
                {(open && expandedCategories[category.id]) && (
                  <div className="mt-1 pl-4 space-y-1">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className="flex items-center w-full p-2 rounded-md transition-colors duration-200"
                        style={{ 
                          backgroundColor: activeTab === item.id 
                            ? 'var(--crm-active-bg)' 
                            : 'transparent',
                          color: activeTab === item.id
                            ? 'var(--crm-active-text)'
                            : 'var(--sidebar-text)'
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
              style={{ 
                backgroundColor: 'var(--color-accent-primary)', 
                color: 'var(--color-bg-primary)' 
              }}
            >
              <HiOutlineUsers className="w-4 h-4" />
            </div>
            {open && (
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>
                  Admin User
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  admin@example.com
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;