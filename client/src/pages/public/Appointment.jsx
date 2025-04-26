import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NavbarPublic from '@/components/ui/NavbarPublic'
import {
  FiClock,
  FiImage,
  FiCoffee,
  FiMusic,
  FiUsers,
  FiArrowRight,
  FiCheck,
  FiX,
  FiPhone,
  FiMessageSquare,
  FiPlus,
  FiMinus
} from 'react-icons/fi'

// Componentes decorativos
import ParticlesBackground from './home-components/decorative/ParticlesBackground'
import AnimatedBalloons from './home-components/decorative/AnimatedBalloons'
import BackgroundVideoComponent from './home-components/decorative/BackgroundVideoComponent'

gsap.registerPlugin(ScrollTrigger)

/**
 * Componente de tarjeta de servicio para mostrar los paquetes 
 * disponibles con animaciones y detalles expandibles
 */
const ServiceCard = ({
  title,
  description,
  items,
  price,
  recommended,
  type
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  }

  const categoryVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1 }
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover='hover'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 relative cursor-pointer
            ${
              recommended
                ? 'border-4 border-yellow-400'
                : 'border border-white/20'
            }
            transform transition-all duration-300`}
    >
      {recommended && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='absolute -top-4 left-1/2 transform -translate-x-1/2'
        >
          <span className='bg-yellow-400 text-purple-900 px-6 py-2 rounded-full text-sm font-semibold shadow-lg'>
            Paquete Completo
          </span>
        </motion.div>
      )}

      {/* Efecto de brillo en hover */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none
              ${isHovered ? 'opacity-100' : 'opacity-0'}
              bg-gradient-to-r from-transparent via-white/10 to-transparent
              animate-shine`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6'
      >
        <span
          className={`text-sm font-semibold ${
            type === 'normal' ? 'text-yellow-300' : 'text-purple-300'
          }`}
        >
          {type === 'normal' ? 'Todo Incluido' : 'Renta de Espacio'}
        </span>
        <h3 className='text-2xl font-bold text-white mt-2'>{title}</h3>
        <p className='text-gray-300 mt-2'>{description}</p>

        <div className='mt-4 text-3xl font-bold text-white'>
          ${price}
          <span className='text-base font-normal text-gray-400'>/evento</span>
        </div>
      </motion.div>

      <div className='space-y-4 mb-8'>
        {Object.entries(items).map(([category, categoryItems], index) => (
          <motion.div
            key={category}
            className='rounded-lg overflow-hidden'
            initial={false}
            animate={expandedCategory === category ? 'expanded' : 'collapsed'}
          >
            <motion.button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
              className={`w-full text-left p-4 flex items-center justify-between
                    rounded-lg transition-colors duration-300
                    ${
                      expandedCategory === category
                        ? 'bg-purple-800/50 text-yellow-300'
                        : 'bg-purple-900/30 text-white hover:bg-purple-800/40'
                    }`}
            >
              <span className='font-semibold'>{category}</span>
              <motion.div
                animate={{ rotate: expandedCategory === category ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {expandedCategory === category ? <FiMinus /> : <FiPlus />}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedCategory === category && (
                <motion.div
                  initial='collapsed'
                  animate='expanded'
                  exit='collapsed'
                  variants={categoryVariants}
                  transition={{ duration: 0.3 }}
                  className='px-4 py-2 bg-purple-900/20 backdrop-blur-sm'
                >
                  {categoryItems.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.1 }}
                      className='flex items-start py-2'
                    >
                      {item.included ? (
                        <FiCheck className='text-green-400 mt-1 mr-3 flex-shrink-0 w-5 h-5' />
                      ) : (
                        <FiX className='text-red-400 mt-1 mr-3 flex-shrink-0 w-5 h-5' />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            item.included ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p
                            className={`text-sm ${
                              item.included ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div className='space-y-4' whileHover={{ scale: 1.02 }}>
        <Link
          to='/signin'
          className={`block w-full py-3 px-6 text-center rounded-lg font-semibold 
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${
                  type === 'normal'
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-900'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
        >
          Reservar Ahora
          <FiArrowRight className='inline ml-2' />
        </Link>

        <button
          onClick={() => (window.location.href = 'tel:+XXXXXXXXXX')}
          className='w-full py-3 px-6 text-center rounded-lg font-semibold 
                border-2 border-white/20 text-white hover:bg-white/10 
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg'
        >
          Llamar para Información
          <FiPhone className='inline ml-2' />
        </button>
      </motion.div>
    </motion.div>
  )
}

/**
 * Componente Appointment rediseñado para mantener consistencia con Home.jsx
 */
export default function Appointment () {
  // Referencias para elementos que necesitan animación
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  
  // Efecto GSAP para elementos animados en scroll
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.animate-on-scroll', {
        onEnter: batch =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            overwrite: true
          }),
        start: 'top bottom-=100',
        end: 'bottom top',
        markers: false
      })
    })

    return () => ctx.revert()
  }, [])

  // Toggle para el video de fondo
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Definición de servicios
  const services = {
    normal: {
      title: 'Tramboory Normal',
      description:
        'La experiencia completa con todos los servicios incluidos para una celebración perfecta.',
      price: '7,999',
      recommended: true,
      type: 'normal',
      items: {
        'Tiempo y Espacio': [
          {
            title: '4 Horas de Diversión',
            description: '3.5 horas de salón + 30 min de despedida',
            included: true
          }
        ],
        'Decoración y Personalización': [
          {
            title: 'Invitación Digital',
            description: 'Invitación personalizada para tu evento',
            included: true
          },
          {
            title: 'Decoración Temática',
            description: 'Ambientación Tramboory para tu fiesta',
            included: true
          }
        ],
        'Alimentos y Bebidas': [
          {
            title: 'Menú Completo',
            description: 'Alimentos para niños y adultos',
            included: true
          },
          {
            title: 'Bebidas Ilimitadas',
            description: 'Refrescos, agua y café de cortesía',
            included: true
          }
        ],
        'Entretenimiento y Personal': [
          {
            title: 'Área de Juegos',
            description: 'Ludoteca y alberca de pelotas',
            included: true
          },
          {
            title: 'Ambiente Festivo',
            description: 'Música y anfitriones para animar',
            included: true
          },
          {
            title: 'Coordinador de Evento',
            description: 'Personal dedicado para tu celebración',
            included: true
          }
        ]
      }
    },
    matutino: {
      title: 'Tramboory Matutino',
      description:
        'Renta del espacio para eventos personalizados con la opción de agregar servicios adicionales.',
      price: '4,999',
      recommended: false,
      type: 'matutino',
      items: {
        'Renta Básica': [
          {
            title: 'Espacio Exclusivo',
            description: 'Salón privado para tu evento',
            included: true
          },
          {
            title: 'Mobiliario Básico',
            description: 'Mesas y sillas incluidas',
            included: true
          },
          {
            title: 'Horario Matutino',
            description: '3 horas de evento',
            included: true
          }
        ],
        'Servicios Opcionales': [
          {
            title: 'Servicio de Alimentos',
            description: 'Personaliza el menú a tu gusto',
            included: false
          },
          {
            title: 'Decoración',
            description: 'Opción de decorar el espacio',
            included: false
          },
          {
            title: 'Personal de Servicio',
            description: 'Meseros y personal de apoyo opcional',
            included: false
          }
        ]
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 to-indigo-950">
      {/* Elementos decorativos de fondo */}
      <ParticlesBackground />
      <AnimatedBalloons />
      
      {/* Video de Fondo */}
      <BackgroundVideoComponent
        videoRef={videoRef}
        isVideoPlaying={isVideoPlaying}
        toggleVideo={toggleVideo}
      />

      {/* Navbar público */}
      <NavbarPublic />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-on-scroll">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-extrabold text-white mb-8 font-funhouse"
            >
              Elige tu Experiencia
              <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">Tramboory</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10"
            >
              Dos opciones perfectas para tu celebración: nuestro paquete todo
              incluido o personaliza tu evento a tu manera en horario matutino.
            </motion.p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ServiceCard {...services.normal} />
              <ServiceCard {...services.matutino} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800/90 to-indigo-800/90 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-6 font-funhouse">
              ¿Tienes dudas sobre nuestros servicios?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Nuestro equipo está listo para ayudarte a elegir la mejor opción
              para tu evento
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg 
                        bg-white text-purple-900 font-semibold hover:bg-gray-100 
                        transition-all duration-300 transform hover:scale-105"
              >
                <FiMessageSquare className="mr-2" />
                Contáctanos
              </Link>
              <a
                href="tel:+XXXXXXXXXX"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg 
                        border-2 border-white text-white font-semibold hover:bg-white/10 
                        transition-all duration-300 transform hover:scale-105"
              >
                <FiPhone className="mr-2" />
                Llamar Ahora
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
