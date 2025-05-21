import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiImage,
  FiList,
  FiMessageCircle,
  FiCoffee,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

// Componente para una sección individual del resumen
const SummarySection = ({ 
  title, 
  icon: Icon, 
  children, 
  editAction, 
  stepIndex, 
  goToStep, 
  className = "", 
  isExpandable = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-indigo-600 w-5 h-5" />}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {editAction && (
            <button
              type="button"
              onClick={() => goToStep(stepIndex)}
              className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
              aria-label={`Editar ${title}`}
            >
              <FiEdit className="w-4 h-4" />
            </button>
          )}
          
          {isExpandable && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      {(!isExpandable || isExpanded) && (
        <div className="p-5">
          {children}
        </div>
      )}
    </div>
  );
};

// Componente para un ítem individual del resumen
const SummaryItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-2 w-1/3 text-gray-600">
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{label}:</span>
    </div>
    <div className="w-2/3 font-medium text-gray-900">
      {value || <span className="text-gray-400 italic">No seleccionado</span>}
    </div>
  </div>
);

const ReviewStep = ({ 
  packages, 
  foodOptions, 
  tematicas, 
  mamparas, 
  extras, 
  goToStep 
}) => {
  const { watch } = useFormContext();
  const formValues = watch();
  
  // Datos seleccionados
  const selectedPackage = packages.find(pkg => pkg.id === formValues.id_paquete);
  const selectedFoodOption = foodOptions.find(food => food.id === formValues.id_opcion_alimento);
  const selectedTematica = tematicas.find(tema => tema.id === formValues.id_tematica);
  const selectedMampara = mamparas.find(mampara => mampara.id === formValues.id_mampara);
  const selectedExtras = formValues.extras || [];
  
  // Formatear fecha
  const formatDate = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'No seleccionada';
      }
  
      return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  // Obtener el horario formateado
  const getFormattedTimeSlot = () => {
    if (!formValues.hora_inicio) return 'No seleccionada';
    
    if (typeof formValues.hora_inicio === 'object') {
      return formValues.hora_inicio.label || 'No seleccionada';
    }
    
    return formValues.hora_inicio === 'mañana' 
      ? 'Mañana (11:00 - 16:00)' 
      : 'Tarde (17:00 - 22:00)';
  };
  
  // Descripción de extras seleccionados
  const getExtrasDescription = () => {
    if (!selectedExtras.length) return null;
    
    return (
      <div className="space-y-2 py-2">
        {selectedExtras.map((extra, index) => {
          const extraInfo = extras.find(e => e.id === extra.id);
          if (!extraInfo) return null;
          
          const cantidad = parseInt(extra.cantidad) || 1;
          const extraPrice = (parseFloat(extraInfo.precio) || 0) * cantidad;
          
          return (
            <div key={index} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{extraInfo.nombre}</span>
                {cantidad > 1 && <span className="text-gray-500"> (x{cantidad})</span>}
              </div>
              <div className="text-indigo-600 font-medium">
                {formatCurrency(extraPrice)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Cálculo del total
  const calculateTotal = () => {
    let total = 0;
    
    // Precio del paquete
    if (selectedPackage) {
      const packagePrice = formValues.packagePrice || 0;
      total += packagePrice;
    }
    
    // Precio de la opción de alimento
    if (selectedFoodOption) {
      total += parseFloat(selectedFoodOption.precio_extra) || 0;
    }
    
    // Precio de la mampara
    if (selectedMampara) {
      total += parseFloat(selectedMampara.precio) || 0;
    }
    
    // Recargo por martes
    total += parseFloat(formValues.tuesdayFee) || 0;
    
    // Precio de extras
    selectedExtras.forEach(extra => {
      const extraInfo = extras.find(e => e.id === extra.id);
      if (extraInfo && extra.cantidad) {
        total += (parseFloat(extraInfo.precio) || 0) * (parseInt(extra.cantidad) || 1);
      }
    });
    
    return total;
  };

  // Verificar si hay información suficiente para continuar
  const canProceed = () => {
    const requiredFields = [
      'id_paquete',
      'fecha_reserva',
      'hora_inicio',
      'id_tematica',
      'nombre_festejado',
      'edad_festejado'
    ];
    
    return requiredFields.every(field => !!formValues[field]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Revisa tu Reserva</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Por favor verifica que todos los detalles de tu reserva sean correctos antes de continuar.
        </p>
      </div>

      {/* Status Banner */}
      {canProceed() ? (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 mb-6">
          <FiCheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800">¡Todo listo para confirmar!</h3>
            <p className="text-green-700 text-sm">
              Has completado toda la información necesaria. Revisa los detalles y haz clic en continuar cuando estés listo.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 mb-6">
          <FiAlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">Falta información requerida</h3>
            <p className="text-amber-700 text-sm">
              Debes completar todos los campos requeridos para poder confirmar tu reserva. Revisa las secciones marcadas con un botón de editar.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paquete */}
        <SummarySection 
          title="Paquete" 
          icon={FiPackage} 
          editAction={true}
          stepIndex={0}
          goToStep={goToStep}
        >
          {selectedPackage ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">{selectedPackage.nombre}</h4>
                <span className="text-indigo-600 font-bold">{formatCurrency(formValues.packagePrice || 0)}</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                {selectedPackage.min_invitados} - {selectedPackage.max_invitados} invitados
              </p>
              
              {selectedPackage.descripcion && (
                <p className="text-gray-600 text-sm">{selectedPackage.descripcion}</p>
              )}
            </div>
          ) : (
            <div className="py-4 text-amber-600 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span>Este campo es requerido. Por favor selecciona un paquete.</span>
            </div>
          )}
        </SummarySection>

        {/* Fecha y Hora */}
        <SummarySection 
          title="Fecha y Hora" 
          icon={FiCalendar}
          editAction={true}
          stepIndex={1}
          goToStep={goToStep}
        >
          <div className="space-y-4">
            <SummaryItem 
              label="Fecha" 
              value={formatDate(formValues.fecha_reserva)}
              icon={FiCalendar}
            />
            <SummaryItem 
              label="Horario" 
              value={getFormattedTimeSlot()}
              icon={FiClock}
            />
            
            {formValues.tuesdayFee > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <FiAlertTriangle className="w-4 h-4" />
                  Cargo adicional por martes
                </span>
                <span className="text-amber-600 font-medium">
                  {formatCurrency(formValues.tuesdayFee)}
                </span>
              </div>
            )}
          </div>
        </SummarySection>

        {/* Temática */}
        <SummarySection 
          title="Temática" 
          icon={FiImage}
          editAction={true}
          stepIndex={2}
          goToStep={goToStep}
        >
          {selectedTematica ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">{selectedTematica.nombre}</h4>
                {selectedTematica.precio > 0 && (
                  <span className="text-indigo-600 font-bold">{formatCurrency(selectedTematica.precio)}</span>
                )}
              </div>
              
              {selectedTematica.descripcion && (
                <p className="text-gray-600 text-sm">{selectedTematica.descripcion}</p>
              )}
            </div>
          ) : (
            <div className="py-4 text-amber-600 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span>Este campo es requerido. Por favor selecciona una temática.</span>
            </div>
          )}
        </SummarySection>

        {/* Mampara */}
        <SummarySection 
          title="Mampara" 
          icon={FiImage}
          editAction={true}
          stepIndex={3}
          goToStep={goToStep}
        >
          {selectedMampara ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">Mampara de {selectedMampara.piezas} piezas</h4>
                <span className="text-indigo-600 font-bold">{formatCurrency(selectedMampara.precio)}</span>
              </div>
              
              {selectedMampara.descripcion && (
                <p className="text-gray-600 text-sm">{selectedMampara.descripcion}</p>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No seleccionada (opcional)
            </div>
          )}
        </SummarySection>

        {/* Opción de Alimentos */}
        <SummarySection 
          title="Opción de Alimentos" 
          icon={FiCoffee}
          editAction={true}
          stepIndex={4}
          goToStep={goToStep}
        >
          {selectedFoodOption ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">{selectedFoodOption.nombre}</h4>
                <span className="text-indigo-600 font-bold">{formatCurrency(selectedFoodOption.precio_extra)}</span>
              </div>
              
              {selectedFoodOption.descripcion && (
                <p className="text-gray-600 text-sm">{selectedFoodOption.descripcion}</p>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No seleccionada (opcional)
            </div>
          )}
        </SummarySection>

        {/* Extras */}
        <SummarySection 
          title="Extras" 
          icon={FiList}
          editAction={true}
          stepIndex={5}
          goToStep={goToStep}
          isExpandable={selectedExtras.length > 3}
        >
          {selectedExtras.length > 0 ? (
            getExtrasDescription()
          ) : (
            <div className="text-gray-500 italic">
              No seleccionados (opcional)
            </div>
          )}
        </SummarySection>

        {/* Festejado */}
        <SummarySection 
          title="Información del Festejado" 
          icon={FiUser}
          editAction={true}
          stepIndex={6}
          goToStep={goToStep}
        >
          {formValues.nombre_festejado && formValues.edad_festejado ? (
            <div className="space-y-4">
              <SummaryItem 
                label="Nombre" 
                value={formValues.nombre_festejado}
                icon={FiUser}
              />
              <SummaryItem 
                label="Edad" 
                value={formValues.edad_festejado}
                icon={FiCalendar}
              />
              {formValues.sexo_festejado && (
                <SummaryItem 
                  label="Sexo" 
                  value={formValues.sexo_festejado === 'femenino' ? 'Niña' : 'Niño'}
                  icon={FiUser}
                />
              )}
              {formValues.color_favorito && (
                <SummaryItem 
                  label="Color favorito" 
                  value={formValues.color_favorito}
                  icon={FiImage}
                />
              )}
            </div>
          ) : (
            <div className="py-4 text-amber-600 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span>Este campo es requerido. Por favor completa la información del festejado.</span>
            </div>
          )}
        </SummarySection>

        {/* Comentarios */}
        <SummarySection 
          title="Comentarios o Peticiones Especiales" 
          icon={FiMessageCircle}
          editAction={true}
          stepIndex={6}
          goToStep={goToStep}
        >
          {formValues.detalles_especiales ? (
            <p className="text-gray-700">{formValues.detalles_especiales}</p>
          ) : (
            <div className="text-gray-500 italic">
              No se proporcionaron comentarios adicionales (opcional)
            </div>
          )}
        </SummarySection>
      </div>

      {/* Total */}
      <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-indigo-600 w-6 h-6" />
            <span className="text-xl font-bold text-indigo-800">Total a Pagar:</span>
          </div>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(calculateTotal())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;