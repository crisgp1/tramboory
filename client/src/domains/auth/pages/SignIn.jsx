import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import axiosInstance from '@shared/utils/axiosConfig.js';
import { useAuth } from '@shared/context/authContext';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, user, userType } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Usar directamente la función login del contexto
      await login(data.email, data.password);
      
      // Obtener el tipo de usuario desde el contexto o localStorage
      const currentUserType = userType || user?.tipo_usuario || localStorage.getItem('userType') || 'cliente';
      
      toast.success('Inicio de sesión exitoso');

      if (currentUserType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        try {
          const reservationsResponse = await axiosInstance.get('/reservas');
          // Obtener el ID del usuario actual
          const currentUserId = user?.id;
          const userReservations = reservationsResponse.data.filter(
            (reserva) => reserva.id_usuario === currentUserId
          );
          
          if (userReservations.length > 0) {
            navigate(`/reservation-status/${userReservations[0].id}`);
          } else {
            navigate('/reservations');
          }
        } catch (error) {
          console.error('Error fetching reservations:', error);
          navigate('/reservations');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 404) {
          toast.error('Usuario no existe o credenciales inválidas');
        } else if (error.response.status === 500) {
          toast.error('Error del servidor. Por favor, intenta de nuevo más tarde');
        } else {
          toast.error(error.response.data?.message || 'Error desconocido al intentar iniciar sesión');
        }
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor. Verifica tu conexión a internet.');
      } else {
        toast.error('Error al configurar la solicitud. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos - formas geométricas sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <FiUser className="text-indigo-600 text-2xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
              Bienvenido de vuelta
            </h1>
            <p className="text-center text-gray-500 mb-8">Ingresa tus credenciales para continuar</p>
          </div>
          
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="text-indigo-500" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-indigo-500" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-all duration-200"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Recordarme
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className={`w-full py-3 mt-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : 'Iniciar Sesión'}
              </motion.button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}