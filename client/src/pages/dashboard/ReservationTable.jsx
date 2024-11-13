import React, { useState, useCallback } from 'react';
import { FiEdit2, FiEye, FiTrash2, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { formatDate } from '../../utils/formatters';

const ReservationTable = ({
  reservations,
  reservationSearch,
  setReservationSearch,
  handleViewReservation,
  handleEditItem,
  handleDeleteItem,
}) => {
  // Estados para el filtrado
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

  // Obtener valores únicos para los filtros
  const uniqueValues = {
    estados: [...new Set(reservations.map(r => r.estado))],
    paquetes: [...new Set(reservations.map(r => r.paquete?.nombre).filter(Boolean))],
    opcionesAlimento: [...new Set(reservations.map(r => r.opcionAlimento?.nombre).filter(Boolean))],
    tematicas: [...new Set(reservations.map(r => r.tematicaReserva?.nombre).filter(Boolean))],
    horas: [...new Set(reservations.map(r => r.hora_inicio))]
  };

  // Función para renderizar el estado con el estilo correcto
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

  // Función para manejar cambios en los filtros
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Función para limpiar todos los filtros
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

  // Función para filtrar las reservaciones
  const filteredReservations = reservations.filter(reservation => {
    // Filtro por búsqueda
    const searchTerm = reservationSearch.toLowerCase();
    const matchesSearch = 
      reservation.id.toString().includes(searchTerm) ||
      reservation.usuario?.nombre?.toLowerCase().includes(searchTerm) ||
      reservation.paquete?.nombre?.toLowerCase().includes(searchTerm);

    // Filtros adicionales
    const matchesEstado = !filters.estado || reservation.estado === filters.estado;
    const matchesPaquete = !filters.paquete || reservation.paquete?.nombre === filters.paquete;
    const matchesOpcionAlimento = !filters.opcion_alimento || 
      reservation.opcionAlimento?.nombre === filters.opcion_alimento;
    const matchesTematica = !filters.tematica || 
      reservation.tematicaReserva?.nombre === filters.tematica;
    const matchesHora = !filters.hora || reservation.hora_inicio === filters.hora;

    // Filtro de fechas
    const reservationDate = new Date(reservation.fecha_reserva);
    const matchesFechaInicio = !filters.fecha_inicio || 
      reservationDate >= new Date(filters.fecha_inicio);
    const matchesFechaFin = !filters.fecha_fin || 
      reservationDate <= new Date(filters.fecha_fin);

    return matchesSearch && matchesEstado && matchesPaquete && 
           matchesOpcionAlimento && matchesTematica && matchesHora && 
           matchesFechaInicio && matchesFechaFin;
  });

  // Función para renderizar el valor con fallback
  const renderWithFallback = (value, fallback = 'No especificado') => {
    return value || fallback;
  };

  // Panel de filtros
  const FilterPanel = () => (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Filtro por Estado */}
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

        {/* Filtro por Fechas */}
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

        {/* Filtro por Paquete */}
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

        {/* Filtro por Opción de Alimento */}
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

        {/* Filtro por Temática */}
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

        {/* Filtro por Hora */}
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

      {/* Botones de acción */}
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
  );return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      {/* Barra de búsqueda */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
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

      {/* Panel de Filtros */}
      {showFilters && <FilterPanel />}

      {/* Tabla */}
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
            {filteredReservations.map((reservation) => (
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
                  {reservation.hora_inicio}
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
                  {renderWithFallback(reservation.mampara?.nombre)}
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-8 bg-white">
          <p className="text-gray-500 text-sm">No se encontraron reservaciones</p>
        </div>
      )}
    </div>
  );
};

export default ReservationTable;