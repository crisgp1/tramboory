import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Logo from '../../img/logo.webp';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiUserCheck, 
  FiMenu, 
  FiX, 
  FiHome,
  FiCalendar,
  FiLogOut,
  FiGrid,
  FiLogIn,
  FiUserPlus,
  FiChevronDown,
  FiBell,
  FiSettings
} from 'react-icons/fi';

export const Header = () => {
  const { isAuthenticated, userType, user, logout, checkAuth } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Bloquear scroll cuando el menú está abierto
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [checkAuth, isMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/signin');
    }
  };

  const menuLinks = [
    {
      to: "/",
      icon: FiHome,
      text: "Inicio",
      show: true
    },
    {
      to: "/dashboard",
      icon: FiGrid,
      text: "Dashboard",
      show: userType === 'admin'
    },
    {
      to: "/reservations",
      icon: FiCalendar,
      text: "Mis Reservas",
      show: isAuthenticated
    },
    {
      to: "/profile",
      icon: FiUserCheck,
      text: "Mi Perfil",
      show: isAuthenticated
    },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  const backdropVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
        }`}
        style={{ height: 'var(--header-height)' }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link 
              to="/" 
              className="relative z-10 flex-shrink-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.img
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                src={Logo}
                alt="Logo"
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* Navigation Links */}
                  <div className="flex items-center space-x-4">
                    {menuLinks.filter(link => link.show).map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 
                          rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.text}</span>
                      </Link>
                    ))}
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg 
                        hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 
                        to-purple-500 flex items-center justify-center">
                        <FiUser className="text-white text-lg" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">
                          {user?.nombre?.split(' ')[0] || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">{userType}</p>
                      </div>
                      <FiChevronDown 
                        className={`transition-transform duration-200 
                          ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg 
                            py-2 border border-gray-100"
                        >
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 
                              flex items-center space-x-2"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FiUser className="w-4 h-4" />
                            <span>Mi Perfil</span>
                          </Link>
                         
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 
                              hover:bg-red-50 flex items-center space-x-2"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>Cerrar sesión</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 
                      rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 
                      text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 
                      transition-all duration-200 flex items-center space-x-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative z-10 p-2 rounded-lg hover:bg-gray-100 
                transition-colors duration-200"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-600" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-600" />
              )}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 
              md:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* User Info Section */}
              {isAuthenticated && (
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center 
                      justify-center">
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {user?.nombre?.split(' ')[0] || 'Usuario'}
                      </h3>
                      <p className="text-indigo-100 text-sm">{userType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 py-6 px-4 space-y-2">
                {menuLinks.filter(link => link.show).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-gray-50 
                      transition-colors duration-200"
                  >
                    <link.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">{link.text}</span>
                  </Link>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-500 text-white rounded-lg flex items-center 
                      justify-center space-x-2 hover:bg-red-600 transition-colors duration-200"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg flex items-center 
                        justify-center space-x-2 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FiLogIn className="w-5 h-5" />
                      <span>Iniciar sesión</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 
                        text-white rounded-lg flex items-center justify-center space-x-2 
                        hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                    >
                      <FiUserPlus className="w-5 h-5" />
                      <span>Registrarse</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;