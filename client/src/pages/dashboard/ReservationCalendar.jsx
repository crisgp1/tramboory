import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX, FiInfo, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from '../../components/axiosConfig';
import { toast } from 'react-hot-toast';

const localizer = momentLocalizer(moment);

const ReservationCalendar = ({ reservations }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateAvailability, setDateAvailability] = useState({});
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

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

  useEffect(() => {
    const availability = {};
    const uniqueDates = [...new Set(reservations.map(r => r.fecha_reserva))];
    uniqueDates.forEach(date => {
      availability[date] = checkDateAvailability(date, reservations);
    });
    setDateAvailability(availability);
  }, [reservations]);

  const events = reservations.map(reservation => ({
    title: `#${reservation.id} ${reservation.usuario?.nombre || ''}`,
    start: new Date(reservation.fecha_reserva),
    end: new Date(reservation.fecha_reserva),
    allDay: true,
    resource: reservation,
  }));

  const eventStyleGetter = (event, start, end, isSelected) => {
    if (event.isBlockingPreview) {
      return {
        style: {
          backgroundColor: '#DC2626',
          borderRadius: '4px',
          opacity: 0.7,
          color: 'white',
          border: '2px dashed #991B1B',
          padding: '1px 4px',
          fontSize: '0.75rem'
        }
      };
    }

    const date = moment(start).format('YYYY-MM-DD');
    const availability = dateAvailability[date];
    let backgroundColor = '#4F46E5';
    
    if (availability === 'unavailable') {
      backgroundColor = '#EF4444';
    } else if (availability === 'partial') {
      backgroundColor = '#F59E0B';
    } else if (availability === 'available') {
      backgroundColor = '#10B981';
    }

    return {
      style: {
        backgroundColor: isSelected ? '#3730A3' : backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        padding: '1px 4px',
        fontSize: '0.75rem'
      }
    };
  };

  const handleBlockDates = async () => {
    try {
      const response = await axios.post('/api/reservas/block-dates', {
        dates: selectedDates
      });
      
      if (response.status === 201) {
        // Toast con animación personalizada
        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: 0.4
              }}
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FiCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      ¡Días bloqueados exitosamente!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDates.length} {selectedDates.length === 1 ? 'día administrativo' : 'días administrativos'} bloqueado(s).
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          ),
          { duration: 5000 }
        );
        
        setIsBlockingMode(false);
        setSelectedDates([]);
        
        // Emitir evento para actualizar reservas sin recargar la página
        window.dispatchEvent(new CustomEvent('reservationsUpdated'));
        
        // Cerrar modal de bloqueo si está abierto
        setShowBlockModal(false);
      }
    } catch (error) {
      let errorMessage = 'Error al bloquear los días';
      let invalidDatesText = '';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.invalidDates) {
          invalidDatesText = 'Fechas inválidas: ' + error.response.data.invalidDates.join(', ');
        }
      }
      
      // Toast de error con animación
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.4
            }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {errorMessage}
                  </p>
                  {invalidDatesText && (
                    <p className="mt-1 text-sm text-gray-500">
                      {invalidDatesText}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        ),
        { duration: 6000 }
      );
    }
  };

  const CustomToolbar = ({ date, onNavigate, label }) => (
    <div className="flex justify-between items-center px-2 py-1">
      <button
        onClick={() => onNavigate('PREV')}
        className="p-1 rounded-full hover:bg-indigo-100 transition-colors duration-200"
      >
        <FiChevronLeft className="text-indigo-600 text-lg" />
      </button>
      <span className="text-sm font-medium text-indigo-800">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1"
        >
          <FiCalendar className="text-sm" /> Hoy
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-1 rounded-full hover:bg-indigo-100 transition-colors duration-200"
        >
          <FiChevronRight className="text-indigo-600 text-lg" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 transition-all duration-300 hover:shadow-xl">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 -mx-4 -mt-4 px-4 py-3 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Calendario de Reservas</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 text-white"
              title="Mostrar leyenda"
            >
              <FiInfo className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsBlockingMode(!isBlockingMode);
                if (!isBlockingMode) {
                  setSelectedDates([]);
                }
              }}
              className={`px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-2 text-sm ${
                isBlockingMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isBlockingMode ? (
                <>
                  <FiX className="text-lg" />
                  <span>Cancelar</span>
                </>
              ) : (
                <>
                  <FiCalendar className="text-lg" />
                  <span>Bloquear</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* Calendario */}
        <div className={`relative ${isBlockingMode && selectedDates.length > 0 ? 'lg:w-3/4' : 'w-full'}`}>
          {/* Leyenda flotante */}
          <AnimatePresence>
            {showLegend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  scale: {
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  }
                }}
                className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-indigo-100"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#10B981]"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#F59E0B]"></div>
                    <span>Parcial</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-[#EF4444]"></div>
                    <span>Ocupado</span>
                  </div>
                  {isBlockingMode && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#DC2626] border border-dashed border-[#991B1B]"></div>
                      <span>A bloquear</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendario */}
          <div className="border border-indigo-100 rounded-lg shadow-sm overflow-hidden bg-white">
            <Calendar
              localizer={localizer}
              events={[
                ...events,
                ...selectedDates.map(date => ({
                  title: 'Bloquear',
                  start: new Date(date),
                  end: new Date(date),
                  allDay: true,
                  isBlockingPreview: true
                }))
              ]}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => !isBlockingMode && setSelectedEvent(event.resource)}
              onSelectSlot={({ start, action }) => {
                if (!isBlockingMode) return;
                
                const date = new Date(start);
                date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                const dateStr = moment(date).format('YYYY-MM-DD');
                
                // Verificar si la fecha es anterior a hoy
                const isPastDate = moment(date).isBefore(moment(), 'day');
                if (isPastDate) return; // No permitir seleccionar fechas pasadas
                
                if (action === 'click') {
                  setSelectedDates(prev => {
                    if (prev.includes(dateStr)) {
                      return prev.filter(d => d !== dateStr);
                    }
                    return [...prev, dateStr];
                  });
                } else if (action === 'select') {
                  if (!isDragging) {
                    setIsDragging(true);
                    setSelectedDates([dateStr]);
                  }
                }
              }}
              onSelecting={({ start, end }) => {
                if (!isBlockingMode || !isDragging) return;

                const dates = [];
                const startDate = new Date(start);
                const endDate = new Date(end);
                startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
                endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
                
                let current = moment(startDate);
                const endMoment = moment(endDate);
                const today = moment().startOf('day');

                while (current.isSameOrBefore(endMoment, 'day')) {
                  // Solo incluir fechas desde hoy en adelante
                  if (!current.isBefore(today)) {
                    dates.push(current.format('YYYY-MM-DD'));
                  }
                  current.add(1, 'days');
                }

                setSelectedDates(dates);
                return true;
              }}
              onSelectEnd={() => {
                setIsDragging(false);
              }}
              selectable={isBlockingMode}
              components={{
                toolbar: CustomToolbar,
              }}
              dayPropGetter={date => {
                const dateStr = moment(date).format('YYYY-MM-DD');
                const isSelected = selectedDates.includes(dateStr);
                const isPastDate = moment(date).isBefore(moment(), 'day');
                
                return {
                  className: `text-sm ${isSelected ? 'selected-date' : ''} ${isPastDate ? 'past-date' : ''}`,
                  style: {
                    margin: 0,
                    padding: '0.25rem',
                    backgroundColor: isPastDate 
                      ? 'rgba(229, 231, 235, 0.5)' 
                      : isSelected 
                        ? 'rgba(220, 38, 38, 0.1)' 
                        : 'transparent',
                    opacity: isPastDate ? 0.5 : 1,
                    cursor: isPastDate ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease, opacity 0.2s ease',
                    pointerEvents: isPastDate ? 'none' : 'auto'
                  }
                };
              }}
              style={{ height: 500 }}
            />
          </div>
        </div>

        {/* Botón flotante para seleccionar días */}
        <AnimatePresence>
          {isBlockingMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4"
            >
              <button
                onClick={() => setShowBlockModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
              >
                <FiCalendar className="text-lg" />
                <span>
                  {selectedDates.length === 0 
                    ? 'Seleccionar Días' 
                    : `${selectedDates.length} ${selectedDates.length === 1 ? 'día' : 'días'} seleccionados`}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de bloqueo de fechas */}
        <Modal
          isOpen={showBlockModal}
          onClose={() => {
            setShowBlockModal(false);
            if (!selectedDates.length) {
              setIsBlockingMode(false);
            }
          }}
          title="Bloquear Fechas"
          maxWidth="sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FiCalendar className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-indigo-900">Selección de Días</h4>
                    <p className="text-sm text-indigo-600">
                      Selecciona los días que deseas bloquear
                    </p>
                  </div>
                </div>
                <p className="text-xs text-indigo-600">
                  Haz clic en el calendario para agregar más días
                </p>
              </div>
            </div>

            <div className="border border-indigo-100 rounded-lg divide-y max-h-[300px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
              {selectedDates
                .sort((a, b) => moment(a).diff(moment(b)))
                .map(date => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    duration: 0.2,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="px-4 py-2 flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600">
                    {moment(date).format('LL')}
                  </span>
                  <button
                    onClick={() => setSelectedDates(prev => prev.filter(d => d !== date))}
                    className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                  >
                    <FiX className="text-lg" />
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t shadow-lg">
              <div className="w-full text-center text-sm text-gray-500 mb-3">
                {selectedDates.length} {selectedDates.length === 1 ? 'día seleccionado' : 'días seleccionados'}
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setIsBlockingMode(false);
                    setSelectedDates([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBlockDates}
                  disabled={selectedDates.length === 0}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm font-medium
                    ${selectedDates.length === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  Confirmar Bloqueo
                </button>
              </div>
            </div>
          </motion.div>
        </Modal>

        {/* Modal de detalles de la reserva */}
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Detalles de la Reserva"
          maxWidth="lg"
        >
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                y: {
                  type: "spring",
                  damping: 25,
                  stiffness: 200
                }
              }}
              className="space-y-6"
            >
              {/* Estado de la reserva */}
              <div className="flex justify-end">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedEvent.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  selectedEvent.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                  selectedEvent.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEvent.estado.charAt(0).toUpperCase() + selectedEvent.estado.slice(1)}
                </span>
              </div>

              {/* Información del Cliente */}
              <div className="flex items-start space-x-4 bg-white p-4 rounded-lg border border-indigo-100">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 text-xl font-medium">
                    {(selectedEvent.usuario?.nombre || 'N')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedEvent.usuario?.nombre || 'No especificado'}
                  </h4>
                  <p className="text-sm text-gray-500">Cliente #{selectedEvent.id}</p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium mb-1">Fecha</p>
                    <p className="text-lg text-gray-900">{moment(selectedEvent.fecha_reserva).format('LL')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-medium mb-1">Hora</p>
                    <p className="text-lg text-gray-900">{moment(selectedEvent.hora_inicio, 'HH:mm:ss').format('h:mm A')}</p>
                  </div>
                </div>
              </div>

              {/* Disponibilidad del Día */}
              <div className="border border-indigo-100 rounded-lg overflow-hidden">
                <div className="bg-indigo-50 px-3 py-2">
                  <h4 className="text-xs font-medium text-indigo-600">Disponibilidad del Día</h4>
                </div>
                <div className="divide-y divide-indigo-100">
                  <div className="px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mañana</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">(11:00 - 16:00)</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedEvent.hora_inicio === '11:00:00' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {selectedEvent.hora_inicio === '11:00:00' ? 'Ocupado' : 'Disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tarde</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">(17:00 - 22:00)</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedEvent.hora_inicio !== '11:00:00' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {selectedEvent.hora_inicio !== '11:00:00' ? 'Ocupado' : 'Disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </Modal>
      </div>

      <style jsx global>{`
        .rbc-day-bg.selected-date:hover {
          background-color: rgba(220, 38, 38, 0.2) !important;
        }
        .rbc-day-bg {
          transition: background-color 0.2s ease;
        }
        .rbc-calendar {
          font-size: 0.875rem;
        }
        .rbc-header {
          padding: 0.5rem 0;
          font-weight: 500;
          color: #4B5563;
        }
        .rbc-date-cell {
          padding: 0.25rem;
          font-size: 0.75rem;
        }
        .rbc-day-bg.past-date {
          background-color: rgba(229, 231, 235, 0.5) !important;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .rbc-date-cell.past-date {
          color: #9CA3AF;
          opacity: 0.7;
        }
        .rbc-event {
          padding: 2px 4px !important;
          font-size: 0.75rem !important;
        }
        .rbc-toolbar button {
          font-size: 0.875rem;
          padding: 0.375rem 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default ReservationCalendar;