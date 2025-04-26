import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { getImagenesCarousel, getPromocionesCarousel } from '@/services/galeriaService'
import NavbarPublic from '@/components/ui/NavbarPublic'

// Componentes decorativos
import ParticlesBackground from './home-components/decorative/ParticlesBackground'
import AnimatedBalloons from './home-components/decorative/AnimatedBalloons'
import BackgroundVideoComponent from './home-components/decorative/BackgroundVideoComponent'

// Secciones de la página
import HeroSection from './home-components/sections/HeroSection'
import PromotionsSection from './home-components/sections/PromotionsSection'
import ReservationStepsSection from './home-components/sections/ReservationStepsSection'
import ServicesSection from './home-components/sections/ServicesSection'
import FeaturesSection from './home-components/sections/FeaturesSection'
import GallerySection from './home-components/sections/GallerySection'
import ContactSection from './home-components/sections/ContactSection'
import FooterSection from './home-components/sections/FooterSection'

// Registrar GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

/**
 * Componente principal de la página de inicio
 * Modularizado para mejor mantenimiento y organización
 */
const Home = () => {
  // Estados
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [carouselImages, setCarouselImages] = useState([]);
  const [promocionesImages, setPromocionesImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isLoadingPromociones, setIsLoadingPromociones] = useState(true);
  
  // Referencias
  const sectionRefs = {
    hero: useRef(null),
    content: useRef(null),
    video: useRef(null)
  };

  // Datos para servicios
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
  };

  // Cargar imágenes del carrusel y promociones desde la API
  useEffect(() => {
    // Función para cargar imágenes del carrusel
    const loadImages = async () => {
      try {
        setIsLoadingImages(true);
        const imagenes = await getImagenesCarousel();
        
        // Ordenar por el campo orden y obtener solo las URLs de las imágenes activas
        const imageUrls = imagenes
          .filter(img => img.activo)
          .sort((a, b) => a.orden - b.orden)
          .map(img => img.imagen_url);
        
        // Usar solo las imágenes de la base de datos
        setCarouselImages(imageUrls);
      } catch (error) {
        console.error('Error cargando imágenes del carrusel:', error);
        // En caso de error, establecer un array vacío
        setCarouselImages([]);
      } finally {
        setIsLoadingImages(false);
      }
    };
    
    // Función para cargar promociones del mes
    const loadPromociones = async () => {
      try {
        setIsLoadingPromociones(true);
        const promociones = await getPromocionesCarousel();
        
        // Ordenar por el campo orden y obtener solo las URLs de las promociones activas
        const promoUrls = promociones
          .filter(promo => promo.activo)
          .sort((a, b) => a.orden - b.orden)
          .map(promo => promo.imagen_url);
        
        setPromocionesImages(promoUrls);
      } catch (error) {
        console.error('Error cargando promociones del mes:', error);
        setPromocionesImages([]);
      } finally {
        setIsLoadingPromociones(false);
      }
    };
    
    loadImages();
    loadPromociones();
  }, []);
  
  // Efectos para animaciones
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

  // JSX principal
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 to-indigo-950">
      {/* Elementos decorativos de fondo */}
      <ParticlesBackground />
      <AnimatedBalloons />
      
      {/* Video de Fondo */}
      <BackgroundVideoComponent
        videoRef={sectionRefs.video}
        isVideoPlaying={isVideoPlaying}
        toggleVideo={toggleVideo}
      />

      {/* Navbar público */}
      <NavbarPublic />

      {/* Secciones principales */}
      <HeroSection sectionRefs={sectionRefs} />
      <PromotionsSection promocionesImages={promocionesImages} />
      <ReservationStepsSection />
      <ServicesSection services={services} />
      <FeaturesSection />
      <GallerySection carouselImages={carouselImages} />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

// Importación faltante para iconos usados en los servicios
import { 
  FiClock, 
  FiMail, 
  FiGift, 
  FiCoffee, 
  FiSmile, 
  FiMusic, 
  FiUsers, 
  FiMapPin, 
  FiPackage, 
  FiStar 
} from 'react-icons/fi';

export default Home;