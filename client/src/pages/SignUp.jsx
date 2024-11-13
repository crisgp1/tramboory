import React, { useState, useEffect } from 'react';
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-5xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-indigo-800">Crear Cuenta</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          />

          <InputField
            icon={<FiMapPin className="text-indigo-500" />}
            label="Dirección"
            name="direccion"
            type="text"
            placeholder="Tu dirección"
            register={register}
          />

          <div className="col-span-full">
            <PasswordField
              label="Contraseña"
              name="password"
              register={register}
              error={errors.password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>

          <div className="col-span-full p-4 bg-indigo-50 rounded-lg text-sm text-indigo-700 leading-relaxed">
            <h4 className="font-semibold mb-2">Requisitos de la contraseña:</h4>
            <ul className="space-y-1">
              {passwordCriteria.map((criterion, index) => (
                <li key={index} className="flex items-center">
                  <span className={`w-5 h-5 mr-2 rounded-full ${criterion.regex.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {criterion.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-full mt-2 flex space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`h-2 flex-grow rounded-full ${
                  index < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : 'bg-gray-200'
                } transition-all duration-300`}
              ></div>
            ))}
          </div>

          <div className="col-span-full">
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className={`col-span-full w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </motion.button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-700 transition duration-300">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

const InputField = ({ icon, label, name, type, placeholder, register, error }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        {...register(name)}
        type={type}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
        placeholder={placeholder}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);

const PasswordField = ({ label, name, register, error, showPassword, setShowPassword }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiLock className="text-indigo-500" />
      </div>
      <input
        {...register(name)}
        type={showPassword ? 'text' : 'password'}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
        placeholder="Tu contraseña"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition duration-300"
      >
        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
  </div>
);