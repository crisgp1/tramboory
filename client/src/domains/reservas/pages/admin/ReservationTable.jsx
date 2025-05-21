import React, { useState, useCallback, useMemo } from 'react';
import { FiEdit2, FiEye, FiTrash2, FiSearch, FiFilter, FiX, FiDollarSign } from 'react-icons/fi';
// Importación con ruta relativa desde src/
import PaymentModal from '@shared/pages/admin/dashboard/payment-service/PaymentModal';
import { formatDate, formatTime } from '@shared/utils/formatters';
import axiosInstance from '@shared/utils/axiosConfig';
import { toast } from 'react-hot-toast';

const ReservationTable = ({
  reservations,
  reservationSearch,
  setReservationSearch,
  handleViewReservation,
  handleEditItem,
  handleDeleteItem,
  selectedMonth,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    paquete: '',
    opcion_alimento: '',
    tematica: '',
    hora: ''
  });

  const uniqueValues = useMemo(() => ({
    estados: [...new Set(reservations.map(r => r.estado))],
    paquetes: [...new Set(reservations.map(r => r.paquete?.nombre).filter(Boolean))],
    opcionesAlimento: [...new Set(reservations.map(r => r.opcionAlimento?.nombre).filter(Boolean))],
    tematicas: [...new Set(reservations.map(r => r.tematicaReserva?.nombre).filter(Boolean))],
    horas: [...new Set(reservations.map(r => r.hora_inicio))]
  }), [reservations]);

  const calculateTotalPaid = (pagos) => {
    if (!pagos || !Array.isArray(pagos)) return 0;
    return pagos
      .filter(p => p.estado === 'completado')
      .reduce((sum, p) => sum + (p.monto || 0), 0);
  };

  const getPaymentStatus = (reservation) => {
    if (!reservation.pagos) return { status: 'pendiente', style: 'bg-yellow-100 text-yellow-800' };
    
    const totalPaid = calculateTotalPaid(reservation.pagos);
    
    if (totalPaid >= reservation.total) {
      return { status: 'Pagado', style: 'bg-green-100 text-green-800' };
    } else if (totalPaid > 0) {
      return { status: 'Pago Parcial', style: 'bg-blue-100 text-blue-800' };
    }
    return { status: 'Pendiente', style: 'bg-yellow-100 text-yellow-800' };
  };

  const renderStatus = (estado) => {
    const statusStyles = {
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      pendiente: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusStyles[estado] || statusStyles.pendiente
        }`}
      >
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      estado: '',
      fecha_inicio: '',
      fecha_fin: '',
      paquete: '',
      opcion_alimento: '',
      tematica: '',
      hora: ''
    });
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const searchTerm = reservationSearch.toLowerCase();
      const matchesSearch = 
        reservation.id.toString().includes(searchTerm) ||
        reservation.usuario?.nombre?.toLowerCase().includes(searchTerm) ||
        reservation.paquete?.nombre?.toLowerCase().includes(searchTerm);

      const matchesEstado = !filters.estado || reservation.estado === filters.estado;
      const matchesPaquete = !filters.paquete || reservation.paquete?.nombre === filters.paquete;
      const matchesOpcionAlimento = !filters.opcion_alimento || 
        reservation.opcionAlimento?.nombre === filters.opcion_alimento;
      const matchesTematica = !filters.tematica || 
        reservation.tematicaReserva?.nombre === filters.tematica;
      const matchesHora = !filters.hora || reservation.hora_inicio === filters.hora;

      const reservationDate = new Date(reservation.fecha_reserva);
      const matchesFechaInicio = !filters.fecha_inicio || 
        reservationDate >= new Date(filters.fecha_inicio);
      const matchesFechaFin = !filters.fecha_fin || 
        reservationDate <= new Date(filters.fecha_fin);

      const matchesMonth = reservationDate.getMonth() === selectedMonth;

      return matchesSearch && matchesEstado && matchesPaquete && 
             matchesOpcionAlimento && matchesTematica && matchesHora && 
             matchesFechaInicio && matchesFechaFin && matchesMonth;
    });
  }, [reservations, reservationSearch, filters, selectedMonth]);

  const renderWithFallback = (value, fallback = 'No especificado') => {
    return value || fallback;
  };

  const renderMampara = (mampara) => {
    if (!mampara) return 'No especificada';
    return `${mampara.piezas} pieza(s) - $${mampara.precio}`;
  };

  const FilterPanel = () => (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todos</option>
            {uniqueValues.estados.map(estado => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.fecha_inicio}
            onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={filters.fecha_fin}
            onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paquete
          </label>
          <select
            value={filters.paquete}
            onChange={(e) => handleFilterChange('paquete', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todos</option>
            {uniqueValues.paquetes.map(paquete => (
              <option key={paquete} value={paquete}>{paquete}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opción de Alimento
          </label>
          <select
            value={filters.opcion_alimento}
            onChange={(e) => handleFilterChange('opcion_alimento', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todas</option>
            {uniqueValues.opcionesAlimento.map(opcion => (
              <option key={opcion} value={opcion}>{opcion}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temática
          </label>
          <select
            value={filters.tematica}
            onChange={(e) => handleFilterChange('tematica', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todas</option>
            {uniqueValues.tematicas.map(tematica => (
              <option key={tematica} value={tematica}>{tematica}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora
          </label>
          <select
            value={filters.hora}
            onChange={(e) => handleFilterChange('hora', e.target.value)}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Todas</option>
            {uniqueValues.horas.map(hora => (
              <option key={hora} value={hora}>{hora}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Limpiar Filtros
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiX className="mr-2" />
          Cerrar Filtros
        </button>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar reserva..."
              value={reservationSearch}
              onChange={(e) => setReservationSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiFilter className="h-5 w-5 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nº Reserva
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paquete
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opción Alimento
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temática
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mampara
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map((reservation) => {
              const paymentStatus = getPaymentStatus(reservation);
              const totalPaid = calculateTotalPaid(reservation.pagos);
              return (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderWithFallback(reservation.usuario?.nombre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(reservation.fecha_reserva)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(reservation.hora_inicio)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderWithFallback(reservation.paquete?.nombre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderWithFallback(reservation.opcionAlimento?.nombre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderWithFallback(reservation.tematicaReserva?.nombre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {renderMampara(reservation.mampara)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {renderStatus(reservation.estado)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewReservation(reservation)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditItem(reservation)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        title="Editar reserva"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(reservation.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Eliminar reserva"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      {totalPaid < reservation.total && (
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowPaymentModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          title="Procesar pago"
                        >
                          <FiDollarSign className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredReservations.length === 0 && (
        <div className="text-center py-8 bg-white">
          <p className="text-gray-500 text-sm">No se encontraron reservaciones para el mes seleccionado</p>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedReservation && (
        <PaymentModal
          reservationData={selectedReservation}
          onCancel={() => {
            setShowPaymentModal(false);
            setSelectedReservation(null);
          }}
          onConfirm={async (paymentData) => {
            try {
              const response = await axiosInstance.post('/api/pagos', {
                ...paymentData,
                id_reserva: selectedReservation.id
              });

              if (response.data) {
                toast.success('Pago registrado exitosamente');
                setShowPaymentModal(false);
                setSelectedReservation(null);
              }
              return response;
            } catch (error) {
              console.error('Error al crear el pago:', error);
              toast.error('Error al registrar el pago');
            }
          }}
        />
      )}
    </div>
  );
};

export default ReservationTable;
