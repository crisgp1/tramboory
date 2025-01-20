import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from 'react-icons/fi';

const localizer = momentLocalizer(moment);

const ReservationCalendar = ({ reservations }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateAvailability, setDateAvailability] = useState({});

  // Función para verificar disponibilidad de horarios
  const checkDateAvailability = (date, reservations) => {
    const dateReservations = reservations.filter(
      r => r.fecha_reserva === date && r.estado !== 'cancelada'
    );

    const morningReserved = dateReservations.some(r => r.hora_inicio === '11:00:00');
    const eveningReserved = dateReservations.some(r => r.hora_inicio !== '11:00:00');

    if (morningReserved && eveningReserved) return 'unavailable';
    if (morningReserved || eveningReserved) return 'partial';
    return 'available';
  };

  // Actualizar el estado de disponibilidad cuando cambian las reservas
  useEffect(() => {
    const availability = {};
    const uniqueDates = [...new Set(reservations.map(r => r.fecha_reserva))];
    
    uniqueDates.forEach(date => {
      availability[date] = checkDateAvailability(date, reservations);
    });
    
    setDateAvailability(availability);
  }, [reservations]);

  const events = reservations.map(reservation => {
    const date = moment(reservation.fecha_reserva).format('YYYY-MM-DD');
    const availability = dateAvailability[date];
    let title = `Reserva #${reservation.id}`;
    
    if (availability === 'partial') {
      const isEvening = reservation.hora_inicio !== '11:00:00';
      title += isEvening ? ' (Tarde)' : ' (Mañana)';
    }
    
    return {
      title,
      start: new Date(reservation.fecha_reserva),
      end: new Date(reservation.fecha_reserva),
      allDay: true,
      resource: reservation,
    };
  });

  const eventStyleGetter = (event, start, end, isSelected) => {
    const date = moment(start).format('YYYY-MM-DD');
    const availability = dateAvailability[date];
    
    let backgroundColor = '#4F46E5'; // Default color
    
    if (availability === 'unavailable') {
      backgroundColor = '#EF4444'; // Rojo para fechas sin disponibilidad
    } else if (availability === 'partial') {
      backgroundColor = '#F59E0B'; // Amarillo para fechas con un horario disponible
    } else if (availability === 'available') {
      backgroundColor = '#10B981'; // Verde para fechas con ambos horarios disponibles
    }

    return {
      style: {
        backgroundColor: isSelected ? '#3730A3' : backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };



  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-indigo-800">Calendario de Reservas</h2>
        <div className="flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#10B981]"></div>
            <span>Ambos horarios disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#F59E0B]"></div>
            <span>Un horario disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#EF4444]"></div>
            <span>Sin disponibilidad</span>
          </div>
        </div>
      </div>
      <div className="h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

const CustomToolbar = ({ date, onNavigate, label }) => {
  return (
    <div className="flex justify-between items-center mb-4 px-2">
      <button
        onClick={() => onNavigate('PREV')}
        className="p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
      >
        <FiChevronLeft className="text-indigo-600 text-xl" />
      </button>
      <span className="text-lg font-semibold text-indigo-800">{label}</span>
      <div className="flex items-center">
        <button
          onClick={() => onNavigate('TODAY')}
          className="mr-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
        >
          <FiCalendar className="mr-1" /> Hoy
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
        >
          <FiChevronRight className="text-indigo-600 text-xl" />
        </button>
      </div>
    </div>
  );
};

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">Detalles de la Reserva</h3>
          <div className="space-y-2">
            <p><strong>Cliente:</strong> {event.nombre_cliente}</p>
            <p><strong>Paquete:</strong> {event.paquete_nombre}</p>
            <p><strong>Fecha:</strong> {moment(event.fecha_reserva).format('LL')}</p>
            <p><strong>Hora:</strong> {event.hora_inicio}</p>
            <p><strong>Estado:</strong> {event.estado}</p>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Disponibilidad de Horarios:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Mañana (11:00 - 16:00):</span>
                  <span className={event.hora_inicio === '11:00:00' ? 'text-red-500' : 'text-green-500'}>
                    {event.hora_inicio === '11:00:00' ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Tarde (17:00 - 22:00):</span>
                  <span className={event.hora_inicio !== '11:00:00' ? 'text-red-500' : 'text-green-500'}>
                    {event.hora_inicio !== '11:00:00' ? 'Ocupado' : 'Disponible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReservationCalendar;