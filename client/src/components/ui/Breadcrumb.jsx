import React from 'react';
import { HiChevronRight, HiHome } from 'react-icons/hi';

/**
 * Componente Breadcrumb para mostrar la ruta de navegación actual
 * 
 * @param {Object} props
 * @param {Array} props.items - Array de objetos con las propiedades 'label' y 'path'
 * @param {Function} props.onNavigate - Función a ejecutar cuando se hace clic en un elemento
 */
const Breadcrumb = ({ items = [], onNavigate = () => {} }) => {
  return (
    <nav className="flex items-center mb-4 text-sm">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <HiHome className="mr-1 h-4 w-4" />
        <span>Inicio</span>
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <HiChevronRight className="mx-2 h-4 w-4 text-gray-400" />
          <button
            onClick={() => onNavigate(item.path || '')}
            className={`
              flex items-center hover:text-indigo-600 transition-colors
              ${index === items.length - 1 ? 'font-medium text-indigo-700' : 'text-gray-500'}
            `}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;