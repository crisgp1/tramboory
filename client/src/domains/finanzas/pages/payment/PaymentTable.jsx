import React from 'react';
import { FiEye, FiEdit2 } from 'react-icons/fi';

const PaymentTable = ({
  payments = [],
  reservations = [],
  onViewPayment,
  onEditPayment
}) => {
  // Determina la clase de estilos según el estado del pago
  const getEstadoBadgeClass = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatea un número o string como moneda MXN
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount);
  };

  // Formatea la fecha en formato español (día, mes, año)
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Obtiene la información de la reserva según el ID
  const getReservationInfo = (reservationId) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    return reservation
      ? `#${reservation.id} - ${reservation.nombre_festejado || 'Sin nombre'}`
      : `Reserva #${reservationId}`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reserva
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de pago
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha creación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha actualización
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {/* ID */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {payment.id}
              </td>
              {/* Reserva */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getReservationInfo(payment.id_reserva)}
              </td>
              {/* Monto */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(payment.monto)}
              </td>
              {/* Fecha de pago */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(payment.fecha_pago)}
              </td>
              {/* Estado */}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(
                    payment.estado
                  )}`}
                >
                  {payment.estado}
                </span>
              </td>
              {/* Fecha creación */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(payment.fecha_creacion)}
              </td>
              {/* Fecha actualización */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(payment.fecha_actualizacion)}
              </td>
              {/* Acciones */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* Botón "Ver" */}
                {onViewPayment && (
                  <button
                    onClick={() => onViewPayment(payment)}
                    className="inline-flex items-center px-3 py-1 mr-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <FiEye className="mr-1.5 h-4 w-4" />
                    Ver
                  </button>
                )}
                {/* Botón "Editar" (si se proporcionó la prop onEditPayment) */}
                {onEditPayment && (
                  <button
                    onClick={() => onEditPayment(payment)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <FiEdit2 className="mr-1.5 h-4 w-4" />
                    Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                No se encontraron pagos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
