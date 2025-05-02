import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiCalendar, 
  FiHeart, 
  FiInfo, 
  FiAlertCircle,
  FiMessageCircle,
  FiCheckCircle
} from 'react-icons/fi';

const FormField = ({ 
  icon: Icon, 
  label, 
  name, 
  required, 
  error, 
  children, 
  hint 
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="flex items-center gap-2 text-gray-700 font-medium">
        {Icon && <Icon className="text-indigo-600 w-5 h-5" />}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      
      {children}
      
      {hint && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
      
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const CelebrantStep = () => {
  const { 
    control, 
    formState: { errors, dirtyFields, isValid },
    watch 
  } = useFormContext();
  
  const watchedNombre = watch('nombre_festejado') || '';
  const watchedEdad = watch('edad_festejado') || '';
  const watchedSexo = watch('sexo_festejado') || '';
  const watchedColor = watch('color_favorito') || '';
  
  // Calcular progreso del formulario (campos completos / total de campos necesarios)
  const requiredFieldsCount = 2; // nombre y edad son obligatorios
  const completedRequiredFieldsCount = 
    (!!watchedNombre ? 1 : 0) + 
    (!!watchedEdad ? 1 : 0);
  
  const formProgress = (completedRequiredFieldsCount / requiredFieldsCount) * 100;

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Información del Festejado</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cuéntanos sobre la persona que va a celebrar este día especial para que podamos personalizar tu evento.
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${formProgress}%` }}
        ></div>
      </div>

      {/* Formulario de datos del festejado */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <FormField
              icon={FiUser}
              label="Nombre del Festejado"
              name="nombre_festejado"
              required={true}
              error={errors.nombre_festejado?.message}
            >
              <Controller
                name="nombre_festejado"
                control={control}
                rules={{ 
                  required: "El nombre del festejado es requerido",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres"
                  }
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="nombre_festejado"
                    type="text"
                    placeholder="Ej. María Fernanda"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.nombre_festejado
                        ? 'border-red-300 bg-red-50'
                        : field.value
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                    }`}
                  />
                )}
              />
            </FormField>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              icon={FiCalendar}
              label="Edad que Cumple"
              name="edad_festejado"
              required={true}
              error={errors.edad_festejado?.message}
            >
              <Controller
                name="edad_festejado"
                control={control}
                rules={{ 
                  required: "La edad es requerida",
                  min: {
                    value: 1,
                    message: "La edad debe ser mayor a 0"
                  },
                  max: {
                    value: 120,
                    message: "La edad debe ser menor a 120"
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Solo se permiten números"
                  }
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    id="edad_festejado"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Ej. 7"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.edad_festejado
                        ? 'border-red-300 bg-red-50'
                        : field.value
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                    }`}
                  />
                )}
              />
            </FormField>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              icon={FiUser}
              label="Sexo del Festejado"
              name="sexo_festejado"
              hint="Esta información nos ayuda a personalizar mejor la decoración"
            >
              <Controller
                name="sexo_festejado"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="flex gap-4 mt-2">
                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        field.value === 'femenino'
                          ? 'bg-pink-50 border-pink-300 text-pink-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          {...field}
                          type="radio"
                          value="femenino"
                          className="hidden"
                          checked={field.value === 'femenino'}
                          onChange={() => field.onChange('femenino')}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          field.value === 'femenino'
                            ? 'border-pink-500 bg-white'
                            : 'border-gray-400'
                        }`}>
                          {field.value === 'femenino' && (
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          )}
                        </div>
                        <span>Niña</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        field.value === 'masculino'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          {...field}
                          type="radio"
                          value="masculino"
                          className="hidden"
                          checked={field.value === 'masculino'}
                          onChange={() => field.onChange('masculino')}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          field.value === 'masculino'
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-400'
                        }`}>
                          {field.value === 'masculino' && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <span>Niño</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        field.value && !['femenino', 'masculino'].includes(field.value)
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          {...field}
                          type="radio"
                          value="otro"
                          className="hidden"
                          checked={field.value && !['femenino', 'masculino'].includes(field.value)}
                          onChange={() => field.onChange('otro')}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          field.value && !['femenino', 'masculino'].includes(field.value)
                            ? 'border-purple-500 bg-white'
                            : 'border-gray-400'
                        }`}>
                          {field.value && !['femenino', 'masculino'].includes(field.value) && (
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          )}
                        </div>
                        <span>Otro</span>
                      </label>
                    </div>

                    {/* Campo de texto para "Otro" con animación */}
                    {field.value && !['femenino', 'masculino'].includes(field.value) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeInOut",
                          opacity: { duration: 0.2 }
                        }}
                        className="mt-3 overflow-hidden"
                      >
                        <Controller
                          name="sexo_festejado_personalizado"
                          control={control}
                          render={({ field: customField }) => (
                            <input
                              {...customField}
                              type="text"
                              placeholder="Especifica el género"
                              className="w-full p-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50 transition-all duration-300"
                              onChange={(e) => {
                                customField.onChange(e);
                                // Actualiza el valor principal con el texto personalizado
                                field.onChange(e.target.value);
                              }}
                              autoFocus
                            />
                          )}
                        />
                      </motion.div>
                    )}
                  </>
                )}
              />
            </FormField>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              icon={FiHeart}
              label="Color Favorito"
              name="color_favorito"
              hint="Nos ayuda a personalizar la decoración"
            >
              <Controller
                name="color_favorito"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="color_favorito"
                    type="text"
                    placeholder="Ej. Azul, Rosa, Verde"
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      field.value
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  />
                )}
              />
            </FormField>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="mt-6">
          <FormField
            icon={FiMessageCircle}
            label="Detalles Adicionales o Peticiones Especiales"
            name="detalles_especiales"
            hint="¿Hay algo especial que deberíamos saber? Ej: alergias, preferencias, etc."
          >
            <Controller
              name="detalles_especiales"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="detalles_especiales"
                  rows="3"
                  placeholder="Escribe aquí cualquier detalle o petición especial..."
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}
            />
          </FormField>
        </motion.div>

        {/* Mensaje de campos requeridos */}
        <div className="mt-6 flex items-start gap-2 text-xs text-gray-500">
          <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Los campos marcados con <span className="text-red-500">*</span> son requeridos.</p>
        </div>
      </motion.div>

      {/* Consejos o información adicional */}
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
        <div className="flex gap-3">
          <FiCheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800">¡Personaliza al máximo!</h4>
            <p className="text-indigo-700 text-sm mt-1">
              Cuanta más información nos brindes sobre el festejado, mejor podremos personalizar tu evento para hacerlo inolvidable. 
              Toda información es confidencial y solo será utilizada para mejorar tu experiencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrantStep;