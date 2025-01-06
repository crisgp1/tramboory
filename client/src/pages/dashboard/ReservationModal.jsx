import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import PrintableReservation from '../../components/PrintableReservation';
import { toast } from 'react-toastify';

const ReservationModal = ({
  reservation,
  onClose,
  onSendEmail,
  onContactUser
}) => {
  const [modalHeight, setModalHeight] = useState('100vh');

  useEffect(() => {
    const updateModalHeight = () => {
      const vh = window.innerHeight;
      setModalHeight(`${vh}px`);
    };

    updateModalHeight();
    window.addEventListener('resize', updateModalHeight);

    return () => window.removeEventListener('resize', updateModalHeight);
  }, []);

  if (!reservation) return null;

  // Function to print the reservation
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

  // Function to get the color of the status
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

  // Auxiliary component for icons and text
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
                        {reservation.extras.map((extra) => (
                          <li key={extra.id} className="flex items-center mb-2">
                            <FiCheckCircle className="text-green-600 mr-2" />
                            <span>
                              {`${extra.nombre} (x${extra.ReservaExtra.cantidad || 1}) - $${extra.precio * (extra.ReservaExtra.cantidad || 1)}`}
                            </span>
                          </li>
                        ))}
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

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-wrap justify-end gap-4 rounded-b-lg">
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