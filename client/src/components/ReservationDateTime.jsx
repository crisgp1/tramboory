import { useState, useEffect, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { FiAlertCircle, FiCalendar, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

// Constants
const RESERVATION_STATES = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  CANCELLED: 'cancelada'
};

const TIME_SLOTS = {
  MORNING: {
    value: 'mañana',
    label: 'Matutino (9:00 - 14:00)',
    startTime: '09:00',
    endTime: '14:00'
  },
  AFTERNOON: {
    value: 'tarde',
    label: 'Vespertino (15:00 - 20:00)',
    startTime: '15:00',
    endTime: '20:00'
  }
};

const ReservationDateTime = ({
  control,
  setValue,
  watch,
  errors,
  packages = [],
  existingReservations = [],
  unavailableDates = [],
  setIsTuesdayModalOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState({
    morning: true,
    afternoon: true
  });
  const watchedFields = watch();

  const { subscribeToDate, unsubscribeFromDate } = useReservationSocket(
    handleAvailabilityUpdate
  );


  // Helper function to check if a reservation is active
  const isActiveReservation = (reservation) => {
    return reservation.estado === RESERVATION_STATES.PENDING || 
           reservation.estado === RESERVATION_STATES.CONFIRMED;
  };

  const handleAvailabilityUpdate = useCallback(
    ({ date, availability }) => {
      const selectedDate = watchedFields.fecha_reserva;
      if (!selectedDate) return;

      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      if (selectedDateStr === date) {
        setAvailableSlots(availability);

        // Si el horario seleccionado ya no está disponible
        if (watchedFields.hora_inicio) {
          const isCurrentSlotAvailable =
            (watchedFields.hora_inicio === 'mañana' && availability.morning) ||
            (watchedFields.hora_inicio === 'tarde' && availability.afternoon);

          if (!isCurrentSlotAvailable) {
            setValue('hora_inicio', null);
            toast.warn('El horario seleccionado ya no está disponible');
          }
        }
      }
    },
    [watchedFields.fecha_reserva, watchedFields.hora_inicio, setValue]
  );

  // Function to check if a specific time slot is available
  const isTimeSlotAvailable = useCallback((date, timeSlot) => {
    if (!date) return false;

    const dateStr = date.toISOString().split('T')[0];
    const reservationsForDate = existingReservations.filter(reservation => {
      const resDate = new Date(reservation.fecha_reserva).toISOString().split('T')[0];
      return resDate === dateStr && isActiveReservation(reservation);
    });

    return !reservationsForDate.some(r => r.hora_inicio === timeSlot);
  }, [existingReservations]);

  // Function to update availability of time slots
  const updateAvailability = useCallback((date) => {
    if (!date) {
      setAvailableSlots({ morning: true, afternoon: true });
      return;
    }

    setLoading(true);
    try {
      const morningAvailable = isTimeSlotAvailable(date, TIME_SLOTS.MORNING.value);
      const afternoonAvailable = isTimeSlotAvailable(date, TIME_SLOTS.AFTERNOON.value);

      setAvailableSlots({
        morning: morningAvailable,
        afternoon: afternoonAvailable
      });

      // Clear selected time if it's no longer available
      const currentTime = watchedFields.hora_inicio;
      if (currentTime) {
        const isMorning = currentTime === TIME_SLOTS.MORNING.value;
        if ((isMorning && !morningAvailable) || (!isMorning && !afternoonAvailable)) {
          setValue('hora_inicio', null);
          toast.warning('El horario seleccionado ya no está disponible');
        }
      }
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      toast.error('Error al verificar disponibilidad de horarios');
    } finally {
      setLoading(false);
    }
  }, [watchedFields.hora_inicio, setValue, isTimeSlotAvailable]);

  // Update availability when date changes
  useEffect(() => {
    const selectedDate = watchedFields.fecha_reserva;
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      subscribeToDate(dateStr);
      return () => unsubscribeFromDate(dateStr);
    }
  }, [watchedFields.fecha_reserva, subscribeToDate, unsubscribeFromDate]);

  // Function to get available time slot options
  const getTimeOptions = useCallback(() => {
    const options = [];
    
    if (availableSlots.morning) {
      options.push({
        value: TIME_SLOTS.MORNING.value,
        label: TIME_SLOTS.MORNING.label,
      });
    }
    
    if (availableSlots.afternoon) {
      options.push({
        value: TIME_SLOTS.AFTERNOON.value,
        label: TIME_SLOTS.AFTERNOON.label,
      });
    }

    return options;
  }, [availableSlots]);

  // Function to handle date selection
  const handleDateChange = (date) => {
    if (!date) {
      setValue('fecha_reserva', null);
      setValue('hora_inicio', null);
      return;
    }

    setValue('fecha_reserva', date);
    
    // Check if it's Tuesday
    if (date.getDay() === 2) {
      setValue('tuesdayFee', 1500);
      setIsTuesdayModalOpen(true);
    } else {
      setValue('tuesdayFee', 0);
    }

    // Update time slots availability
    updateAvailability(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Reserva
        </label>
        <div className="relative">
          <Controller
            control={control}
            name="fecha_reserva"
            rules={{ required: 'Fecha de reserva es requerida' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={handleDateChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholderText="Seleccionar fecha"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                excludeDates={unavailableDates}
                disabled={loading}
              />
            )}
          />
          {errors.fecha_reserva && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4" />
              {errors.fecha_reserva.message}
            </p>
          )}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Time Slot Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Horario Disponible
        </label>
        <div className="relative">
          <Controller
            name="hora_inicio"
            control={control}
            rules={{ required: 'Horario es requerido' }}
            render={({ field }) => {
              const timeOptions = getTimeOptions();
              const selectedOption = timeOptions.find(
                option => option.value === field.value
              );

              return (
                <div>
                  <Select
                    options={timeOptions}
                    value={selectedOption}
                    onChange={(option) => field.onChange(option.value)}
                    isDisabled={!watchedFields.fecha_reserva || loading}
                    placeholder={
                      !watchedFields.fecha_reserva
                        ? 'Primero selecciona una fecha'
                        : loading
                        ? 'Verificando disponibilidad...'
                        : timeOptions.length === 0
                        ? 'No hay horarios disponibles'
                        : 'Selecciona un horario'
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {watchedFields.fecha_reserva && !loading && timeOptions.length === 0 && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>No hay horarios disponibles para esta fecha</span>
                    </div>
                  )}
                  {loading && (
                    <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      <span>Verificando disponibilidad...</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.hora_inicio && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <FiAlertCircle className="w-4 h-4" />
              {errors.hora_inicio.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDateTime;