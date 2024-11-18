import React, { useCallback, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { FiCalendar, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format, isWeekend, isTuesday } from 'date-fns';
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

  const isDateBlocked = useCallback((date) => {
    const dateToCheck = new Date(date.setHours(0, 0, 0, 0));
    return unavailableDates.some(
      (unavailableDate) =>
        new Date(unavailableDate).setHours(0, 0, 0, 0) === dateToCheck.getTime()
    );
  }, [unavailableDates]);

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
      label: (
        <div className="flex items-center gap-2">
          <span>{slot.icon}</span>
          <span>{slot.label}</span>
        </div>
      ),
      hora_inicio: slot.start,
      hora_fin: slot.end,
      data: slot
    })),
    [availableTimeSlots]
  );

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

  const renderDateHeader = useCallback((date) => {
    const isWeekendDay = isWeekend(date);
    return (
      <div className={`text-center py-1 ${isWeekendDay ? 'bg-indigo-50' : ''}`}>
        {format(date, 'EEE', { locale: es })}
      </div>
    );
  }, []);

  const handleDateChange = useCallback((date) => {
    if (isTuesday(date) && !hasShownTuesdayModal) {
      setShowTuesdayModal(true);
      setHasShownTuesdayModal(true);
      setValue('tuesdayFee', 1500);
    } else {
      setValue('tuesdayFee', 0);
    }
    setSelectedDate(date);
    setValue('fecha_reserva', date);
    setValue('hora_inicio', null);
  }, [setValue, setShowTuesdayModal, hasShownTuesdayModal]);

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
                  minDate={new Date()}
                  filterDate={(date) => !isDateBlocked(date)}
                  renderDayContents={(day, date) => (
                    <div
                      className={`w-full h-full flex items-center justify-center ${isWeekend(date) ? 'font-medium text-indigo-600' : ''
                        }`}
                    >
                      {day}
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

      <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FiInfo className="text-indigo-600" />
          <h4 className="font-medium text-gray-900">Información de Horarios</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(TIME_SLOTS).map((slot) => (
            <div
              key={slot.value}
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