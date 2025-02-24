import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Logo from '../../img/logo.webp';
import InventoryLoginModal from '../inventory/InventoryLoginModal';
import InventoryLoader from '../inventory/InventoryLoader';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
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
  FiSettings,
  FiAlertCircle,
  FiBox
} from 'react-icons/fi';

export const Header = () => {
  const { 
    isAuthenticated, 
    userType, 
    user, 
    logout, 
    checkAuth 
  } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInventoryLogin, setShowInventoryLogin] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const menuRef = useRef(null);
  
  const navigate = useNavigate();

  const handleInventoryNavigation = () => {
    setShowLoader(true);
    setTimeout(() => {
      setShowLoader(false);
      navigate('/inventory');
    }, 1500);
  };

  const handleInventoryClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowInventoryLogin(true);
      return;
    }
    
    if (userType === 'admin' || userType === 'inventario') {
      handleInventoryNavigation();
    } else {
      toast.error('No tienes permisos para acceder al inventario');
    }
  };

  const handleLoginSuccess = () => {
    setShowInventoryLogin(false);
    if (userType === 'admin' || userType === 'inventario') {
      handleInventoryNavigation();
    }
  };

  const verifyAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const authStatus = await checkAuth();
      setAuthChecked(true);
      return authStatus;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setAuthChecked(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth]);

  useEffect(() => {
    verifyAuth();
    
    const handleAuthChange = () => verifyAuth();
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    const handleStorageChange = (e) => {
      if (e.key === 'token') verifyAuth();
    };
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    const authCheckInterval = setInterval(verifyAuth, 60000);

    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(authCheckInterval);
      document.body.style.overflow = 'unset';
    };
  }, [verifyAuth, isMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
      navigate('/signin');
    }
  };

  const menuItems = [
    { icon: <FiHome />, text: 'Inicio', link: '/' },
    ...(userType === 'admin' ? [
      { icon: <FiGrid />, text: 'Dashboard', link: '/dashboard' },
      { icon: <FiBox />, text: 'Inventario', link: '#', onClick: handleInventoryClick }
    ] : []),
    ...(isAuthenticated ? [
      { icon: <FiCalendar />, text: 'Mis Reservas', link: '/reservations' },
      { icon: <FiUserCheck />, text: 'Mi Perfil', link: '/profile' }
    ] : [
      { icon: <FiLogIn />, text: 'Iniciar Sesión', link: '/signin' },
      { icon: <FiUserPlus />, text: 'Registrarse', link: '/signup' }
    ])
  ];

  const menuVariants = {
    closed: { opacity: 0, x: "100%", transition: { type: "spring", stiffness: 400, damping: 40 } },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } }
  };

  const backdropVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.2 } }
  };

  const UserAvatar = ({ user }) => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
      <FiUser className="text-white text-lg" />
    </div>
  );

  const UserMenuContent = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100"
    >
      <Link
        to="/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => setIsUserMenuOpen(false)}
      >
        <FiUser className="w-4 h-4" />
        Mi Perfil
      </Link>
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <FiLogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="h-20 bg-white shadow-sm animate-pulse">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="w-32 h-8 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <InventoryLoginModal 
        isOpen={showInventoryLogin}
        onClose={() => setShowInventoryLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <AnimatePresence>
        {showLoader && <InventoryLoader />}
      </AnimatePresence>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
        }`}
        style={{ height: 'var(--header-height)' }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="relative z-10 flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
              <motion.img
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                src={Logo}
                alt="Logo"
                className="h-12 w-auto transition-transform duration-300 hover:scale-110"
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-4">
                    {menuItems.filter(link => link.text !== 'Iniciar Sesión' && link.text !== 'Registrarse').map((link) => (
                      link.onClick ? (
                        <button
                          key={link.text}
                          onClick={link.onClick}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          {link.icon}
                          <span>{link.text}</span>
                        </button>
                      ) : (
                        <Link
                          key={link.link}
                          to={link.link}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          {link.icon}
                          <span>{link.text}</span>
                        </Link>
                      )
                    ))}
                  </div>

                  <div className="relative" ref={menuRef}>
                    <motion.button
                      className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <UserAvatar user={user} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">
                          {user?.nombre?.split(' ')[0] || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">{userType}</p>
                      </div>
                      <FiChevronDown 
                        className={`transition-transform duration-200 ${
                          isUserMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && <UserMenuContent />}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </Link>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative z-10 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {isAuthenticated && (
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500">
                  <div className="flex items-center space-x-4">
                    <UserAvatar user={user} />
                    <div>
                      <h3 className="text-white font-medium">
                        {user?.nombre?.split(' ')[0] || 'Usuario'}
                      </h3>
                      <p className="text-indigo-100 text-sm">{userType}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 py-6 px-4 space-y-2">
                {menuItems.map((link) => (
                  link.onClick ? (
                    <button
                      key={link.text}
                      onClick={(e) => {
                        link.onClick(e);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="text-gray-500">{link.icon}</span>
                      <span className="text-gray-700 font-medium">{link.text}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.link}
                      to={link.link}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="text-gray-500">{link.icon}</span>
                      <span className="text-gray-700 font-medium">{link.text}</span>
                    </Link>
                  )
                ))}
              </div>

              <div className="p-4 border-t">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors duration-200"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <FiLogIn className="w-5 h-5" />
                      <span>Iniciar sesión</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
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

      <AnimatePresence>
        {!authChecked && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded z-50"
          >
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-2">
                <p className="text-sm text-yellow-600 font-medium">Error de autenticación</p>
                <p className="text-sm text-yellow-500">Hubo un error al verificar tu autenticación</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
          >
            <div className="flex items-center space-x-2 text-sm">
              <FiUserCheck className="text-green-500" />
              <span className="text-gray-700">Sesión activa</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100"
          >
            <motion.div
              className="h-full bg-indigo-600"
              animate={{
                width: ["0%", "100%"],
                transition: {
                  duration: 1,
                  ease: "easeInOut",
                  repeat: Infinity
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;