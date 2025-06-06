import React, { useState, useEffect, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiCalendar, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles } from './styles';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, isBefore, startOfDay } from 'date-fns';

registerLocale('es', es);

const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    hora_inicio: '11:00:00',
    hora_fin: '16:00:00',
    icon: '🌅'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    hora_inicio: '17:00:00',
    hora_fin: '22:00:00',
    icon: '🌇'
  }
};

const TimeSlotSelect = ({ 
  field, 
  existingReservations,
  selectedDate,
  customStyles 
}) => {
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !(selectedDate instanceof Date)) return [];

    const dateStr = selectedDate.toISOString().split('T')[0];
    const reservationsForDate = existingReservations.filter(
      reservation => {
        const reservationDate = new Date(reservation.fecha_reserva).toISOString().split('T')[0];
        const isActiveReservation = reservation.estado === 'pendiente' || reservation.estado === 'confirmada';
        return reservationDate === dateStr && isActiveReservation;
      }
    );

    const availableSlots = [];

    const morningBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.MORNING.hora_inicio);
    const afternoonBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.AFTERNOON.hora_inicio);

    if (!morningBooked) {
      availableSlots.push({
        ...TIME_SLOTS.MORNING,
        label: (
          <div className="flex items-center gap-2">
            <span>{TIME_SLOTS.MORNING.icon}</span>
            <span>{TIME_SLOTS.MORNING.label}</span>
          </div>
        )
      });
    }

    if (!afternoonBooked) {
      availableSlots.push({
        ...TIME_SLOTS.AFTERNOON,
        label: (
          <div className="flex items-center gap-2">
            <span>{TIME_SLOTS.AFTERNOON.icon}</span>
            <span>{TIME_SLOTS.AFTERNOON.label}</span>
          </div>
        )
      });
    }

    return availableSlots;
  };

  const timeOptions = getAvailableTimeSlots();
  const selectedOption = field.value ? timeOptions.find(option => 
    option.value === field.value
  ) : null;

  return (
    <Select
      options={timeOptions}
      value={selectedOption}
      onChange={(option) => {
        if (option) {
          field.onChange(option.value);
        } else {
          field.onChange(null);
        }
      }}
      isDisabled={!selectedDate}
      placeholder={
        !selectedDate
          ? 'Primero selecciona una fecha'
          : timeOptions.length === 0
          ? 'No hay horarios disponibles'
          : 'Selecciona un horario'
      }
      className="react-select-container"
      classNamePrefix="react-select"
      styles={customStyles}
      menuPortalTarget={document.body}
    />
  );
};

