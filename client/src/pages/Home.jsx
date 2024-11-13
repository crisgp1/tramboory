import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import {
  FiMenu,
  FiX,
  FiCalendar,
  FiPackage,
  FiMail,
  FiLogIn,
  FiUserPlus,
  FiCheckCircle,
  FiGift,
  FiStar,
  FiInstagram,
  FiPhone,
  FiArrowRight,
  FiPlay,
  FiPause,
  FiClock,
  FiUsers,
  FiMusic,
  FiCoffee,
  FiSmile,
  FiHeart,
  FiMapPin,
  FiCheck,
  FiMessageCircle
} from 'react-icons/fi'
import Logo from '../img/logo.webp'
import BackgroundVideo from '../video/background.webm'

// Registrar GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// Componentes auxiliares
const BackgroundVideoComponent = ({ videoRef, isVideoPlaying, toggleVideo }) => (
  <div className="fixed inset-0 z-0">
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="absolute min-w-full min-h-full object-cover w-full h-full"
    >
      <source src={BackgroundVideo} type="video/webm" />
    </video>
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <button
      onClick={toggleVideo}
      className="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md
        hover:bg-white/20 transition-all duration-300"
    >
      {isVideoPlaying ? (
        <FiPause className="text-white text-xl" />
      ) : (
        <FiPlay className="text-white text-xl" />
      )}
    </button>
  </div>
)

const NavigationBar = ({ toggleMenu, isMenuOpen }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
    <div className="container mx-auto px-6 py-4">
      <div className="flex justify-between items-center">
        <Link to="/">
          <motion.img
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            src={Logo}
            alt="Tramboory"
            className="h-16 w-auto transition-transform duration-300 hover:scale-110"
          />
        </Link>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={toggleMenu}
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
      </div>
    </div>
  </nav>
)

const FullscreenMenu = ({ isOpen, menuRef, menuBackgroundRef, menuItems, onMenuItemClick }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center"
      >
        <motion.div
          ref={menuBackgroundRef}
          className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-lg"
          initial={{ scale: 0, borderRadius: '100%' }}
          animate={{ scale: 1, borderRadius: '0%' }}
          exit={{ scale: 0, borderRadius: '100%' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <ul className="relative z-50 space-y-8">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.text}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.link}
                className="group flex items-center justify-center space-x-4 text-white text-2xl
                  hover:text-yellow-300 transition-all duration-300"
                onClick={() => onMenuItemClick()}
              >
                <span className="text-3xl text-yellow-300 group-hover:text-white
                  transition-colors duration-300">
                  {item.icon}
                </span>
                <span className="relative">
                  {item.text}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-300
                    transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    )}
  </AnimatePresence>
)

