import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FiInfo, 
  FiUsers, 
  FiHeart, 
  FiSmile, 
  FiStar, 
  FiCalendar, 
  FiMapPin, 
  FiMessageCircle,
  FiCamera,
  FiArrowRight
} from 'react-icons/fi'
import CloudinaryCarousel from '@/components/cloudinary/CloudinaryCarousel'
import { getImagenesCarousel } from '@/services/galeriaService'
import NavbarPublic from '@/components/ui/NavbarPublic'

// Componentes decorativos
import ParticlesBackground from './home-components/decorative/ParticlesBackground'
import AnimatedBalloons from './home-components/decorative/AnimatedBalloons'
import BackgroundVideoComponent from './home-components/decorative/BackgroundVideoComponent'

/**
 * Página Acerca de Tramboory - rediseñada para mantener consistencia con Home.jsx
 */
const AboutTramboory = () => {
  // Referencias para elementos que necesitan animación
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  
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
  const [carouselImages, setCarouselImages] = useState([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)

  // Cargar imágenes del carrusel desde la API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoadingImages(true)
        const imagenes = await getImagenesCarousel()
        
        // Ordenar por el campo orden y obtener solo las URLs de las imágenes activas
        const imageUrls = imagenes
          .filter(img => img.activo)
          .sort((a, b) => a.orden - b.orden)
          .map(img => img.imagen_url)
        
        // Si no hay imágenes en la base de datos, usar imágenes de ejemplo
        if (imageUrls.length === 0) {
          setCarouselImages([
            'samples/landscapes/nature-mountains',
            'samples/landscapes/beach-boat',
            'samples/landscapes/girl-urban-view',
            'samples/food/dessert',
            'samples/people/bicycle'
          ])
        } else {
          setCarouselImages(imageUrls)
        }
      } catch (error) {
        console.error('Error cargando imágenes del carrusel:', error)
        // En caso de error, usar imágenes de ejemplo
        setCarouselImages([
          'samples/landscapes/nature-mountains',
          'samples/landscapes/beach-boat',
          'samples/landscapes/girl-urban-view',
          'samples/landscapes/architecture-signs'
        ])
      } finally {
        setIsLoadingImages(false)
      }
    }
    
    loadImages()
  }, [])

  // Componente FeatureCard para destacar características de Tramboory
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

  // Datos - Características principales de Tramboory
  const features = [
    {
      icon: FiHeart,
      title: 'Nuestro Corazón',
      description: 'En Tramboory creemos en crear momentos inolvidables para las familias, ofreciendo un espacio donde la diversión y la magia se encuentran.',
      color: 'pink'
    },
    {
      icon: FiUsers,
      title: 'Equipo Apasionado',
      description: 'Nuestro equipo está dedicado a hacer de cada evento una experiencia perfecta, cuidando hasta el más mínimo detalle.',
      color: 'purple'
    },
    {
      icon: FiStar,
      title: 'Experiencia Premium',
      description: 'Ofrecemos un servicio de primera calidad, con instalaciones modernas y seguras para que todos disfruten sin preocupaciones.',
      color: 'yellow'
    },
    {
      icon: FiCalendar,
      title: 'Historia y Trayectoria',
      description: 'Desde nuestra fundación, hemos sido parte de miles de celebraciones, creciendo y mejorando constantemente.',
      color: 'blue'
    },
    {
      icon: FiSmile,
      title: 'Diversión Garantizada',
      description: 'Diseñamos cada actividad y espacio para asegurar que todos los asistentes, grandes y pequeños, disfruten al máximo.',
      color: 'green'
    },
    {
      icon: FiMapPin,
      title: 'Ubicación Estratégica',
      description: 'Nos encontramos en una zona accesible de Zapopan, con estacionamiento y todas las facilidades para tu comodidad.',
      color: 'red'
    }
  ]

  // Datos de historia de Tramboory
  const historyMilestones = [
    {
      year: '2018',
      title: 'Nace una Idea',
      description: 'Tramboory surge como un sueño de crear un espacio único para celebraciones infantiles en Guadalajara.'
    },
    {
      year: '2019',
      title: 'Abrimos Nuestras Puertas',
      description: 'Inauguramos nuestras instalaciones en Zapopan, con una gran fiesta de apertura que marcó el inicio de nuestra historia.'
    },
    {
      year: '2020',
      title: 'Superando Desafíos',
      description: 'A pesar de los retos globales, nos reinventamos para seguir ofreciendo experiencias seguras y memorables.'
    },
    {
      year: '2021',
      title: 'Crecimiento y Expansión',
      description: 'Ampliamos nuestros servicios y mejoramos nuestras instalaciones para ofrecer más opciones a nuestros clientes.'
    },
    {
      year: '2022',
      title: 'Innovación Constante',
      description: 'Implementamos nuevas tecnologías y temas de decoración para mantenernos a la vanguardia.'
    },
    {
      year: '2023',
      title: 'Comunidad Tramboory',
      description: 'Celebramos haber sido parte de más de 1,000 eventos y construido una comunidad fiel de familias que confían en nosotros.'
    }
  ]

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
      
      {/* Sección Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-black/40 to-transparent">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-funhouse">
              Conoce{' '}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-500">
                Tramboory
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Un espacio mágico donde los sueños se convierten en celebraciones inolvidables
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <CloudinaryCarousel 
              height="500px"
              autoPlaySpeed={3000}
              imageWidth={1.8}
              images={carouselImages}
            />
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-purple-900/50 to-transparent pointer-events-none" />
      </section>

      {/* Sección Quiénes Somos */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900/90 to-indigo-900/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
              ¿Quiénes Somos?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              En Tramboory somos especialistas en crear momentos llenos de alegría y diversión para toda la familia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20"
            >
              <div className="flex items-center mb-6">
                <FiInfo className="text-3xl text-yellow-400 mr-4" />
                <h3 className="text-2xl font-bold text-white font-funhouse">Nuestra Misión</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Crear experiencias mágicas y memorables para las familias, ofreciendo un espacio seguro y divertido donde los niños puedan celebrar momentos especiales y los adultos puedan disfrutar sin preocupaciones.
              </p>
              <p className="text-gray-300">
                Nos dedicamos a transformar cada evento en una celebración única, adaptada a los gustos y necesidades de cada cliente, con atención personalizada y servicio de excelencia.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20"
            >
              <div className="flex items-center mb-6">
                <FiStar className="text-3xl text-yellow-400 mr-4" />
                <h3 className="text-2xl font-bold text-white font-funhouse">Nuestra Visión</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Ser reconocidos como el lugar preferido para celebraciones infantiles en Guadalajara, innovando constantemente en nuestros servicios y creando tendencias en el mercado.
              </p>
              <p className="text-gray-300">
                Buscamos expandir nuestra presencia y llevar la magia de Tramboory a más familias, manteniendo siempre nuestros valores de excelencia, creatividad y pasión por lo que hacemos.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección Características */}
      <section className="relative py-20 bg-gradient-to-b from-indigo-900/90 to-purple-900/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
              ¿Por qué Tramboory?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre lo que nos hace especiales y por qué tantas familias confían en nosotros
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Sección Historia */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900/90 to-black/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
              Nuestra Historia
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              El camino que hemos recorrido para convertirnos en el espacio mágico que somos hoy
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Línea de tiempo vertical */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-pink-500 transform -translate-x-1/2"></div>
            
            {historyMilestones.map((milestone, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
                className={`relative mb-16 flex ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Círculo en la línea de tiempo */}
                <div className="absolute left-1/2 top-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full transform -translate-x-1/2 z-10 border-4 border-purple-900"></div>
                
                {/* Contenedor del contenido */}
                <div className={`w-5/12 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-purple-900 font-bold rounded-full mb-4">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 font-funhouse">{milestone.title}</h3>
                    <p className="text-gray-300">{milestone.description}</p>
                  </div>
                </div>
                
                {/* Espacio para el lado opuesto */}
                <div className="w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="relative py-16 bg-gradient-to-b from-black/90 to-purple-900/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-purple-800/80 to-indigo-800/80 p-10 rounded-2xl border border-white/10 text-center backdrop-blur-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-funhouse">
              ¡Vive la Experiencia Tramboory!
            </h2>
            <p className="text-xl text-gray-200 mb-10">
              Estamos listos para hacer de tu próxima celebración un momento inolvidable
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                onClick={() => {
                  window.open("https://wa.me/523332300243?text=Hola%2C%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20para%20fiestas%20infantiles.", '_blank', 'noopener,noreferrer');
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center space-x-2 py-3 px-6
                  bg-green-500 text-white rounded-lg font-bold hover:bg-green-600
                  transition-colors duration-300 shadow-lg cursor-pointer"
                aria-label="Contactar por WhatsApp"
              >
                <FiMessageCircle className="text-xl" />
                <span>Contactar por WhatsApp</span>
              </motion.button>
              
              <motion.a
                href="/appointments"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500
                  text-purple-900 rounded-lg font-bold text-lg shadow-xl
                  hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center"
              >
                <span>Reservar Ahora</span>
                <FiArrowRight className="ml-2" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección Galería al final */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900/90 to-black/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-funhouse">
              Momentos Mágicos
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Algunos recuerdos de las celebraciones especiales en nuestras instalaciones
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <CloudinaryCarousel 
              height="450px"
              autoPlaySpeed={2500}
              imageWidth={1.6}
              images={carouselImages}
            />
          </motion.div>

          <div className="flex justify-center">
            <motion.a
              href="https://www.instagram.com/tramboory/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white 
                rounded-full font-bold text-lg border-2 border-yellow-400/30 hover:bg-white/20
                transition-all duration-300"
            >
              <FiCamera className="mr-2" />
              Ver más en Instagram
            </motion.a>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </section>
    </div>
  )
}

export default AboutTramboory