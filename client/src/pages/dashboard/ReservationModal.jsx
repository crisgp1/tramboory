// ReservationModal.jsx

import { useState, useEffect  } from 'react';
import { motion } from 'framer-motion';
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
} from 'react-icons/fi';
import PrintableReservation from '../../components/PrintableReservation';
import axiosInstance from '../../components/axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';



const ReservationModal = ({
  reservation,
  onClose,
  onSendEmail,
  onContactUser,
  onStatusChange, 
  extras// This function will be called when status changes
}) => {
  const [status, setStatus] = useState(reservation.estado);
  const [fechaProtegida, setFechaProtegida] = useState(true);

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

  // Function to change the reservation status
  const handleStatusChange = async (newStatus) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Cambiar el estado a ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    });
  
    if (result.isConfirmed) {
      try {
        await axiosInstance.put(`/api/reservas/${reservation.id}/status`, {
          estado: newStatus,
        });
        setStatus(newStatus);
        onStatusChange(newStatus); // Notify parent component
  
        // Liberar la fecha si el estado es "cancelado" o "pendiente"
        if (newStatus === 'cancelada' || newStatus === 'pendiente') {
          // Aquí deberías llamar a una función para liberar la fecha en el backend
          await axiosInstance.post(`/api/reservas/${reservation.id}/liberar-fecha`);
        }
  
        toast.success(`Estado de la reserva actualizado a ${newStatus}`);
      } catch (error) {
        console.error('Error al actualizar el estado de la reserva:', error);
        toast.error('Error al actualizar el estado de la reserva');
      }
    }
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

  useEffect(() => {
    // Actualizar la visualización de la fecha basada en el estado actual
    if (status === 'cancelada' || status === 'pendiente') {
      // Aquí puedes actualizar la UI para mostrar la fecha como disponible
      // Por ejemplo, cambiando una clase CSS o un estado local
      setFechaProtegida(false);
    } else {
      setFechaProtegida(true);
    }
  }, [status]);

  // Auxiliary component for icons and text
  const IconWrapper = ({ icon: Icon, text, color = 'text-gray-700' }) => (
    <div className={`flex items-center mb-3 ${color}`}>
      <Icon className="mr-2 text-xl" />
      <span className="text-sm">{text}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8"
      >
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
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

        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                      status.charAt(0).toUpperCase() + status.slice(1)
                    }`}
                    color={getStatusColor(status)}
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
                  <IconWrapper
                    icon={FiPackage}
                    text={`Mampara: ${
                      reservation.mampara
                        ? `${reservation.mampara.piezas} pieza(s) - $${reservation.mampara.precio}`
                        : 'No especificada'
                    }`}
                  />
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
                      {reservation.extras.map((extra, index) => {
                        const extraInfo = extras.find(e => e.id === extra.id);
                        return (
                          <li key={index} className="flex items-center mb-2">
                            <FiCheckCircle className="text-green-600 mr-2" />
                            <span>
                              {extraInfo
                                ? `${extraInfo.nombre} (x${extra.cantidad})`
                                : 'Extra no especificado'}
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
          {/* Change Status */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Cambiar Estado de la Reserva
            </h3>
            <div className="flex space-x-2">
  <button
    onClick={() => handleStatusChange('pendiente')}
    className={`px-4 py-2 rounded ${
      status === 'pendiente'
        ? 'bg-yellow-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Pendiente
  </button>
  <button
    onClick={() => handleStatusChange('confirmada')}
    className={`px-4 py-2 rounded ${
      status === 'confirmada'
        ? 'bg-green-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Confirmada
  </button>
  <button
    onClick={() => handleStatusChange('cancelada')}
    className={`px-4 py-2 rounded ${
      status === 'cancelada'
        ? 'bg-red-500 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Cancelada
  </button>
</div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-wrap justify-end gap-4">
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
  );
};

export default ReservationModal;