const ServiceCard = ({ service, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
        bounce: 0.3,
        delay: index * 0.2
      }
    },
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        delay: i * 0.1
      }
    })
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-50px" }}
      className={`service-card relative p-8 rounded-2xl backdrop-blur-lg 
        transform-gpu will-change-transform hover:shadow-xl
        transition-colors duration-300
        ${
          service.recommended
            ? 'bg-white/15 border-2 border-yellow-400/50'
            : 'bg-white/10 border border-white/20'
        }`}
    >
      {service.recommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-yellow-400 text-purple-900 px-4 py-1 rounded-full
            text-sm font-semibold shadow-lg">
            Recomendado
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
        <p className="text-gray-300">{service.description}</p>
        <div className="text-3xl font-bold text-yellow-400 mt-4">
          ${service.price}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {service.features.map((feature, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            variants={featureVariants}
            className="flex items-start space-x-3"
          >
            <feature.icon className="flex-shrink-0 w-5 h-5 text-yellow-400 mt-1" />
            <div>
              <p className="font-medium text-white font-funhouse">{feature.title}</p>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {service.highlights.map((highlight, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="px-3 py-1 rounded-full text-sm font-medium
              bg-white/10 text-yellow-400 border border-yellow-400/30"
          >
            {highlight}
          </motion.span>
        ))}
      </div>

      <Link to="/appointments">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold 
            transition-all duration-300 transform-gpu
            ${
              service.recommended
                ? 'bg-yellow-400 text-purple-900 hover:bg-yellow-500'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          Reservar Ahora
          <FiArrowRight className="inline-block ml-2" />
        </motion.button>
      </Link>
    </motion.div>
  )
}
// Componente FeatureCard
const FeatureCard = ({ feature, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.6,
        delay: index * 0.1
      }
    },
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const gradients = {
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    pink: 'from-pink-400 to-pink-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    red: 'from-red-400 to-red-600'
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true }}
      className="feature-card p-8 rounded-xl bg-white/10 backdrop-blur-lg
        border border-white/20 hover:border-white/40 hover:shadow-xl 
        transition-all duration-300"
    >
      <div
        className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center
        bg-gradient-to-r ${gradients[feature.color] || gradients.blue}`}
      >
        <feature.icon className="text-2xl text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 font-funhouse">{feature.title}</h3>
      <p className="text-gray-300">{feature.description}</p>
    </motion.div>
  )
}

// Componente ContactInfo
const ContactInfo = () => {
  const contactItems = [
    {
      icon: FiPhone,
      title: "Teléfono",
      content: "+52 (33) 1765 0187"
    },
    {
      icon: FiMail,
      title: "Email",
      content: "contacto@tramboory.com"
    },
    {
      icon: FiMapPin,
      title: "Ubicación",
      content: [
        "P. Solares 1639",
        "Solares Residencial",
        "Zapopan, Jalisco, C.P. 45019"
      ]
    }
  ]

  return (
    <div className="flex flex-col space-y-8">
      {contactItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className="flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <item.icon className="text-yellow-400 text-xl" />
          </div>
          <div>
            <h3 className="text-white font-bold">{item.title}</h3>
            {Array.isArray(item.content) ? (
              item.content.map((line, i) => (
                <p key={i} className="text-gray-300">{line}</p>
              ))
            ) : (
              <p className="text-gray-300">{item.content}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Componente SocialLinks
const SocialLinks = () => {
  const socialLinks = [
    {
      url: "https://www.instagram.com/tramboory/",
      label: "Tramboory Instagram"
    },
    {
      url: "https://www.instagram.com/tramboory.express/",
      label: "Tramboory Express Instagram"
    }
  ]

  return (
    <div className="mt-12">
      <h3 className="text-center text-white text-xl mb-6">
        Síguenos en redes sociales
      </h3>
      <div className="flex justify-center space-x-6">
        {socialLinks.map((link, index) => (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center
              hover:bg-white/20 transition-colors duration-300"
            aria-label={link.label}
          >
            <FiInstagram className="text-yellow-400 text-xl" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}

// Componente WhatsAppButton
const WhatsAppButton = () => (
  <motion.a
    href="https://wa.me/5213317650187"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="inline-flex items-center justify-center space-x-2 py-3 px-6 
      bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 
      transition-colors duration-300 shadow-lg"
  >
    <FiMessageCircle className="text-xl" />
    <span>Contactar por WhatsApp</span>
  </motion.a>
)

// Componente Principal Home
const Home = () => {
  // Estados
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  
  // Referencias
  const sectionRefs = {
    hero: useRef(null),
    menu: useRef(null),
    menuBackground: useRef(null),
    content: useRef(null),
    video: useRef(null)
  }

  // Datos
  const menuItems = [
    { icon: <FiCalendar />, text: 'Reservar', link: '/appointments' },
    { icon: <FiPackage />, text: 'Paquetes', link: '/appointments' },
    { icon: <FiMail />, text: 'Contacto', link: '/contact' },
    { icon: <FiLogIn />, text: 'Iniciar Sesión', link: '/signin' },
    { icon: <FiUserPlus />, text: 'Registrarse', link: '/signup' }
  ]

  const services = {
    normal: {
      title: 'Tramboory Normal',
      description: 'La experiencia completa con todos los servicios incluidos para una celebración perfecta',
      price: '7,999',
      features: [
        {
          title: '4 Horas de Diversión',
          description: '3.5 horas de salón + 30 min de despedida',
          icon: FiClock
        },
        {
          title: 'Invitación Digital',
          description: 'Invitación personalizada para tu evento',
          icon: FiMail
        },
        {
          title: 'Decoración Temática',
          description: 'Ambientación Tramboory para tu fiesta',
          icon: FiGift
        },
        {
          title: 'Menú Completo',
          description: 'Alimentos para niños y adultos',
          icon: FiCoffee
        },
        {
          title: 'Bebidas Ilimitadas',
          description: 'Refrescos, agua y café de cortesía',
          icon: FiCoffee
        },
        {
          title: 'Área de Juegos',
          description: 'Ludoteca y alberca de pelotas',
          icon: FiSmile
        },
        {
          title: 'Ambiente Festivo',
          description: 'Música y anfitriones para animar',
          icon: FiMusic
        },
        {
          title: 'Coordinador de Evento',
          description: 'Personal dedicado para tu celebración',
          icon: FiUsers
        }
      ],
      highlights: ['Todo Incluido', 'Personal Completo', 'Sin Preocupaciones'],
      recommended: true
    },
    matutino: {
      title: 'Tramboory Matutino',
      description: 'Renta del espacio para eventos personalizados con servicios opcionales',
      price: '4,999',
      features: [
        {
          title: '3 Horas de Evento',
          description: 'Horario matutino flexible',
          icon: FiClock
        },
        {
          title: 'Espacio Exclusivo',
          description: 'Salón privado para tu evento',
          icon: FiMapPin
        },
        {
          title: 'Mobiliario Básico',
          description: 'Mesas y sillas incluidas',
          icon: FiPackage
        },
        {
          title: 'Servicios Opcionales',
          description: 'Personaliza tu experiencia',
          icon: FiStar
        }
      ],
      highlights: ['Personalizable', 'Económico', 'Flexible'],
      recommended: false
    }
  }

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
  ]

  // Efectos
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax effect para el héroe
      if (sectionRefs.content.current && sectionRefs.hero.current) {
        gsap.to(sectionRefs.content.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRefs.hero.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // Animaciones para las características
      ScrollTrigger.batch('.feature-card', {
        onEnter: batch => gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          overwrite: true
        }),
        start: 'top bottom-=100',
        end: 'bottom top+=100',
        markers: false
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      ctx.revert();
    };
  }, []);

  // Handlers
  const toggleVideo = () => {
    if (sectionRefs.video.current) {
      if (isVideoPlaying) {
        sectionRefs.video.current.pause();
      } else {
        sectionRefs.video.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // JSX principal
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
      {/* Video de Fondo */}
      <BackgroundVideoComponent
        videoRef={sectionRefs.video}
        isVideoPlaying={isVideoPlaying}
        toggleVideo={toggleVideo}
      />

      {/* Navegación */}
      <NavigationBar
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />

      {/* Menú Fullscreen */}
      <FullscreenMenu
        isOpen={isMenuOpen}
        menuRef={sectionRefs.menu}
        menuBackgroundRef={sectionRefs.menuBackground}
        menuItems={menuItems}
        onMenuItemClick={() => setIsMenuOpen(false)}
      />

      {/* Sección Hero */}
      <section
        ref={sectionRefs.hero}
        className="relative min-h-screen flex items-center justify-center"
      >
        <motion.div
          ref={sectionRefs.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 py-24 text-center hero-content"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 font-funhouse">
            Celebra con{' '}
            <span className="text-gradient bg-clip-text text-transparent
              bg-gradient-to-r from-yellow-300 to-pink-500">
              Tramboory
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            Crea recuerdos inolvidables en el lugar más divertido de la ciudad
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/reservations"
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500
                  text-purple-900 rounded-full font-bold text-lg shadow-xl
                  hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
              >
                Reserva Ahora
                <FiArrowRight className="inline-block ml-2" />
              </Link>
            </motion.div>
            <motion.a
              href="#services"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full
                font-bold text-lg border-2 border-white/30 hover:bg-white/20
                transition-all duration-300"
            >
              Conoce Más
              <FiStar className="inline-block ml-2" />
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <a
            href="#services"
            className="text-white opacity-75 hover:opacity-100 transition-opacity duration-300"
          >
            <FiArrowRight className="transform rotate-90 text-3xl" />
          </a>
        </motion.div>
      </section>

{/* Sección de Servicios */}
<section
        id="services"
        className="relative py-24 bg-gradient-to-b from-purple-900/90 to-indigo-900/90
          backdrop-blur-lg scroll-mt-20"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Elige el paquete perfecto para tu celebración y déjanos hacer de tu evento algo inolvidable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {Object.entries(services).map(([key, service], index) => (
              <ServiceCard key={key} service={service} index={index} />
            ))}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-indigo-900/20 to-transparent" />
      </section>

      {/* Sección de Características */}
      <section
        id="features"
        className="relative py-24 bg-gradient-to-b from-indigo-900/90 to-purple-900/90 scroll-mt-20"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              La Experiencia Tramboory
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Descubre por qué somos la mejor opción para tu celebración
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>

        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </section>

      {/* Sección de Contacto */}
      <section
        id="contact"
        className="relative py-24 bg-gradient-to-b from-black/90 to-purple-900/90 scroll-mt-20"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
                ¿Listo para Celebrar?
              </h2>
              <p className="text-xl text-gray-300 ">
                Contáctanos y comienza a planear tu evento perfecto
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <ContactInfo />
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white font-funhouse">
                    ¡Ponte en contacto con nosotros!
                  </h3>
                  <p className="text-gray-300">
                    Estamos aquí para hacer de tu evento algo extraordinario.
                    Contáctanos por WhatsApp o redes sociales y comienza a planear
                    tu celebración perfecta.
                  </p>
                </div>

                <div className="flex flex-col space-y-6">
                  <WhatsAppButton />
                  <div className="flex justify-center md:justify-start">
                    <SocialLinks />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-black/90">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-0"
            >
              <Link to="/">
                <img src={Logo} alt="Tramboory" className="h-12 w-auto" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-right"
            >
              <p className="text-gray-400">
                © {new Date().getFullYear()} Tramboory. Todos los derechos
                reservados.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home