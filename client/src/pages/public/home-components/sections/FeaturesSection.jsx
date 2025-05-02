import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  FiCheckCircle, 
  FiGift, 
  FiHeart, 
  FiStar, 
  FiUsers, 
  FiMusic,
  FiAward
} from 'react-icons/fi'
import FeatureCard from '../ui/FeatureCard'

/**
 * Sección mejorada que muestra las características destacadas
 * con efectos visuales sofisticados y animaciones avanzadas
 */
const FeaturesSection = () => {
  // Referencias para efectos de scroll
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  
  // Variantes para animaciones secuenciales
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  // Características destacadas
  const features = [
    {
      icon: FiCheckCircle,
      title: 'Diversión Garantizada',
      description: 'Cada momento está lleno de risas y alegría',
      color: 'green'
    },
    {
      icon: FiGift,
      title: 'Paquetes Flexibles',
      description: 'Adaptados a tus necesidades y presupuesto',
      color: 'yellow'
    },
    {
      icon: FiHeart,
      title: 'Atención Personalizada',
      description: 'Cuidamos cada detalle de tu evento',
      color: 'pink'
    },
    {
      icon: FiStar,
      title: 'Experiencia Premium',
      description: 'Instalaciones y servicio de primera',
      color: 'blue'
    },
    {
      icon: FiUsers,
      title: 'Personal Profesional',
      description: 'Equipo experto y dedicado',
      color: 'purple'
    },
    {
      icon: FiMusic,
      title: 'Ambiente Festivo',
      description: 'Música y animación garantizada',
      color: 'red'
    }
  ];

  return (
    <motion.section
      ref={sectionRef}
      id="features"
      style={{ opacity, scale }}
      className="relative py-28 bg-gradient-to-b from-purple-900/90 via-indigo-950/90 to-purple-900/90 
        scroll-mt-20 overflow-hidden"
    >
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes de fondo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        <div className="absolute -top-20 -left-20 w-[28rem] h-[28rem] bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-t from-indigo-500/10 to-transparent rounded-full blur-[70px]"></div>
        
        {/* Círculos decorativos animados */}
        <motion.div 
          animate={{ 
            rotate: [0, 180],
            scale: [1, 1.05, 1],
            opacity: [0.05, 0.08, 0.05] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/3 left-1/4 w-[36rem] h-[36rem] border border-blue-500/5 rounded-full"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            rotate: [180, 0],
            scale: [1, 1.03, 1],
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute bottom-1/4 right-1/3 w-[32rem] h-[32rem] border border-purple-500/5 rounded-full"
        ></motion.div>
        
        {/* Elementos decorativos aleatorios */}
        {[...Array(12)].map((_, index) => (
          <motion.div 
            key={`particle-${index}`}
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2 + index % 3,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{ 
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${5 + Math.random() * 90}%`, 
              left: `${5 + Math.random() * 90}%`,
              backgroundColor: index % 3 === 0 ? 'rgba(147, 197, 253, 0.3)' : // blue
                             index % 3 === 1 ? 'rgba(196, 181, 253, 0.3)' : // purple
                             'rgba(252, 211, 77, 0.3)', // yellow
              filter: "blur(1px)"
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Badge mejorado - Ahora posicionado correctamente */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 
              backdrop-blur-sm px-5 py-2 rounded-full border border-blue-500/30">
              <FiAward className="text-blue-300" />
              <span className="text-[0.96em] font-medium text-blue-300 uppercase tracking-wider">
                Por Qué Elegirnos
              </span>
            </div>
          </div>
          
          {/* Título mejorado */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-funhouse relative inline-block">
            La Experiencia Tramboory
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-300/0 via-blue-300/70 to-blue-300/0"
              animate={{ 
                scaleX: [0, 1, 1, 0],
                x: ["-100%", "0%", "0%", "100%"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </h2>
          
          {/* Descripción mejorada */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            Descubre por qué somos la mejor opción para tu celebración
            <FiStar className="inline ml-2 text-sm text-blue-300" />
          </motion.p>
        </motion.div>

        {/* Grid con efecto de brillo */}
        <div className="relative">
          {/* Efectos de iluminación */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/5 via-purple-500/0 to-purple-500/5 rounded-3xl blur-3xl -z-10"></div>
          
          {/* Grid de tarjetas */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;