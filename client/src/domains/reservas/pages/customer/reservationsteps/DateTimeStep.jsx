import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import DatePicker, { registerLocale } from 'react-datepicker';
import { motion, AnimatePresence } from 'framer-motion';
import { isTuesday, addDays, isAfter, isBefore, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FiCalendar,
  FiClock,
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';

// Registrar locale español para DatePicker
registerLocale('es', es);

// Constantes
const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00',
    icon: FiSun
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00',
    icon: FiMoon
  }
};

const TUESDAY_SURCHARGE = 500; // Cargo adicional por los martes

const DateTimeStep = ({ 
  unavailableDates = [], // Valor predeterminado para evitar el error
  existingReservations = [], // Valor predeterminado
  setIsTuesdayModalOpen,
  methods
}) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const selectedDate = watch('fecha_reserva');
  const selectedTimeSlot = watch('hora_inicio');
  const tuesdayFee = watch('tuesdayFee') || 0;
  
  // Estados locales para gestión de UI
  const [showTuesdayWarning, setShowTuesdayWarning] = useState(false);
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState({
    morning: false,
    afternoon: false
  });

  // Calcular slots de tiempo no disponibles cuando cambia la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const reservationsOnSelectedDate = existingReservations.filter(
        reservation => reservation.fecha_reserva.split('T')[0] === dateString
      );

      const morning = reservationsOnSelectedDate.some(
        reservation => reservation.hora_inicio === TIME_SLOTS.MORNING.start
      );
      
      const afternoon = reservationsOnSelectedDate.some(
        reservation => reservation.hora_inicio === TIME_SLOTS.AFTERNOON.start
      );

      setUnavailableTimeSlots({ morning, afternoon });
      
      // Verificar si es martes para mostrar advertencia
      if (isTuesday(selectedDate)) {
        setShowTuesdayWarning(true);
        setValue('tuesdayFee', TUESDAY_SURCHARGE);
      } else {
        setShowTuesdayWarning(false);
        setValue('tuesdayFee', 0);
      }
      
      // Reiniciar timeSlot si el seleccionado ya no está disponible
      if (selectedTimeSlot) {
        const timeSlotValue = 
          typeof selectedTimeSlot === 'object' ? selectedTimeSlot.value : selectedTimeSlot;
          
        if ((timeSlotValue === 'mañana' && morning) || 
            (timeSlotValue === 'tarde' && afternoon)) {
          setValue('hora_inicio', null);
        }
      }
    }
  }, [selectedDate, existingReservations, setValue, selectedTimeSlot]);

  // Función para filtrar fechas disponibles en el DatePicker
  const filterAvailableDates = (date) => {
    // No permitir fechas en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(date, today)) return false;
    
    // No permitir fechas muy futuras (6 meses)
    const sixMonthsFromNow = addDays(today, 180);
    if (isAfter(date, sixMonthsFromNow)) return false;
    
    // Verificar si la fecha está en la lista de fechas no disponibles (con verificación segura)
    if (!Array.isArray(unavailableDates) || unavailableDates.length === 0) {
      return true; // Si no hay fechas no disponibles, todas están disponibles
    }
    
    return !unavailableDates.some(unavailableDate => {
      const unavailableDateTime = new Date(unavailableDate);
      return (
        unavailableDateTime.getDate() === date.getDate() &&
        unavailableDateTime.getMonth() === date.getMonth() &&
        unavailableDateTime.getFullYear() === date.getFullYear()
      );
    });
  };

  // Componente personalizado para las cabeceras del DatePicker
  const CustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled
  }) => (
    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-t-lg">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className={`p-2 rounded-full transition-all duration-200 ${
          prevMonthButtonDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-indigo-600 hover:bg-indigo-100'
        }`}
        aria-label="Mes anterior"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      
      <h2 className="text-lg font-semibold text-indigo-800 capitalize">
        {format(date, 'MMMM yyyy', { locale: es })}
      </h2>
      
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className={`p-2 rounded-full transition-all duration-200 ${
          nextMonthButtonDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-indigo-600 hover:bg-indigo-100'
        }`}
        aria-label="Mes siguiente"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Renderizar un time slot
  const renderTimeSlot = (timeSlotKey, timeSlot, isDisabled) => {
    const TimeIcon = timeSlot.icon;
    const isSelected = selectedTimeSlot && 
      (typeof selectedTimeSlot === 'object' 
        ? selectedTimeSlot.value === timeSlot.value 
        : selectedTimeSlot === timeSlot.value);

    return (
      <motion.div
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            if (!isDisabled) {
              setValue('hora_inicio', {
                label: timeSlot.label,
                value: timeSlot.value
              });
            }
          }}
          disabled={isDisabled}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
              : isSelected
                ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-full ${
                isSelected
                  ? 'bg-indigo-100 text-indigo-600'
                  : isDisabled
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              <TimeIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className={`font-medium ${isSelected ? 'text-indigo-600' : ''}`}>
                {timeSlot.label}
              </h3>
            </div>
          </div>
        </button>
        
        {isDisabled && (
          <div className="absolute top-1 right-1 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
            No disponible
          </div>
        )}
        
        {isSelected && (
          <div className="absolute top-1 right-1 bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <FiCheck className="w-3 h-3" />
            Seleccionado
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-indigo-900 mb-3 leading-tight">Selecciona Fecha y Hora</h2>
        <p className="text-indigo-600 max-w-2xl mx-auto opacity-80">
          Elige el día y horario perfecto para tu evento especial
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Selector de Fecha */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-100 p-2 rounded-md">
              <FiCalendar className="text-indigo-600 w-5 h-5" />
            </div>
            <h3 className="font-semibold text-indigo-800 text-lg">Fecha de la Reserva</h3>
          </div>
          
          <Controller
            control={control}
            name="fecha_reserva"
            rules={{ required: "La fecha es requerida" }}
            render={({ field }) => (
              <div className="relative">
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    if (isTuesday(date) && !tuesdayFee) {
                      setIsTuesdayModalOpen(true);
                    }
                  }}
                  onCalendarOpen={() => setIsDatePickerOpen(true)}
                  onCalendarClose={() => setIsDatePickerOpen(false)}
                  filterDate={filterAvailableDates}
                  locale="es"
                  dateFormat="dd 'de' MMMM 'de' yyyy"
                  placeholderText="Selecciona una fecha"
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 180)}
                  renderCustomHeader={CustomHeader}
                  calendarClassName="bg-white shadow-xl rounded-lg border-0 overflow-hidden"
                  inline={false}
                  showIcon
                  className={`w-full p-4 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.fecha_reserva
                      ? 'border-red-300 bg-red-50 border-2'
                      : isDatePickerOpen
                        ? 'border-indigo-300 bg-indigo-50 border-2'
                        : 'border border-gray-300 bg-white hover:border-indigo-300'
                  }`}
                  dayClassName={date => 
                    date.getDay() === 0 || date.getDay() === 6 
                      ? "bg-blue-50 text-blue-800 rounded-full hover:bg-blue-100"
                      : date.getDay() === 2 
                        ? "bg-amber-50 text-amber-800 rounded-full hover:bg-amber-100"
                        : "rounded-full hover:bg-indigo-100"
                  }
                />
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FiCalendar className={`w-5 h-5 ${
                    errors.fecha_reserva
                      ? 'text-red-400'
                      : isDatePickerOpen
                        ? 'text-indigo-500'
                        : 'text-gray-400'
                  }`} />
                </div>
                
                {errors.fecha_reserva && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.fecha_reserva.message}</span>
                  </p>
                )}
              </div>
            )}
          />
          
          {/* Advertencia de Martes */}
          <AnimatePresence>
            {showTuesdayWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3"
              >
                <div className="flex gap-2">
                  <FiInfo className="text-amber-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 text-sm">
                      Has seleccionado un martes. Aplicamos un cargo adicional de{' '}
                      <span className="font-medium">{new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      }).format(TUESDAY_SURCHARGE)}</span>{' '}
                      para reservas en este día.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selector de Horario */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-indigo-100 p-2 rounded-md">
              <FiClock className="text-indigo-600 w-5 h-5" />
            </div>
            <h3 className="font-semibold text-indigo-800 text-lg">Horario</h3>
          </div>
          
          <Controller
            control={control}
            name="hora_inicio"
            rules={{ required: "El horario es requerido" }}
            render={({ field }) => (
              <div className="space-y-4">
                <div className="space-y-4">
                  {/* Horario Mañana */}
                  {renderTimeSlot(
                    'morning',
                    TIME_SLOTS.MORNING,
                    selectedDate ? unavailableTimeSlots.morning : true
                  )}
                  
                  {/* Horario Tarde */}
                  {renderTimeSlot(
                    'afternoon',
                    TIME_SLOTS.AFTERNOON,
                    selectedDate ? unavailableTimeSlots.afternoon : true
                  )}
                </div>
                
                {errors.hora_inicio && (
                  <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.hora_inicio.message}</span>
                  </p>
                )}
              </div>
            )}
          />
          
          {selectedDate && unavailableTimeSlots.morning && unavailableTimeSlots.afternoon && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <FiAlertCircle className="text-red-500 w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-semibold">Fecha no disponible</p>
                  <p className="text-red-600 text-sm mt-1">
                    Ambos horarios están ocupados para esta fecha. Por favor, selecciona otra fecha.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {!selectedDate && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <FiInfo className="text-blue-500 w-6 h-6 flex-shrink-0" />
                <p className="text-blue-700">
                  Por favor, selecciona primero una fecha para ver los horarios disponibles.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm"
      >
        <div className="flex gap-4">
          <FiInfo className="w-7 h-7 text-indigo-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-indigo-900 text-lg">Información importante</h4>
            <ul className="mt-3 space-y-3 text-indigo-800">
              <li className="flex items-start gap-2">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5" />
                <span>
                  Las reservas están disponibles de hasta 6 meses en adelante.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5" />
                <span>
                  Horario de mañana: 11:00 AM - 4:00 PM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5" />
                <span>
                  Horario de tarde: 5:00 PM - 10:00 PM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>
                  Los martes tienen un cargo adicional de {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(TUESDAY_SURCHARGE)}.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DateTimeStep;