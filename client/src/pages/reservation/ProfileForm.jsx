import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSave,
  FiX,
  FiEdit,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import axiosInstance from '../../components/axiosConfig';

// Esquema de validación corregido
const schema = yup.object().shape({
  nombre: yup.string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras'),
  
  email: yup.string()
    .required('El email es requerido')
    .email('Email inválido'),
  
  telefono: yup.string()
    .matches(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  
  direccion: yup.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  
  currentPassword: yup.string(),
  
  newPassword: yup.string()
    .test('passwordRequirements', 'La contraseña no cumple con los requisitos', function(value) {
      if (this.parent.currentPassword || value) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!value) return false;
        if (!passwordRegex.test(value)) return false;
        if (value === this.parent.currentPassword) return false;
        return true;
      }
      return true;
    }),
  
  confirmPassword: yup.string()
    .test('passwordMatch', 'Las contraseñas deben coincidir', function(value) {
      return !this.parent.newPassword || value === this.parent.newPassword;
    })
});

// Componente InputField con forwardRef
const InputField = React.forwardRef(({ icon: Icon, error, disabled, type = "text", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`${disabled ? 'text-gray-400' : 'text-indigo-500'}`} />
      </div>
      <input
        {...props}
        ref={ref}
        type={type === "password" && showPassword ? "text" : type}
        disabled={disabled}
        className={`
          block w-full pl-10 pr-10 py-2.5 
          border rounded-lg shadow-sm 
          transition-all duration-200
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                   'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}
          ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          placeholder-gray-400
          focus:ring-2 focus:ring-opacity-50
        `}
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <FiEyeOff className="text-gray-400 hover:text-gray-600" />
          ) : (
            <FiEye className="text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-600 flex items-center"
        >
          <FiAlertCircle className="w-4 h-4 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

// Componente de requisitos de contraseña
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { 
      test: /.{8,}/, 
      text: 'Al menos 8 caracteres',
      icon: FiLock 
    },
    { 
      test: /[A-Z]/, 
      text: 'Una letra mayúscula',
      icon: FiCheckCircle 
    },
    { 
      test: /[a-z]/, 
      text: 'Una letra minúscula',
      icon: FiCheckCircle 
    },
    { 
      test: /[0-9]/, 
      text: 'Un número',
      icon: FiCheckCircle 
    },
    { 
      test: /[@$!%*?&]/, 
      text: 'Un carácter especial (@$!%*?&)',
      icon: FiCheckCircle 
    }
  ];

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de la contraseña:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {requirements.map((req, index) => {
          const isMet = password && req.test.test(password);
          return (
            <div
              key={index}
              className={`flex items-center text-sm ${
                isMet ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <req.icon className={`w-4 h-4 mr-2 ${
                isMet ? 'text-green-500' : 'text-gray-400'
              }`} />
              {req.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente principal ProfileForm
const ProfileForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [userData, setUserData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Función fetchUserData mejorada
  const fetchUserData = async () => {
    try {
      console.log('Obteniendo datos del usuario...');
      const response = await axiosInstance.get('/api/auth/me');
      console.log('Datos recibidos:', response.data);
      
      if (response.data) {
        setUserData(response.data);
        const formData = {
          nombre: response.data.nombre || '',
          email: response.data.email || '',
          telefono: response.data.telefono || '',
          direccion: response.data.direccion || '',
        };
        console.log('Reseteando formulario con:', formData);
        reset(formData);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
        localStorage.removeItem('token');
        window.location.href = '/signin';
      } else {
        toast.error('Error al cargar los datos del usuario');
      }
    }
  };

  useEffect(() => {
    console.log('Componente montado, ejecutando fetchUserData');
    fetchUserData();
  }, []);

  // Función onSubmit mejorada
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updateData = {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        direccion: data.direccion || null
      };

      if (data.currentPassword && data.newPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      console.log('Enviando datos de actualización:', updateData);

      const response = await axiosInstance.put('/api/auth/profile', updateData);
      console.log('Respuesta del servidor:', response.data);

      toast.success('¡Perfil actualizado exitosamente!');

      if (data.newPassword) {
        toast.info('Se ha actualizado tu contraseña. Por favor, inicia sesión nuevamente.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/signin';
        }, 2000);
      } else {
        setIsEditing(false);
        setShowPasswordFields(false);
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      
      if (error.response?.status === 401) {
        toast.error('Sesión expirada o contraseña actual incorrecta');
      } else {
        toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
                  <p className="text-indigo-100">Gestiona tu información personal</p>
                </div>
              </div>
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                    flex items-center space-x-2 transition-colors duration-200"
                >
                  <FiEdit className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </motion.button>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      setShowPasswordFields(false);
                      reset(userData);
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                      flex items-center space-x-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancelar</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <InputField
                    icon={FiUser}
                    {...register('nombre')}
                    type="text"
                    placeholder="Tu nombre completo"
                    disabled={!isEditing}
                    error={errors.nombre?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <InputField
                    icon={FiMail}
                    {...register('email')}
                    type="email"
                    placeholder="tu@email.com"
                    disabled={!isEditing}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <InputField
                    icon={FiPhone}
                    {...register('telefono')}
                    type="tel"
                    placeholder="Tu número de teléfono"
                    disabled={!isEditing}
                    error={errors.telefono?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <InputField
                    icon={FiMapPin}
                    {...register('direccion')}
                    type="text"
                    placeholder="Tu dirección"
                    disabled={!isEditing}
                    error={errors.direccion?.message}
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            {isEditing && (
              <div className="mt-8">
                <motion.button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200 border-2 border-indigo-200 text-indigo-700
                    hover:bg-indigo-50"
                >
                  <FiLock className="w-4 h-4 mr-2" />
                  {showPasswordFields ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                  </motion.button>

                <AnimatePresence>
                  {showPasswordFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual
                          </label>
                          <InputField
                            icon={FiShield}
                            {...register('currentPassword')}
                            type="password"
                            placeholder="••••••••"
                            error={errors.currentPassword?.message}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                          </label>
                          <InputField
                            icon={FiLock}
                            {...register('newPassword')}
                            type="password"
                            placeholder="••••••••"
                            error={errors.newPassword?.message}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                          </label>
                          <InputField
                            icon={FiCheckCircle}
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                          />
                        </div>

                        {/* Password Requirements */}
                        <div className="md:col-span-2">
                          <PasswordRequirements password={watch('newPassword')} />
                          
                          {/* Additional Password Warning */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <div className="flex items-start">
                              <FiInfo className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                              <div className="text-sm text-yellow-700">
                                <p className="font-medium">Importante:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li>Al cambiar tu contraseña, se cerrará tu sesión actual</li>
                                  <li>Deberás iniciar sesión nuevamente con tu nueva contraseña</li>
                                  <li>Asegúrate de recordar la nueva contraseña</li>
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-end space-x-4"
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordFields(false);
                    reset(userData);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium
                    hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancelar</span>
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium
                    hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    transition-colors duration-200 flex items-center space-x-2
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiSave className="w-4 h-4" />
                  <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </motion.button>
              </motion.div>
            )}
          </form>

          {/* Feedback Message */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg
                  border border-indigo-200 flex items-center space-x-3"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600" />
                <span className="text-sm text-gray-600">Actualizando tu perfil...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Success Message After Save */}
        <AnimatePresence>
          {!isEditing && userData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200
                flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">
                  Tu perfil está actualizado y seguro
                </span>
              </div>
              <span className="text-xs text-green-600">
                Última actualización: {new Date(userData.updatedAt).toLocaleString()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileForm;