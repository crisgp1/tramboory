import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Usar el alias @ para garantizar resolución correcta en Docker
import axiosInstance from '@shared/utils/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiPackage,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiPrinter,
  FiAlertCircle,
  FiTag,
  FiGift,
  FiImage,
} from 'react-icons/fi';
import PrintableReservation from '@domains/reservas/components/PrintableReservation';

const ReservationModal = ({
  reservation,
  onClose,
  onSendEmail,
  onContactUser
}) => {
  const [modalHeight, setModalHeight] = useState('100vh');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleUpdateReservationStatus = async (newStatus) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await axiosInstance.put(`/api/reservas/${reservation.id}/status`, {
        estado: newStatus
      });
      toast.success('Estado de la reservación actualizado');
      window.dispatchEvent(new CustomEvent('reservationsUpdated'));
    } catch (error) {
      console.error('Error al actualizar el estado de la reservación:', error);
      toast.error('Error al actualizar el estado de la reservación');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (pagoId, newStatus) => {
    setIsUpdatingPayment(true);
    try {
      await axiosInstance.put(`/api/pagos/${pagoId}/status`, {
        estado: newStatus
      });
      toast.success('Estado del pago actualizado');
      window.dispatchEvent(new CustomEvent('reservationsUpdated'));
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error);
      toast.error('Error al actualizar el estado del pago');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  useEffect(() => {
    const updateModalHeight = () => {
      const vh = window.innerHeight;
      setModalHeight(`${vh}px`);
    };

    updateModalHeight();
    window.addEventListener('resize', updateModalHeight);

    return () => window.removeEventListener('resize', updateModalHeight);
  }, []);

  // Add event listener for escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscKey);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  if (!reservation) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-reservation');
    const winPrint = window.open(
      '',
      '',
      'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0'
    );
    winPrint.document.write(printContent.innerHTML);
    winPrint.document.close();
    winPrint.focus();
    winPrint.print();
    winPrint.close();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'text-yellow-500';
      case 'confirmada':
        return 'text-green-500';
      case 'cancelada':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const IconWrapper = ({ icon: Icon, text, color = 'text-gray-700', className = '' }) => (
    <div className={`flex items-center mb-3 ${color} ${className}`}>
      <Icon className="mr-2 text-xl" />
      <span className="text-sm">{text}</span>
    </div>
  );

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-hidden"
        style={{ height: modalHeight }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-4 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center rounded-t-lg">
            <h2 className="text-2xl font-semibold text-gray-800">
              Detalles de la Reserva
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition duration-300"
            >
              <FiXCircle size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* General Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Información General
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <IconWrapper
                      icon={FiCalendar}
                      text={`Fecha: ${new Date(
                        reservation.fecha_reserva
                      ).toLocaleDateString()}`}
                    />
                    <IconWrapper
                      icon={FiClock}
                      text={`Hora: ${reservation.hora_inicio}`}
                    />
                    <IconWrapper
                      icon={FiDollarSign}
                      text={`Total: $${reservation.total}`}
                    />
                    <IconWrapper
                      icon={FiPackage}
                      text={`Paquete: ${
                        reservation.paquete?.nombre || 'No especificado'
                      }`}
                    />
                    <IconWrapper
                      icon={FiTag}
                      text={`Opción de Alimento: ${
                        reservation.opcionAlimento?.nombre || 'No especificada'
                      }`}
                    />
                    <IconWrapper
                      icon={FiAlertCircle}
                      text={`Estado: ${
                        reservation.estado.charAt(0).toUpperCase() + reservation.estado.slice(1)
                      }`}
                      color={getStatusColor(reservation.estado)}
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Información de Pagos
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {reservation.pagos && reservation.pagos.length > 0 ? (
                      <div className="space-y-4">
                        {reservation.pagos.map((pago, index) => (
                          <div key={pago.id} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">
                                Pago #{index + 1}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(pago.fecha_pago).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Método: {pago.metodo_pago}
                                </p>
                                <p className="text-sm font-medium">
                                  Monto: ${pago.monto}
                                </p>
                              </div>
                              <select
                                value={pago.estado}
                                onChange={(e) => handleUpdatePaymentStatus(pago.id, e.target.value)}
                                disabled={isUpdatingPayment}
                                className={`ml-2 rounded-full px-3 py-1 text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                  pago.estado === 'completado'
                                    ? 'bg-green-100 text-green-800'
                                    : pago.estado === 'fallido'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="completado">Completado</option>
                                <option value="fallido">Fallido</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay pagos registrados</p>
                    )}
                  </div>
                </div>

                {/* Client Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Detalles del Cliente
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <IconWrapper
                      icon={FiUser}
                      text={`Cliente: ${
                        reservation.usuario?.nombre || 'No especificado'
                      }`}
                    />
                    <IconWrapper
                      icon={FiPhone}
                      text={`Teléfono: ${
                        reservation.usuario?.telefono || 'No especificado'
                      }`}
                    />
                    <IconWrapper
                      icon={FiMail}
                      text={`Email: ${
                        reservation.usuario?.email || 'No especificado'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Event Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Detalles del Evento
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <IconWrapper
                      icon={FiUser}
                      text={`Festejado: ${reservation.nombre_festejado}`}
                    />
                    <IconWrapper
                      icon={FiUser}
                      text={`Edad: ${reservation.edad_festejado} años`}
                    />
                    <IconWrapper
                      icon={FiGift}
                      text={`Temática: ${
                        reservation.tematicaReserva?.nombre || 'No especificada'
                      }`}
                    />
                    {/* Mampara Section */}
                    <div className="mt-3 p-3 bg-white rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles de la Mampara</h4>
                      {reservation.mampara ? (
                        <>
                          <IconWrapper
                            icon={FiImage}
                            text={`Piezas: ${reservation.mampara.piezas}`}
                            className="mb-1"
                          />
                          <IconWrapper
                            icon={FiDollarSign}
                            text={`Precio: $${reservation.mampara.precio}`}
                            className="mb-1"
                          />
                          {reservation.mampara.tematica && (
                            <IconWrapper
                              icon={FiGift}
                              text={`Temática: ${reservation.mampara.tematica.nombre}`}
                            />
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">No se seleccionó mampara</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Extras */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Extras
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {reservation.extras && reservation.extras.length > 0 ? (
                      <ul>
                        {reservation.extras.map((extra) => {
                          const cantidad = extra.ReservaExtra?.cantidad || 1;
                          return (
                            <li key={extra.id} className="flex items-center mb-2">
                              <FiCheckCircle className="text-green-600 mr-2" />
                              <span>
                                {`${extra.nombre} (x${cantidad}) - $${extra.precio * cantidad}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500">
                        No se seleccionaron extras.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Comentarios
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 text-sm">
                  {reservation.comentarios || 'Sin comentarios'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Change Section */}
          <div className="bg-white px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de la Reservación</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleUpdateReservationStatus('pendiente')}
                disabled={isUpdatingStatus || reservation.estado === 'pendiente'}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  reservation.estado === 'pendiente'
                    ? 'bg-yellow-500 text-white cursor-default'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                <FiClock className="mr-2" />
                Pendiente
              </button>
              <button
                onClick={() => handleUpdateReservationStatus('confirmada')}
                disabled={isUpdatingStatus || reservation.estado === 'confirmada'}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  reservation.estado === 'confirmada'
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                <FiCheckCircle className="mr-2" />
                Confirmada
              </button>
              <button
                onClick={() => handleUpdateReservationStatus('cancelada')}
                disabled={isUpdatingStatus || reservation.estado === 'cancelada'}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  reservation.estado === 'cancelada'
                    ? 'bg-red-500 text-white cursor-default'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                <FiXCircle className="mr-2" />
                Cancelada
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-lg">

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-4">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center text-sm"
              >
                <FiPrinter className="mr-2" />
                Imprimir Reserva
              </button>
              <button
                onClick={() => onSendEmail(reservation)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 flex items-center text-sm"
              >
                <FiMail className="mr-2" />
                Enviar por Correo
              </button>
              <button
                onClick={() => onContactUser(reservation)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 flex items-center text-sm"
              >
                <FiPhone className="mr-2" />
                Contactar Cliente
              </button>
            </div>
          </div>
        </motion.div>

        {/* Printable Content */}
        <div id="printable-reservation" className="hidden">
          <PrintableReservation reservation={reservation} />
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ReservationModal;