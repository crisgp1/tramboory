import { useState } from 'react';
import { QuickAccess, FadeInUp } from '../';
import { 
  FiShoppingBag, 
  FiBox, 
  FiTrendingUp, 
  FiTruck, 
  FiDollarSign, 
  FiPieChart,
  FiPackage,
  FiTool,
  FiActivity,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiSettings
} from 'react-icons/fi';

/**
 * Componente para la pestaña de Acciones Rápidas
 * 
 * @param {Object} props
 * @param {string} props.className - Clases CSS adicionales
 */
const AccionesTab = ({ className = "" }) => {
  const [activeGuideTab, setActiveGuideTab] = useState('productos');

  // Acciones principales
  const quickAccesses = [
    {
      icon: FiShoppingBag,
      title: "Nueva Materia Prima",
      path: "/inventory/materias-primas/new",
      color: "primary",
      description: "Registra un nuevo insumo o material"
    },
    {
      icon: FiBox,
      title: "Nuevo Lote",
      path: "/inventory/lotes/new",
      color: "success", 
      description: "Registra un nuevo lote de productos"
    },
    {
      icon: FiTrendingUp,
      title: "Registrar Movimiento",
      path: "/inventory/movimientos/new",
      color: "purple", 
      description: "Entrada o salida de inventario"
    },
    {
      icon: FiTruck,
      title: "Nuevo Proveedor",
      path: "/inventory/proveedores/new",
      color: "warning",
      description: "Agrega un proveedor al sistema"
    },
    {
      icon: FiDollarSign,
      title: "Ajustar Precios",
      path: "/inventory/precios",
      color: "pink",
      description: "Actualiza precios de materiales"
    },
    {
      icon: FiPieChart,
      title: "Ver Reportes",
      path: "/inventory/reports",
      color: "danger",
      description: "Consulta reportes y estadísticas"
    }
  ];

  // Guías y recursos
  const guides = {
    productos: [
      {
        icon: FiPackage,
        title: "Guía de Registro de Productos",
        description: "Aprende a registrar nuevos productos y categorías en el sistema de inventario."
      },
      {
        icon: FiClipboard,
        title: "Gestión de Lotes",
        description: "Conoce cómo administrar lotes y fechas de caducidad de forma eficiente."
      }
    ],
    movimientos: [
      {
        icon: FiActivity,
        title: "Registro de Movimientos",
        description: "Guía para el registro correcto de entradas, salidas y ajustes de inventario."
      },
      {
        icon: FiTool,
        title: "Conversiones de Unidades",
        description: "Aprende a configurar y utilizar las conversiones entre unidades de medida."
      }
    ],
    reportes: [
      {
        icon: FiGrid,
        title: "Reportes Personalizados",
        description: "Crea y personaliza reportes según tus necesidades específicas."
      },
      {
        icon: FiFileText,
        title: "Exportación de Datos",
        description: "Exporta tus datos a diferentes formatos para su análisis externo."
      }
    ]
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Título y opciones de configuración */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiGrid className="mr-2 text-indigo-500" size={20} />
          Acciones Rápidas
        </h2>
        <button className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 py-1.5 px-3 rounded-lg flex items-center font-medium transition-colors">
          <FiSettings className="mr-1.5" size={14} />
          Personalizar
        </button>
      </div>
      
      {/* Accesos rápidos principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quickAccesses.map((access, index) => (
          <QuickAccess 
            key={access.path}
            icon={access.icon} 
            title={access.title} 
            path={access.path} 
            color={access.color} 
            delay={0.1 * index}
            description={access.description}
          />
        ))}
      </div>
      
      {/* Sección de guías y recursos */}
      <FadeInUp delay={0.4}>
        <div className="mt-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-indigo-800 flex items-center">
              <FiHelpCircle className="mr-2" size={18} />
              Guías y Recursos
            </h3>
            <div className="text-xs bg-white text-gray-600 rounded-lg border border-indigo-100 overflow-hidden flex">
              <button 
                onClick={() => setActiveGuideTab('productos')}
                className={`px-3 py-1.5 font-medium ${
                  activeGuideTab === 'productos' 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-indigo-50'
                }`}
              >
                Productos
              </button>
              <button 
                onClick={() => setActiveGuideTab('movimientos')}
                className={`px-3 py-1.5 font-medium ${
                  activeGuideTab === 'movimientos' 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-indigo-50'
                }`}
              >
                Movimientos
              </button>
              <button 
                onClick={() => setActiveGuideTab('reportes')}
                className={`px-3 py-1.5 font-medium ${
                  activeGuideTab === 'reportes' 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-indigo-50'
                }`}
              >
                Reportes
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {guides[activeGuideTab].map((guide, index) => (
              <GuideCard
                key={index}
                icon={guide.icon}
                title={guide.title}
                description={guide.description}
              />
            ))}
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

// Componente para tarjetas de guía
const GuideCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-lg p-4 border border-indigo-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center mb-2">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <Icon size={16} />
      </div>
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <p className="text-xs text-gray-600">{description}</p>
    <div className="mt-3 flex justify-end">
      <button className="text-xs text-indigo-600 hover:underline font-medium flex items-center">
        Ver guía
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
);

export default AccionesTab;