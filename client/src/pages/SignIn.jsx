import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const schema = yup.object().shape({
    email: yup.string().email('Email inválido').required('El email es requerido'),
    password: yup.string().required('La contraseña es requerida'),
});

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
          const response = await axios.post('/api/auth/login', data, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const { token, message, userType } = response.data;
          localStorage.setItem('token', token); // Almacenamos el token en el localStorage
          toast.success(message || "Inicio de sesión exitoso");
          setTimeout(() => {
            if (userType === 'admin') {
              navigate('/dashboard');
            } else {
              navigate('/reservations');
            }
          }, 2000);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    if (error.response.data.message === 'User not found') {
                        toast.error("El usuario no existe");
                    } else {
                        toast.error("El correo electrónico o la contraseña son incorrectos");
                    }
                } else if (error.response.status === 500) {
                    toast.error("Error del servidor. Por favor, intenta de nuevo más tarde");
                } else {
                    toast.error(error.response.data?.message || "Error desconocido al intentar iniciar sesión");
                }
            } else {
                toast.error("No se pudo conectar con el servidor. Revisa tu conexión a internet");
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
      className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4'
    >
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className='bg-white rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <h1 className='text-3xl font-bold mb-6 text-center text-indigo-700'>
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Correo Electrónico
            </label>
            <div className='relative'>
              <FiMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                {...register('email')}
                type='email'
                className='pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='tu@email.com'
              />
            </div>
            {errors.email && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Contraseña
            </label>
            <div className='relative'>
              <FiLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className='pl-10 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                placeholder='Tu contraseña'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='rememberMe'
                type='checkbox'
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
              />
              <label
                htmlFor='rememberMe'
                className='ml-2 block text-sm text-gray-700'
              >
                Recordarme
              </label>
            </div>
            <Link to='/forgot-password'>
              <div className='text-sm'>
                <p className='font-medium text-indigo-600 hover:text-indigo-500'>
                  ¿Olvidaste tu contraseña?
                </p>
              </div>
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='submit'
            className={`w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </motion.button>
        </form>
        <p className='mt-4 text-center text-sm text-gray-600'>
          ¿No tienes una cuenta?{' '}
          <Link
            to='/signup'
            className='font-medium text-indigo-600 hover:text-indigo-500'
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
