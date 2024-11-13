import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FiCheck,
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiImage,
  FiList,
  FiInfo,
  FiMapPin,
  FiMail
} from 'react-icons/fi';
import SummaryItem from './SummaryItem';
import { useNavigate } from 'react-router-dom';

const ReservationModal = ({ reservationData, onClose, packages, extrasData }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const { extras, tuesdayFee } = reservationData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  const getDayType = (fecha) => {
    if (!fecha) return '';
    const reservationDate = new Date(fecha);
    const dayOfWeek = reservationDate.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4 ? 'L-J' : 'V-D';
  };

  const getExtrasTotal = () => {
    return extras?.reduce((total, extra) => {
      const extraInfo = extrasData.find(e => e.id === extra.id);
      return total + (parseFloat(extraInfo?.precio || 0) * (parseInt(extra.cantidad) || 1));
    }, 0) || 0;
  };

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.75)',
      }
    );
  }, []);

  const handleClose = () => {
    onClose();
    navigate(`/reservation-status/${reservationData.id}`);
  };

  const Section = ({ title, children, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-indigo-700">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-gray-600 mt-2">
            Tu reservación ha sido registrada exitosamente
          </p>
          <div className="text-sm text-gray-500 mt-1">
            ID de Reserva: #{reservationData.id}
          </div>
        </div>

        <div className="space-y-6">
          {/* Detalles del Paquete */}
          <Section title="Detalles del Paquete" icon={FiPackage}>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <SummaryItem
                icon={<FiPackage className="text-indigo-600" />}
                label="Paquete Seleccionado"
                value={`${packages.find((pkg) => pkg.id === reservationData.id_paquete)?.nombre || 'No seleccionado'}`}
              />
              <SummaryItem
                icon={<FiDollarSign className="text-indigo-600" />}
                label="Precio del Paquete"
                value={`${formatCurrency(reservationData.packagePrice)} (Tarifa ${getDayType(reservationData.fecha_reserva)})`}
              />
            </div>
          </Section>

          {/* Fecha y Horario */}
          <Section title="Fecha y Horario" icon={FiCalendar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryItem
                icon={<FiCalendar className="text-indigo-600" />}
                label="Fecha"
                value={formatDate(reservationData.fecha_reserva)}
              />
              <SummaryItem
                icon={<FiClock className="text-indigo-600" />}
                label="Horario"
                value={reservationData.hora_inicio === 'mañana' ? 'Matutino (9:00 - 14:00)' : 'Vespertino (15:00 - 20:00)'}
              />
            </div>
          </Section>

          {/* Información del Festejado */}
          <Section title="Información del Festejado" icon={FiUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryItem
                icon={<FiUser className="text-indigo-600" />}
                label="Nombre"
                value={reservationData.nombre_festejado}
              />
              <SummaryItem
                icon={<FiUser className="text-indigo-600" />}
                label="Edad"
                value={`${reservationData.edad_festejado} años`}
              />
            </div>
          </Section>

          {/* Servicios Seleccionados */}
          <Section title="Servicios Seleccionados" icon={FiList}>
            <SummaryItem
              icon={<FiDollarSign className="text-indigo-600" />}
              label="Opción de Alimento"
              value={reservationData.opcion_alimento_nombre || 'Ninguna'}
            />
            <SummaryItem
              icon={<FiImage className="text-indigo-600" />}
              label="Temática"
              value={reservationData.tematica_nombre || 'No seleccionada'}
            />
          </Section>

          {/* Extras y Cargos Adicionales */}
          {(extras?.length > 0 || tuesdayFee > 0) && (
            <Section title="Extras y Cargos Adicionales" icon={FiList}>
              {extras && extras.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Servicios Extra:</h4>
                  {extras.map((extra, index) => {
                    const extraInfo = extrasData.find((e) => e.id === extra.id);
                    const extraTotal = (parseFloat(extraInfo?.precio) || 0) * (parseInt(extra.cantidad) || 1);
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{`${extraInfo?.nombre} (x${extra.cantidad})`}</span>
                        <span className="font-medium">{formatCurrency(extraTotal)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Extras:</span>
                      <span>{formatCurrency(getExtrasTotal())}</span>
                    </div>
                  </div>
                </div>
              )}
              {tuesdayFee > 0 && (
                <SummaryItem
                  icon={<FiDollarSign className="text-indigo-600" />}
                  label="Cargo por Martes"
                  value={formatCurrency(tuesdayFee)}
                />
              )}
            </Section>
          )}

          {/* Resumen de Costos */}
          <Section title="Resumen de Costos" icon={FiDollarSign}>
            <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paquete Base ({getDayType(reservationData.fecha_reserva)}):</span>
                <span>{formatCurrency(reservationData.packagePrice)}</span>
              </div>
              {extras && extras.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Extras:</span>
                  <span>{formatCurrency(getExtrasTotal())}</span>
                </div>
              )}
              {tuesdayFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cargo Martes:</span>
                  <span>{formatCurrency(tuesdayFee)}</span>
                </div>
              )}
              <div className="border-t border-indigo-100 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Final:</span>
                  <span className="text-indigo-600">{formatCurrency(reservationData.total)}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Botones de Acción */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 flex items-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            Ver Estado de Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;