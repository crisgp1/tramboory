import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiPhoneCall, FiMessageCircle, FiMail, FiMap } from 'react-icons/fi'
import ContactInfo from '../ui/ContactInfo'
import SocialLinks from '../ui/SocialLinks'
import WhatsAppButton from '../ui/WhatsAppButton'

/**
 * Sección de contacto mejorada que reúne toda la información
 * para comunicarse con Tramboory con efectos visuales sofisticados
 */
const ContactSection = () => {
  // Referencias para efectos de scroll
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Efectos de parallax basados en scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);
  
  return (
    <motion.section
      ref={sectionRef}
      id="contact"
      style={{ opacity, scale }}
      className="relative py-28 bg-gradient-to-b from-purple-900/90 via-indigo-950/90 to-purple-950/90 
        scroll-mt-20 overflow-hidden"
    >
      {/* Elementos decorativos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes de fondo mejorados */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-950/90 to-transparent backdrop-blur-sm"></div>
        
        {/* Gradientes decorativos */}
        <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-gradient-to-r from-green-500/10 to-transparent rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-t from-blue-500/10 to-transparent rounded-full blur-[70px]"></div>
        
        {/* Elementos circulares animados */}
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ 
            duration: 40, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute top-1/3 right-1/4 w-[35rem] h-[35rem] border border-green-500/5 rounded-full"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            rotate: [360, 0],
            opacity: [0.02, 0.05, 0.02] 
          }}
          transition={{ 
            duration: 50, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] border border-blue-500/5 rounded-full"
        ></motion.div>
        
        {/* Pequeños iconos decorativos */}
        {[FiPhoneCall, FiMessageCircle, FiMail, FiMap].map((Icon, index) => (
          <motion.div
            key={`icon-${index}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: index * 1.5
            }}
            className="absolute text-green-300/20"
            style={{
              fontSize: `${20 + index * 2}px`,
              top: `${10 + index * 20}%`,
              left: `${5 + index * 25}%`,
            }}
          >
            <Icon />
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Badge mejorado */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 
              backdrop-blur-sm px-5 py-2 rounded-full border border-green-500/30 mb-5">
              <FiMessageCircle className="text-green-300" />
              <span className="text-sm font-medium text-green-300 uppercase tracking-wider">
                Estamos Aquí Para Ti
              </span>
            </div>
            
            {/* Título mejorado */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-funhouse relative inline-block">
              ¿Listo para Celebrar?
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-green-300/0 via-green-300/70 to-green-300/0"
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
              Contáctanos y comienza a planear tu evento perfecto
            </motion.p>
          </motion.div>

          {/* Contenedor de contacto con efecto de brillo */}
          <div className="relative">
            {/* Efecto de brillo en el fondo */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-green-500/5 via-blue-500/5 to-green-500/5 rounded-3xl blur-lg"></div>
            
            {/* Contenedor principal */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-12 
                bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-2xl p-8 
                border border-white/10 shadow-xl z-10"
            >
              {/* Decoraciones en las esquinas */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-green-400/30 rounded-tl-lg z-20"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-green-400/30 rounded-tr-lg z-20"></div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-green-400/30 rounded-bl-lg z-20"></div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-green-400/30 rounded-br-lg z-20"></div>
              
              {/* Columna izquierda - Información de contacto */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6 relative"
              >
                {/* Efecto de brillo en hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ 
                    opacity: [0, 0.1, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                ></motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-6 font-funhouse relative inline-block">
                  Información de Contacto
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
                </h3>
                <ContactInfo />
              </motion.div>
              
              {/* Columna derecha - Whatsapp y redes sociales */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col space-y-8 relative"
              >
                {/* Efecto de brillo en hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ 
                    opacity: [0, 0.1, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                ></motion.div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white font-funhouse relative inline-block">
                    ¡Ponte en contacto con nosotros!
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Estamos aquí para hacer de tu evento algo extraordinario.
                    Contáctanos por WhatsApp o redes sociales y comienza a planear
                    tu celebración perfecta.
                  </p>
                </div>

                <div className="flex flex-col space-y-8">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <WhatsAppButton />
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <SocialLinks />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;