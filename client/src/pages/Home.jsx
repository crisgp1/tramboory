import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiMenu, FiX, FiCalendar, FiPackage, FiMail, FiLogIn, FiUserPlus, FiCheckCircle, FiGift, FiStar, FiInstagram } from 'react-icons/fi';
import Logo from '../img/logo.webp';
import BackgroundVideo from '../video/background.webm';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const menuBackgroundRef = useRef(null);

  useEffect(() => {
    gsap.set(menuRef.current, { visibility: 'hidden' });
    gsap.set(menuBackgroundRef.current, { scale: 0, borderRadius: '100%' });
    gsap.set(menuItemsRef.current, { opacity: 0, y: 50 });
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      // Abrir menú
      gsap.set(menuRef.current, { visibility: 'visible' });
      gsap.to(menuBackgroundRef.current, { 
        scale: 1, 
        borderRadius: '0%', 
        duration: 0.5, 
        ease: 'power2.inOut' 
      });
      gsap.to(menuItemsRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        delay: 0.2,
        ease: 'power2.out' 
      });
    } else {
      // Cerrar menú  
      gsap.to(menuItemsRef.current, { 
        opacity: 0, 
        y: 50, 
        duration: 0.3, 
        stagger: 0.05, 
        ease: 'power2.in' 
      });
      gsap.to(menuBackgroundRef.current, { 
        scale: 0, 
        borderRadius: '100%', 
        duration: 0.5, 
        delay: 0.2, 
        ease: 'power2.inOut',
        onComplete: () => gsap.set(menuRef.current, { visibility: 'hidden' })  
      });
    }
  };

  const menuItems = [
    { icon: <FiCalendar />, text: 'Reservar', link: '/appointments' },
    { icon: <FiPackage />, text: 'Paquetes', link: '/packages' },
    { icon: <FiMail />, text: 'Contacto', link: '/contact' },
    { icon: <FiLogIn />, text: 'Iniciar Sesión', link: '/signin' },
    { icon: <FiUserPlus />, text: 'Registrarse', link: '/signup' },     
  ];

  const features = [
    { 
      icon: <FiCheckCircle className="text-4xl text-green-400" />, 
      title: 'Diversión Garantizada', 
      description: 'En Tramboory, nos aseguramos de que cada momento esté lleno de risas y alegría.'
    },
    {
      icon: <FiGift className="text-4xl text-yellow-400" />,
      title: 'Paquetes Personalizados',
      description: 'Ofrecemos una amplia variedad de paquetes adaptados a tus necesidades y presupuesto.'
    },
    {
      icon: <FiStar className="text-4xl text-blue-400" />,
      title: 'Experiencias Memorables',
      description: 'Creamos celebraciones únicas que dejarán recuerdos duraderos para ti y tus invitados.' 
    },
  ];

  const carouselImages = [
    '/path/to/image1.jpg',
    '/path/to/image2.jpg', 
    '/path/to/image3.jpg',
    // Agrega más rutas de imágenes según sea necesario
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 text-white overflow-hidden">
      {/* Fondo de video */}
      <video
        autoPlay 
        loop
        muted
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src={BackgroundVideo} type="video/webm" />
        Tu navegador no soporta el tag de video.
      </video>

      {/* Superposición para mejorar la legibilidad */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
      
      {/* Contenido principal */}
      <div className="relative z-20">
        {/* Navegación */}  
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/">
            <img src={Logo} alt="Tramboory Logo" className="h-12 transition duration-300 ease-in-out transform hover:scale-110" />
          </Link>
          <button onClick={toggleMenu} className="text-white focus:outline-none z-50">
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </nav>

        {/* Menú de pantalla completa */}
        <div ref={menuRef} className="fixed inset-0 z-40 flex items-center justify-center">
          <div 
            ref={menuBackgroundRef}
            className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 shadow-xl"
          ></div>
          <ul className="relative z-50 text-center">
            {menuItems.map((item, index) => (
              <li key={item.text} className="mb-8">
                <Link
                  to={item.link}
                  className="text-white text-2xl hover:text-yellow-300 transition duration-300 flex items-center justify-center group"
                  ref={el => menuItemsRef.current[index] = el}
                  onClick={toggleMenu}
                >
                  <span className="mr-4 text-3xl text-yellow-300 group-hover:text-white transition duration-300">{item.icon}</span>
                  <span className="relative">
                    {item.text}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hero Section */}
        <header className="container mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Celebra con <span className="text-yellow-300">Tramboory</span> 
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8">
            Crea recuerdos inolvidables en el lugar más divertido de la ciudad
          </p>
          <Link
            to="/appointments"
            className="bg-yellow-400 text-purple-900 font-bold py-3 px-8 rounded-full shadow-xl hover:bg-yellow-300 transition duration-300 inline-block text-lg sm:text-xl md:text-2xl"
          >
            Reserva Ahora
          </Link>
        </header>

        {/* Sección de características */}
        <section className="container mx-auto px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white text-gray-800 p-8 rounded-lg shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de carrusel */}
        <section className="container mx-auto px-6 py-12 md:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Explora Nuestro Salón de Eventos</h2>
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop={true}
            autoPlay={true}
            interval={5000}
            transitionTime={1000}
            showArrows={false}
            className="rounded-lg shadow-xl"
          >
            {carouselImages.map((image, index) => (
              <div key={index}>
                <img src={image} alt={`Imagen ${index + 1}`} className="w-full h-96 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">Imagen {index + 1}</h3>
                    <p className="text-lg">Descripción de la imagen {index + 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">© {new Date().getFullYear()} Tramboory. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="https://www.instagram.com/tramboory/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300">
              <FiInstagram size={24} />
            </a>
            <a href="https://www.instagram.com/tramboory.express/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-300">
              <FiInstagram size={24} />
            </a>
            <a href="mailto:contacto@tramboory.com" className="text-white hover:text-yellow-300">
              <FiMail size={24} />  
            </a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;