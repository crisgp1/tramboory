import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiCalendar, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format, isWeekend, isTuesday, addDays, isBefore, startOfDay } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

registerLocale('es', es);

const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00',
    icon: '🌅'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00',
    icon: '🌇'
  }
};

const DateTimeSection = ({
  control,
  errors,
  setValue,
  unavailableDates = [],
  existingReservations = [],
  packages = [],
  showTuesdayModal,
  setShowTuesdayModal
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hasShownTuesdayModal, setHasShownTuesdayModal] = useState(false);

  const selectedPackage = useWatch({
    control,
    name: 'id_paquete'
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

        if (dayOfWeek === 2 && !hasShownTuesdayModal) {
          setValue('tuesdayFee', 1500, { shouldValidate: false });
          setShowTuesdayModal(true);
          setHasShownTuesdayModal(true);
        } else if (dayOfWeek !== 2) {
          setValue('tuesdayFee', 0, { shouldValidate: false });
          setHasShownTuesdayModal(false);
        }
      }
    }
  }, [selectedPackage, selectedDate, packages, setValue, setShowTuesdayModal, hasShownTuesdayModal]);

  const getDateAvailability = useCallback((date) => {
    if (!date) return 'available';

    // Check if date is in the past or within one week
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    if (isBefore(date, oneWeekFromNow)) {
      return 'unavailable';
    }

    const reservationsOnDate = existingReservations.filter(
      (reservation) =>
        new Date(reservation.fecha_reserva).toDateString() === date.toDateString() &&
        reservation.estado !== 'cancelada'
    );

    const morningReserved = reservationsOnDate.some(r => r.hora_inicio === TIME_SLOTS.MORNING.start);
    const afternoonReserved = reservationsOnDate.some(r => r.hora_inicio === TIME_SLOTS.AFTERNOON.start);

    if (morningReserved && afternoonReserved) return 'unavailable';
    if (morningReserved || afternoonReserved) return 'partial';
    return 'available';
  }, [existingReservations]);

  const isTimeSlotAvailable = useCallback((date, timeSlot) => {
    if (!date) return true;

    const reservationsOnDate = existingReservations.filter(
      (reservation) =>
        new Date(reservation.fecha_reserva).toDateString() === date.toDateString()
    );

    return !reservationsOnDate.some(
      (reservation) => reservation.hora_inicio === timeSlot.start
    );
  }, [existingReservations]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return Object.values(TIME_SLOTS).filter((slot) =>
      isTimeSlotAvailable(selectedDate, slot)
    );
  }, [selectedDate, isTimeSlotAvailable]);

  const timeSlotOptions = useMemo(() =>
    availableTimeSlots.map((slot) => ({
      value: slot.value,
      label: slot.label,
      icon: slot.icon,
      hora_inicio: slot.start,
      hora_fin: slot.end,
      data: slot
    })),
    [availableTimeSlots]
  );

  const formatOptionLabel = useCallback(({ label, icon, value }) => (
    <div key={`time-slot-${value}`} className="flex items-center gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  ), []);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.hora_inicio ? '#ef4444' : state.isFocused ? '#6366f1' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#e5e7eb'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      transition: 'all 0.2s ease',
      '&:active': {
        backgroundColor: '#6366f1'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50
    })
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

  const getDayClassName = useCallback((date) => {
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    const availability = getDateAvailability(date);
    const isWeekendDay = isWeekend(date);
    const isPastDate = isBefore(date, today);
    const isWithinFirstWeek = isBefore(date, oneWeekFromNow);
    const isToday = date.getTime() === today.getTime();
    let className = 'w-full h-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 ';

    if (isToday) {
      className += 'bg-blue-100 text-blue-800 font-bold ring-2 ring-blue-400 ';
    } else if (isPastDate || isWithinFirstWeek) {
      className += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
    } else if (availability === 'unavailable') {
      className += 'bg-red-100 text-red-800 cursor-not-allowed ';
    } else if (availability === 'partial') {
      className += 'bg-yellow-100 text-yellow-800 ';
    } else if (availability === 'available') {
      className += 'bg-green-100 text-green-800 ';
    }

    if (isWeekendDay && !isToday) {
      className += 'font-medium';
    }

    return className;
  }, [getDateAvailability]);

  const renderDateHeader = useCallback((date) => {
    const isWeekendDay = isWeekend(date);
    return (
      <div className={`text-center py-1 ${isWeekendDay ? 'bg-indigo-50' : ''}`}>
        {format(date, 'EEE', { locale: es })}
      </div>
    );
  }, []);

  const filterDate = useCallback((date) => {
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    const availability = getDateAvailability(date);
    return !isBefore(date, oneWeekFromNow) && availability !== 'unavailable';
  }, []);

  // Usar useWatch para observar el valor del horario
  const currentTimeSlot = useWatch({
    control,
    name: 'hora_inicio'
  });

  const handleDateChange = useCallback((date) => {
    if (!date) {
      setSelectedDate(null);
      setValue('fecha_reserva', null);
      setValue('packagePrice', 0, { shouldValidate: false });
      setValue('tuesdayFee', 0, { shouldValidate: false });
      setHasShownTuesdayModal(false);
      setValue('hora_inicio', null);
      return;
    }

    setSelectedDate(date);
    setValue('fecha_reserva', date);
    
    // Solo mantener el horario si existe y está disponible
    if (!currentTimeSlot || !isTimeSlotAvailable(date, currentTimeSlot.data)) {
      setValue('hora_inicio', null);
    }
  }, [setValue, currentTimeSlot, isTimeSlotAvailable]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Fecha y Hora</h3>
        </div>
        {selectedDate && (
          <span className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha de la Reserva
          </label>
          <Controller
            name="fecha_reserva"
            control={control}
            rules={{ required: 'La fecha es requerida' }}
            render={({ field }) => (
              <div>
                <DatePicker
                  selected={field.value}
                  onChange={handleDateChange}
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  minDate={addDays(new Date(), 7)}
                  filterDate={filterDate}
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
                  renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled
                  }) => (
                    <div className="flex items-center justify-between px-2 py-2">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        type="button"
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                      >
                        ←
                      </button>
                      <div className="text-lg font-semibold">
                        {format(date, 'MMMM yyyy', { locale: es })}
                      </div>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        type="button"
                        className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
                      >
                        →
                      </button>
                    </div>
                  )}
                  renderWeekdayShort={(day) => renderDateHeader(new Date(day))}
                  className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  calendarClassName="border border-gray-200 rounded-lg shadow-lg"
                />
                {errors.fecha_reserva && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.fecha_reserva.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Horario
          </label>
          <Controller
            name="hora_inicio"
            control={control}
            rules={{ required: 'El horario es requerido' }}
            render={({ field }) => (
              <div>
                <Select
                  {...field}
                  isDisabled={!selectedDate}
                  options={timeSlotOptions}
                  placeholder={
                    selectedDate
                      ? "Selecciona un horario"
                      : "Primero selecciona una fecha"
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  formatOptionLabel={formatOptionLabel}
                  noOptionsMessage={() => "No hay horarios disponibles"}
                />
                {errors.hora_inicio && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.hora_inicio.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-2">
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
        </div>
        <div className="flex items-center gap-2 mb-3">
          <FiInfo className="text-indigo-600" />
          <h4 className="font-medium text-gray-900">Información de Horarios</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(TIME_SLOTS).map((slot) => (
            <div
              key={`time-slot-info-${slot.value}`}
              className="flex items-center gap-3 bg-gray-50 p-3 rounded-md"
            >
              <span className="text-xl">{slot.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{slot.label}</div>
                <div className="text-sm text-gray-600">
                  Duración: 5 horas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDate && availableTimeSlots.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
          <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">No hay horarios disponibles</p>
            <p className="text-sm mt-1">
              Todos los horarios para esta fecha están reservados.
              Por favor, selecciona otra fecha.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSection;