const DateTimeSection = ({
  control,
  errors,
  setValue,
  unavailableDates,
  existingReservations,
  setIsTuesdayModalOpen,
  packages
}) => {
  const [tuesdayModalShown, setTuesdayModalShown] = useState(false);

  const selectedPackage = useWatch({
    control,
    name: 'id_paquete'
  });

  const selectedDate = useWatch({
    control,
    name: 'fecha_reserva'
  });

  const selectedTimeSlot = useWatch({
    control,
    name: 'hora_inicio'
  });

  useEffect(() => {
    if (selectedPackage && selectedDate instanceof Date) {
      const pkg = packages.find((p) => p.id === selectedPackage);
      if (pkg) {
        const dayOfWeek = selectedDate.getDay();
        const newPrice =
          dayOfWeek >= 1 && dayOfWeek <= 4
            ? parseFloat(pkg.precio_lunes_jueves)
            : parseFloat(pkg.precio_viernes_domingo);
        setValue('packagePrice', newPrice, { shouldValidate: false });
  
        if (dayOfWeek === 2 && !tuesdayModalShown) {
          setValue('tuesdayFee', 1500, { shouldValidate: false });
          setIsTuesdayModalOpen(true);
          setTuesdayModalShown(true);
        } else if (dayOfWeek !== 2) {
          setValue('tuesdayFee', 0, { shouldValidate: false });
          setTuesdayModalShown(false);
        }
      }
    }
  }, [selectedPackage, selectedDate, packages, setValue, setIsTuesdayModalOpen, tuesdayModalShown]);

  const handleDateChange = (date, onChange) => {
    if (!date) {
      onChange(null);
      setValue('hora_inicio', null);
      setValue('packagePrice', 0, { shouldValidate: false });
      setValue('tuesdayFee', 0, { shouldValidate: false });
      setTuesdayModalShown(false);
      return;
    }
  
    if (date instanceof Date && !isNaN(date.getTime())) {
      const validDate = new Date(date);
      validDate.setHours(0, 0, 0, 0);
      onChange(validDate);
      setValue('hora_inicio', null);
      setTuesdayModalShown(false);
    } else {
      console.error('Fecha inválida:', date);
      onChange(null);
      setValue('hora_inicio', null);
      setTuesdayModalShown(false);
    }
  };

  const getDateAvailability = (date) => {
    if (!date) return 'available';

    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      return 'past';
    }

    // Check if date is within one week
    const oneWeekFromNow = addDays(today, 7);
    if (isBefore(date, oneWeekFromNow)) {
      return 'unavailable';
    }

    const dateStr = date.toISOString().split('T')[0];
    const reservationsForDate = existingReservations.filter(
      reservation => {
        const reservationDate = new Date(reservation.fecha_reserva).toISOString().split('T')[0];
        const isActiveReservation = reservation.estado === 'pendiente' || reservation.estado === 'confirmada';
        return reservationDate === dateStr && isActiveReservation;
      }
    );

    const morningBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.MORNING.hora_inicio);
    const afternoonBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.AFTERNOON.hora_inicio);

    if (morningBooked && afternoonBooked) return 'unavailable';
    if (morningBooked || afternoonBooked) return 'partial';
    return 'available';
  };

  const getDatePriceInfo = useCallback((date) => {
    if (!selectedPackage || !packages.length) return '';
    
    const pkg = packages.find((p) => p.id === selectedPackage);
    if (!pkg) return '';

    const dayOfWeek = date.getDay();
    const basePrice = dayOfWeek >= 1 && dayOfWeek <= 4
      ? pkg.precio_lunes_jueves
      : pkg.precio_viernes_domingo;

    const isTuesdayDate = date.getDay() === 2;
    const priceInfo = `Precio: $${basePrice}${isTuesdayDate ? ' + $1,500 (Martes)' : ''}`;
    
    return priceInfo;
  }, [selectedPackage, packages]);

  const getDayClassName = (date) => {
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    const availability = getDateAvailability(date);
    const isWithinFirstWeek = isBefore(date, oneWeekFromNow);
    const isToday = date.getTime() === today.getTime();
    let className = 'w-full h-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 ';

    if (isToday) {
      className += 'bg-blue-100 text-blue-800 font-bold ring-2 ring-blue-400 ';
    } else if (availability === 'past' || isWithinFirstWeek) {
      className += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
    } else if (availability === 'unavailable') {
      className += 'bg-red-100 text-red-800 cursor-not-allowed ';
    } else if (availability === 'partial') {
      className += 'bg-yellow-100 text-yellow-800 ';
    } else if (availability === 'available') {
      className += 'bg-green-100 text-green-800 ';
    }

    return className;
  };

  const filterDate = (date) => {
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    return !isBefore(date, oneWeekFromNow);
  };

  const CustomInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
    <div className="relative">
      <input
        value={value}
        onChange={onChange}
        onClick={onClick}
        ref={ref}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer bg-white"
        placeholder="Seleccionar fecha"
        readOnly
      />
      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    </div>
  ));

  return (
    <FormSection title="Fecha y Horario" icon={FiCalendar}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Reserva
          </label>
          <div className="relative">
            <Controller
              control={control}
              name="fecha_reserva"
              rules={{ 
                required: 'Fecha de reserva es requerida',
                validate: {
                  isValidDate: (value) => {
                    if (!(value instanceof Date) || isNaN(value.getTime())) {
                      return 'Fecha inválida';
                    }
                    const today = startOfDay(new Date());
                    const oneWeekFromNow = addDays(today, 7);
                    if (isBefore(value, oneWeekFromNow)) {
                      return 'Las reservas deben hacerse con al menos una semana de anticipación';
                    }
                    return true;
                  }
                }
              }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => handleDateChange(date, field.onChange)}
                  customInput={<CustomInput />}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  filterDate={filterDate}
                  excludeDates={unavailableDates}
                  locale="es"
                  showPopperArrow={false}
                  popperPlacement="bottom-start"
                  popperClassName="datepicker-popper"
                  calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                  renderDayContents={(day, date) => (
                    <div className="relative group">
                      <div 
                        className={getDayClassName(date)}
                        aria-label={
                          date.getTime() === startOfDay(new Date()).getTime() 
                            ? "Día actual" 
                            : getDatePriceInfo(date)
                        }
                      >
                        {day}
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {date.getTime() === startOfDay(new Date()).getTime() 
                            ? "Día actual" 
                            : getDatePriceInfo(date)}
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}
            />
            {errors.fecha_reserva && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.fecha_reserva.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horario Disponible
          </label>
          <div className="relative">
            <Controller
              name="hora_inicio"
              control={control}
              rules={{ required: 'Horario es requerido' }}
              render={({ field }) => (
                <div>
                  <TimeSlotSelect
                    field={field}
                    existingReservations={existingReservations}
                    selectedDate={selectedDate}
                    customStyles={customSelectStyles}
                  />
                  {selectedDate && selectedTimeSlot && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md flex items-center gap-2">
                      <FiInfo className="w-4 h-4" />
                      <span>
                        Horario seleccionado: {
                          selectedTimeSlot === 'mañana' 
                            ? TIME_SLOTS.MORNING.label 
                            : TIME_SLOTS.AFTERNOON.label
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}
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

      {/* Leyenda de colores */}
      <div className="mt-4 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-green-100"></div>
            <span>Ambos horarios disponibles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-yellow-100"></div>
            <span>Un horario disponible</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-red-100"></div>
            <span>Sin disponibilidad</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-gray-100"></div>
            <span>Fechas pasadas</span>
          </div>
        </div>
      </div>

      {/* Resumen de la selección */}
      {selectedDate && selectedTimeSlot && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h4 className="text-sm font-medium text-indigo-900 mb-2">Resumen de la Reserva</h4>
          <div className="space-y-2 text-sm text-indigo-700">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <span>Fecha: {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              <span>Horario: {selectedTimeSlot === 'mañana' ? TIME_SLOTS.MORNING.label : TIME_SLOTS.AFTERNOON.label}</span>
            </div>
          </div>
        </div>
      )}
    </FormSection>
  );
};

export default DateTimeSection;
