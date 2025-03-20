import { motion } from 'framer-motion';
import { FiBox, FiLoader, FiPackage } from 'react-icons/fi';

const InventoryLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Elementos decorativos - formas geométricas sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="relative mb-6">
          {/* Círculo pulsante exterior */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-indigo-100"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.5, 0.7] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
            {/* Anillo giratorio */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-indigo-400"
              style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Icono central */}
            <div className="relative z-10 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <FiPackage className="w-10 h-10 text-indigo-600" />
              </motion.div>
            </div>
          </div>
        </div>
        
        <motion.h3
          className="text-2xl font-semibold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Cargando Inventario
        </motion.h3>
        
        <motion.p
          className="text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Preparando el sistema
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >...</motion.span>
        </motion.p>
        
        {/* Barra de progreso */}
        <motion.div
          className="w-60 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-indigo-500"
            animate={{ 
              width: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        
        {/* Pequeños íconos flotando */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['box', 'package', 'box'].map((icon, i) => (
            <motion.div
              key={i}
              className="absolute text-indigo-300/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [Math.random() * -40, Math.random() * 40],
                x: [Math.random() * -40, Math.random() * 40],
                opacity: [0, 0.3, 0],
                rotate: [0, 180]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            >
              {icon === 'box' ? (
                <FiBox size={Math.random() * 20 + 10} />
              ) : (
                <FiPackage size={Math.random() * 20 + 10} />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default InventoryLoader;