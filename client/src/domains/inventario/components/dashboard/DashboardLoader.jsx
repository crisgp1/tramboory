import { motion } from 'framer-motion';

// Mapa de colores hexadecimales para reemplazar las clases de Tailwind
const COLOR_MAP = {
  indigo: {
    300: '#a5b4fc',
    500: '#6366f1',
    600: '#4f46e5'
  },
  purple: {
    300: '#d8b4fe',
    500: '#a855f7',
    600: '#9333ea',
    800: '#6b21a8'
  },
  blue: {
    300: '#93c5fd',
    500: '#3b82f6',
    600: '#2563eb'
  },
  green: {
    300: '#86efac',
    500: '#22c55e',
    600: '#16a34a'
  },
  red: {
    300: '#fca5a5',
    500: '#ef4444',
    600: '#dc2626'
  }
};

/**
 * Componente de carga animado para el dashboard
 * 
 * @param {Object} props
 * @param {string} props.text - Texto a mostrar (por defecto: "Cargando dashboard...")
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.primaryColor - Color primario de la animación (por defecto: "indigo")
 * @param {string} props.secondaryColor - Color secundario de la animación (por defecto: "indigo")
 */
const DashboardLoader = ({ 
  text = "Cargando dashboard...", 
  className = "",
  primaryColor = "indigo",
  secondaryColor = "indigo"
}) => {
  // Obtener el color del texto de manera segura
  const textColor = COLOR_MAP[primaryColor]?.[600] || COLOR_MAP.indigo[600];
  
  return (
    <div className={`flex flex-col justify-center items-center h-[70vh] ${className}`}>
      <LoaderAnimation 
        primaryColor={primaryColor} 
        secondaryColor={secondaryColor} 
      />
      <p className="font-medium text-sm animate-pulse mt-4" style={{ color: textColor }}>
        {text}
      </p>
    </div>
  );
};

/**
 * Animación circular personalizada
 */
const LoaderAnimation = ({ primaryColor = "indigo", secondaryColor = "indigo" }) => {
  // Obtener colores seguros, con fallback a indigo si no existen
  const primaryDark = COLOR_MAP[primaryColor]?.[600] || COLOR_MAP.indigo[600];
  const primaryMid = COLOR_MAP[primaryColor]?.[500] || COLOR_MAP.indigo[500];
  const secondaryLight = COLOR_MAP[secondaryColor]?.[300] || COLOR_MAP.indigo[300];
  
  const circleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const spinTransition = {
    duration: 1.5,
    ease: "easeInOut",
    repeat: Infinity
  };

  return (
    <div className="relative">
      <motion.div
        initial="initial"
        animate="animate"
        variants={circleVariants}
        className="relative"
      >
        {/* Círculo exterior (girando en sentido horario) */}
        <motion.div 
          className="h-16 w-16 rounded-full"
          style={{
            borderTopWidth: '4px',
            borderBottomWidth: '4px',
            borderTopColor: primaryDark,
            borderBottomColor: primaryDark,
            borderTopStyle: 'solid',
            borderBottomStyle: 'solid'
          }}
          animate={{ rotate: 360 }}
          transition={spinTransition}
        />
        
        {/* Círculo interior (girando en sentido antihorario) */}
        <motion.div 
          className="absolute top-0 left-0 h-16 w-16 rounded-full"
          style={{
            borderRightWidth: '4px',
            borderLeftWidth: '4px',
            borderRightColor: secondaryLight,
            borderLeftColor: secondaryLight,
            borderRightStyle: 'solid',
            borderLeftStyle: 'solid'
          }}
          animate={{ rotate: -360 }}
          transition={{ ...spinTransition, duration: 2 }}
        />
        
        {/* Punto central pulsante */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 rounded-full"
          style={{
            backgroundColor: primaryMid
          }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
      </motion.div>
      
      {/* Sombra pulsante */}
      <motion.div 
        className="absolute top-full left-1/2 w-10 h-1 -ml-5 mt-3 bg-gray-200 rounded-full"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />
    </div>
  );
};

export default DashboardLoader;