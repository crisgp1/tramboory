import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../img/logo.webp';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de importar axios

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Llamada al backend para cerrar sesión
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      
      // Eliminar el token del lado del cliente
      Cookies.remove('token');
      localStorage.removeItem('token'); // Por si estás usando localStorage también
      
      setIsLoggedIn(false);
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, intentamos limpiar en el cliente y redirigir
      Cookies.remove('token');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      navigate('/signin');
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              <img src={Logo} alt="Logo" className="w-32 mr-4" />
            </Link>
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-4"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-3 py-2 text-gray-800 hover:text-gray-600"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-4"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};