import React, { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FiCalendar, FiClock, FiAlertCircle, FiInfo } from 'react-icons/fi';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import Select from 'react-select';
import FormSection from './FormSection';
import { customSelectStyles } from './styles';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00'
  }
};

const TimeSlotSelect = ({ 
  field, 
  existingReservations,
  selectedDate,
  customStyles 
}) => {
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];

    const dateStr = selectedDate.toISOString().split('T')[0];
    const reservationsForDate = existingReservations.filter(
      reservation => {
        const reservationDate = reservation.fecha_reserva.split('T')[0];
        const isActiveReservation = reservation.estado === 'pendiente' || reservation.estado === 'confirmada';
        return reservationDate === dateStr && isActiveReservation;
      }
    );

    const availableSlots = [];

    // Verificar horario de mañana
    const morningBooked = reservationsForDate.some(r => {
      const reservationHour = r.hora_inicio;
      return reservationHour === TIME_SLOTS.MORNING.start;
    });

    // Verificar horario de tarde
    const afternoonBooked = reservationsForDate.some(r => {
      const reservationHour = r.hora_inicio;
      return reservationHour === TIME_SLOTS.AFTERNOON.start;
    });

    if (!morningBooked) {
      availableSlots.push({
        label: TIME_SLOTS.MORNING.label,
        value: TIME_SLOTS.MORNING.value,
        start: TIME_SLOTS.MORNING.start,
        end: TIME_SLOTS.MORNING.end
      });
    }

    if (!afternoonBooked) {
      availableSlots.push({
        label: TIME_SLOTS.AFTERNOON.label,
        value: TIME_SLOTS.AFTERNOON.value,
        start: TIME_SLOTS.AFTERNOON.start,
        end: TIME_SLOTS.AFTERNOON.end
      });
    }

    return availableSlots;
  };

  const timeOptions = getAvailableTimeSlots();
  const selectedOption = field.value ? timeOptions.find(option => 
    option.value === (typeof field.value === 'object' ? field.value.value : field.value)
  ) : null;

  return (
    <Select
      options={timeOptions}
      value={selectedOption}
      onChange={(option) => {
        if (option) {
          const timeSlot = option.value === 'mañana' ? TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;
          field.onChange({
            value: option.value,
            hora_inicio: timeSlot.start,
            hora_fin: timeSlot.end
          });
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
  // Observar cambios en el paquete y la fecha
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

  // Actualizar precio cuando cambia el paquete o la fecha
  useEffect(() => {
    if (selectedPackage && selectedDate) {
      const pkg = packages.find((p) => p.id === selectedPackage);
      if (pkg) {
        const dayOfWeek = selectedDate.getDay();
        const newPrice =
          dayOfWeek >= 1 && dayOfWeek <= 4
            ? parseFloat(pkg.precio_lunes_jueves)
            : parseFloat(pkg.precio_viernes_domingo);
        setValue('packagePrice', newPrice, { shouldValidate: false });

        // Actualizar cargo de martes si aplica
        if (dayOfWeek === 2) {
          setValue('tuesdayFee', 500, { shouldValidate: false });
          setIsTuesdayModalOpen(true);
        } else {
          setValue('tuesdayFee', 0, { shouldValidate: false });
        }
      }
    }
  }, [selectedPackage, selectedDate, packages, setValue, setIsTuesdayModalOpen]);

  const handleDateChange = (date, onChange) => {
    if (!date) {
      onChange(null);
      setValue('hora_inicio', null);
      setValue('packagePrice', 0, { shouldValidate: false });
      setValue('tuesdayFee', 0, { shouldValidate: false });
      return;
    }

    onChange(date);
    setValue('hora_inicio', null);
  };

  const isDateFullyBooked = (date) => {
    if (!date) return false;

    const dateStr = date.toISOString().split('T')[0];
    const reservationsForDate = existingReservations.filter(
      reservation => {
        const reservationDate = reservation.fecha_reserva.split('T')[0];
        const isActiveReservation = reservation.estado === 'pendiente' || reservation.estado === 'confirmada';
        return reservationDate === dateStr && isActiveReservation;
      }
    );

    const morningBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.MORNING.start);
    const afternoonBooked = reservationsForDate.some(r => r.hora_inicio === TIME_SLOTS.AFTERNOON.start);

    return morningBooked && afternoonBooked;
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
        {/* Date Selection */}
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
                  onChange={(date) => handleDateChange(date, field.onChange)}
                  filterDate={(date) => !isDateFullyBooked(date)}
                  customInput={<CustomInput />}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  excludeDates={unavailableDates}
                  locale="es"
                  showPopperArrow={false}
                  popperPlacement="bottom-start"
                  popperClassName="datepicker-popper"
                  calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                  dayClassName={date => 
                    date.getDay() === 0 || date.getDay() === 6 
                      ? "weekend-day" 
                      : undefined
                  }
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

        {/* Time Selection */}
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
                          selectedTimeSlot.value === 'mañana' 
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
    </FormSection>
  );
};

export default DateTimeSection;