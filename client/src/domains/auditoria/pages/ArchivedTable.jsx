import React, { useState, useCallback, useMemo } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
// Usar el alias @ para garantizar resolución correcta en Docker
import { formatDate } from '@shared/utils/formatters';
import axiosInstance from '@shared/utils/axiosConfig';
import { toast } from 'react-toastify';

const ArchivedTable = ({
  items,
  itemSearch,
  setItemSearch,
  fetchData,
  selectedMonth,
  type
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
  });

  const handleReactivate = async (id) => {
    try {
      await axiosInstance.put(`/api/${type}/${id}/reactivate`);
      toast.success('Elemento reactivado con éxito');
      fetchData();
    } catch (error) {
      console.error('Error al reactivar el elemento:', error);
      toast.error('Error al reactivar el elemento');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchTerm = itemSearch.toLowerCase();
      const matchesSearch = 
        item.id.toString().includes(searchTerm) ||
        (item.nombre_festejado && item.nombre_festejado.toLowerCase().includes(searchTerm)) ||
        (item.usuario?.nombre && item.usuario.nombre.toLowerCase().includes(searchTerm));

      const itemDate = new Date(item.fecha_reserva || item.fecha || item.fecha_creacion);
      const matchesFechaInicio = !filters.fecha_inicio || 
        itemDate >= new Date(filters.fecha_inicio);
      const matchesFechaFin = !filters.fecha_fin || 
        itemDate <= new Date(filters.fecha_fin);

      const matchesMonth = itemDate.getMonth() === selectedMonth;

      return matchesSearch && matchesFechaInicio && matchesFechaFin && matchesMonth;
    });
  }, [items, itemSearch, filters, selectedMonth]);

  const renderStatus = (estado) => {
    const statusStyles = {
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      fallido: 'bg-red-100 text-red-800',
      completado: 'bg-green-100 text-green-800'
    };

    // Handle undefined estado
    if (!estado) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          No definido
        </span>
      );
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusStyles[estado] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const renderWithFallback = (value, fallback = 'No especificado') => {
    return value || fallback;
  };

  const FilterPanel = () => (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filters.fecha_inicio}
            onChange={(e) => setFilters(prev => ({...prev, fecha_inicio: e.target.value}))}
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
            onChange={(e) => setFilters(prev => ({...prev, fecha_fin: e.target.value}))}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
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
              placeholder="Buscar elemento archivado..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={`${type}-${item.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.fecha_reserva || item.fecha || item.fecha_creacion)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {renderStatus(item.estado)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {type === 'reservas' ? (
                    <>
                      <div>Cliente: {renderWithFallback(item.usuario?.nombre)}</div>
                      <div>Festejado: {renderWithFallback(item.nombre_festejado)}</div>
                    </>
                  ) : type === 'pagos' ? (
                    <>
                      <div>Monto: ${item.monto}</div>
                      <div>Método: {renderWithFallback(item.metodo_pago)}</div>
                    </>
                  ) : (
                    <>
                      <div>Tipo: {renderWithFallback(item.tipo)}</div>
                      <div>Monto: ${item.monto}</div>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleReactivate(item.id)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 flex items-center"
                    title="Reactivar elemento"
                  >
                    <FiRefreshCw className="h-5 w-5 mr-1" />
                    Reactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 bg-white">
          <p className="text-gray-500 text-sm">No se encontraron elementos archivados</p>
        </div>
      )}
    </div>
  );
};

export default ArchivedTable;