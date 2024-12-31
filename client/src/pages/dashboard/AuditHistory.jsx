import { useState, useEffect } from 'react';
import axiosInstance from '../../components/axiosConfig';
import { Card } from '../../components/ui/Card';

const AuditHistory = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState('todos');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await axiosInstance.get('/api/auditoria');
        setAuditLogs(response.data);
      } catch (error) {
        console.error('Error al cargar el historial de auditoría:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  const getOperationType = (transaction) => {
    const lowerTransaction = transaction.toLowerCase();
    if (lowerTransaction.includes('crear') || lowerTransaction.includes('creó')) return 'create';
    if (lowerTransaction.includes('actualizar') || lowerTransaction.includes('actualizó')) return 'update';
    if (lowerTransaction.includes('eliminar') || lowerTransaction.includes('eliminó')) return 'delete';
    return 'other';
  };

  const getOperationIcon = (type) => {
    switch (type) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      default:
        return '📝';
    }
  };

  const getOperationColor = (type) => {
    switch (type) {
      case 'create':
        return 'bg-green-50 border-green-200';
      case 'update':
        return 'bg-blue-50 border-blue-200';
      case 'delete':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTransaction = (transaction) => {
    // Capitalizar primera letra
    let formattedTransaction = transaction.charAt(0).toUpperCase() + transaction.slice(1);
    
    // Agregar espacios después de puntos y comas si no los hay
    formattedTransaction = formattedTransaction.replace(/([.,])/g, '$1 ');
    
    // Eliminar espacios duplicados
    formattedTransaction = formattedTransaction.replace(/\s+/g, ' ');
    
    return formattedTransaction;
  };

  const filtrarPorFecha = (logs) => {
    if (filtroFecha === 'todos') return logs;
    
    const ahora = new Date();
    const limite = new Date();
    
    switch (filtroFecha) {
      case 'hoy':
        limite.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        limite.setDate(limite.getDate() - 7);
        break;
      case 'mes':
        limite.setMonth(limite.getMonth() - 1);
        break;
      default:
        return logs;
    }
    
    return logs.filter(log => new Date(log.fecha_operacion) >= limite);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const logsFiltrados = filtrarPorFecha(auditLogs);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Auditoría</h2>
        <select
          className="px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        >
          <option value="todos">Todos los registros</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
        </select>
      </div>

      <div className="grid gap-4">
        {logsFiltrados.map((log) => {
          const operationType = getOperationType(log.transaccion);
          const operationColor = getOperationColor(operationType);
          
          return (
            <Card 
              key={log.id} 
              className={`p-4 hover:shadow-lg transition-shadow duration-200 border ${operationColor}`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">
                  {getOperationIcon(operationType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(log.fecha_operacion)}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {log.nombre_usuario}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-base">
                    {formatTransaction(log.transaccion)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {logsFiltrados.length === 0 && (
        <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
          <p className="text-xl">No hay registros de auditoría disponibles</p>
          <p className="text-sm mt-2">Prueba ajustando los filtros de fecha</p>
        </div>
      )}
    </div>
  );
};

export default AuditHistory;