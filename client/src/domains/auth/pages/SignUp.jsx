import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  telefono: yup.string(),
  direccion: yup.string(),
  password: yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .matches(/[!@#$%^&*]/, 'Debe contener al menos un caracter especial')
    .required('La contraseña es requerida'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/signup', data);
      toast.success(response.data.message || "Tu cuenta ha sido creada con éxito");
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Hubo un problema al registrarte. Intenta nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-400'];

  const passwordCriteria = [
    { label: 'Al menos 8 caracteres', regex: /.{8,}/ },
    { label: 'Una letra mayúscula', regex: /[A-Z]/ },
    { label: 'Una letra minúscula', regex: /[a-z]/ },
    { label: 'Un número', regex: /[0-9]/ },
    { label: 'Un caracter especial (!@#$%^&*)', regex: /[!@#$%^&*]/ },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos - formas geométricas sutiles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full -ml-40 -mb-40 opacity-70"></div>
      <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-indigo-200 rounded-full transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-200 rounded-full transform rotate-12 opacity-60"></div>
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl my-8"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <FiUser className="text-indigo-600 text-2xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
              Crear cuenta
            </h1>
            <p className="text-center text-gray-500 mb-6">Completa tus datos para registrarte</p>
          </div>
          
          <div className="px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  icon={<FiUser className="text-indigo-500" />}
                  label="Nombre Completo"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  register={register}
                  error={errors.nombre}
                />

                <InputField
                  icon={<FiMail className="text-indigo-500" />}
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  register={register}
                  error={errors.email}
                />

                <InputField
                  icon={<FiPhone className="text-indigo-500" />}
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  register={register}
                  error={errors.telefono}
                />

                <InputField
                  icon={<FiMapPin className="text-indigo-500" />}
                  label="Dirección"
                  name="direccion"
                  type="text"
                  placeholder="Tu dirección"
                  register={register}
                  error={errors.direccion}
                />
              </div>

              <div className="mt-2">
                <PasswordField
                  label="Contraseña"
                  name="password"
                  register={register}
                  error={errors.password}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 space-y-3 mt-2">
                {/* Indicador de fortaleza */}
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <motion.div
                      key={index}
                      initial={{ width: '20%', opacity: 0.3 }}
                      animate={{ 
                        opacity: index < getPasswordStrength() ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`h-1.5 flex-grow rounded-full ${
                        index < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : 'bg-gray-200'
                      }`}
                    ></motion.div>
                  ))}
                </div>
                
                {/* Criterios de contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordCriteria.map((criterion, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0.5 }}
                      animate={{ 
                        opacity: 1,
                        scale: criterion.regex.test(password) ? [1, 1.05, 1] : 1
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center text-xs"
                    >
                      <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                        criterion.regex.test(password) ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          criterion.regex.test(password) ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <span className={criterion.regex.test(password) ? 'text-gray-700' : 'text-gray-500'}>
                        {criterion.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <PasswordField
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  register={register}
                  error={errors.confirmPassword}
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                />
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
                    Registrando...
                  </div>
                ) : 'Crear Cuenta'}
              </motion.button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500 transition-all duration-200">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const InputField = ({ icon, label, name, type, placeholder, register, error }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 block">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        {...register(name)}
        type={type}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        placeholder={placeholder}
      />
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="text-xs text-red-500 mt-1"
      >
        {error.message}
      </motion.p>
    )}
  </div>
);

const PasswordField = ({ label, name, register, error, showPassword, setShowPassword }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 block">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FiLock className="text-indigo-500" />
      </div>
      <input
        {...register(name)}
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
    {error && (
      <motion.p 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="text-xs text-red-500 mt-1"
      >
        {error.message}
      </motion.p>
    )}
  </div>
);