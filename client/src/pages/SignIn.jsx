import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axiosInstance from '../components/axiosConfig.js';
import {jwtDecode} from 'jwt-decode';

const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('Submitting login form with data:', data); // Log the submitted data
    try {
      const response = await axiosInstance.post('/api/auth/login', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response:', response); // Log the entire response

      const { token, message, userType } = response.data;

      if (token) {
        console.log('Received token:', token);
        localStorage.setItem('token', token);

        // Configure the token for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        toast.success(message || 'Inicio de sesión exitoso');

        if (userType === 'admin') {
          console.log('User is admin, navigating to /dashboard');
          navigate('/dashboard');
        } else {
          console.log('User is not admin, proceeding to fetch reservations');
          // Decode token to get user ID
          const decodedToken = jwtDecode(token);
          console.log('Decoded token:', decodedToken);
          const userId = decodedToken.id;

          try {
            // Fetch user's reservations
            const reservationsResponse = await axiosInstance.get('/api/reservas');
            console.log('Reservations response:', reservationsResponse);

            if (reservationsResponse.data) {
              // Filter reservations belonging to the user
              const userReservations = reservationsResponse.data.filter(
                (reserva) => reserva.id_usuario === userId
              );
              console.log('User reservations:', userReservations);

              if (userReservations.length > 0) {
                console.log('User has reservations, navigating to /reservation-status');
                const reservationId = userReservations[0].id;
                navigate(`/reservation-status/${reservationId}`);
              } else {
                console.log('User has no reservations, navigating to /reservations');
                navigate('/reservations');
              }
            }
          } catch (error) {
            console.error('Error fetching reservations:', error);
            // In case of error, navigate to reservations creation form
            console.log('Navigating to /reservations due to error');
            navigate('/reservations');
          }
        }
      } else {
        toast.error('No se recibió un token válido del servidor');
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        if (error.response.status === 401 || error.response.status === 404) {
          // Specific message when the user doesn't exist or credentials are invalid
          toast.error(
            error.response.data.message ||
              'Usuario no existe o credenciales inválidas'
          );
        } else if (error.response.status === 500) {
          toast.error(
            'Error del servidor. Por favor, intenta de nuevo más tarde'
          );
        } else {
          toast.error(
            error.response.data?.message ||
              'Error desconocido al intentar iniciar sesión'
          );
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error(
          'No se recibió respuesta del servidor. Verifica tu conexión a internet.'
        );
      } else {
        toast.error(
          'Error al configurar la solicitud. Por favor, intenta de nuevo.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4"
    >
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700"
              >
                Recordarme
              </label>
            </div>
            <Link to="/forgot-password">
              <div className="text-sm">
                <p className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </p>
              </div>
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </motion.button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
