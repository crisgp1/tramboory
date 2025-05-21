import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FadeInUp from './FadeInUp';
import { BORDER_COLORS, BG_COLORS, TEXT_COLORS } from './dashboardConstants';

/**
 * Componente para accesos rápidos a las principales acciones del sistema
 * 
 * @param {Object} props
 * @param {Function} props.icon - Componente de icono a mostrar
 * @param {string} props.title - Título del acceso rápido
 * @param {string} props.path - Ruta de navegación
 * @param {string} props.color - Color del acceso rápido (primary, success, warning, danger, purple, pink) 
 * @param {number} props.delay - Retraso de la animación
 * @param {string} props.description - Descripción opcional (solo se muestra en pantallas mayores)
 */
const QuickAccess = ({ 
  icon: Icon, 
  title, 
  path, 
  color = 'primary', 
  delay = 0,
  description
}) => {
  // Mapear el nombre del color a las clases correspondientes
  const borderColor = BORDER_COLORS[color] || BORDER_COLORS.primary;
  const bgColor = BG_COLORS[color] || BG_COLORS.primary;
  const textColor = TEXT_COLORS[color] || TEXT_COLORS.primary;

  return (
    <FadeInUp delay={delay} className="h-full">
      <Link 
        to={path} 
        className={`flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 h-full group relative overflow-hidden`}
      >
        {/* Borde superior decorativo */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${borderColor.replace('border-', 'bg-')}`}></div>
        
        <div className={`p-3 rounded-full ${bgColor} mb-2 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={textColor} size={20} />
        </div>
        
        <span className="font-medium text-sm text-center">{title}</span>
        
        {description && (
          <p className="text-xs text-gray-500 mt-1 text-center hidden sm:block">{description}</p>
        )}
        
        {/* Efecto de hover */}
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${borderColor.replace('border-', 'bg-')}`}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Fondo decorativo en hover */}
        <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      </Link>
    </FadeInUp>
  );
};

export default QuickAccess;