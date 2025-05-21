import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiAlertTriangle, 
  FiEye, 
  FiEyeOff, 
  FiFilter, 
  FiX, 
  FiCheck, 
  FiCheckSquare, 
  FiInfo 
} from 'react-icons/fi';
import {
  getAllAlertas,
  getAlertaById,
  getAlertasPendientes,
  marcarComoLeida,
  marcarTodasComoLeidas,
  getAlertasPorTipo,
  getResumenAlertas
} from '@/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const tipoBadgeColors = {
  'stock_bajo': 'red',
  'caducidad': 'amber',
  'vencimiento_proveedor': 'purple',
  'ajuste_requerido': 'blue'
};

const tiposAlerta = [
  { id: 'stock_bajo', label: 'Bajo Stock', icon: FiAlertTriangle },
  { id: 'caducidad', label: 'Caducidad', icon: FiAlertTriangle },
  { id: 'vencimiento_proveedor', label: 'Vencimiento', icon: FiAlertTriangle },
  { id: 'ajuste_requerido', label: 'Ajuste', icon: FiAlertTriangle }
];

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [resumen, setResumen] = useState({});
  const [selectedAlerta, setSelectedAlerta] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [showLeidas, setShowLeidas] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Determinar qué endpoint usar según filtros
      let alertasData;
      if (activeFilter) {
        alertasData = await getAlertasPorTipo(activeFilter);
      } else if (!showLeidas) {
        alertasData = await getAlertasPendientes();
      } else {
        alertasData = await getAllAlertas({ leida: showLeidas ? undefined : 'false' });
      }
      
      // Obtener resumen para mostrar contadores
      const resumenData = await getResumenAlertas();
      
      setAlertas(alertasData);
      setResumen(resumenData);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      toast.error('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, showLeidas, refreshTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Obtener detalles de una alerta
  const handleViewDetails = async (alerta) => {
    try {
      setLoading(true);
      // Si la alerta no tiene todos los datos necesarios, obtenerlos
      if (!alerta.materiaPrima || !alerta.usuarioDestinatario) {
        const alertaDetalle = await getAlertaById(alerta.id);
        setSelectedAlerta(alertaDetalle);
      } else {
        setSelectedAlerta(alerta);
      }
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalles de la alerta:', error);
      toast.error('Error al obtener detalles de la alerta');
    } finally {
      setLoading(false);
    }
  };

  // Marcar alerta como leída
  const handleMarkAsRead = async (alerta, event) => {
    event.stopPropagation(); // Evitar que se abra el modal de detalles
    try {
      await marcarComoLeida(alerta.id);
      toast.success('Alerta marcada como leída');
      // Refrescar datos
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
      toast.error('Error al marcar la alerta como leída');
    }
  };

  // Marcar todas las alertas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await marcarTodasComoLeidas(activeFilter || undefined);
      toast.success('Todas las alertas han sido marcadas como leídas');
      // Refrescar datos
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error al marcar todas las alertas como leídas:', error);
      toast.error('Error al marcar todas las alertas como leídas');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular tiempo transcurrido
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    
    // Convertir a diferentes unidades de tiempo
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else {
      return 'ahora mismo';
    }
  };

  if (loading && !alertas.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Alertas del Sistema</h1>
        <Button
          className="flex items-center gap-2"
          onClick={handleMarkAllAsRead}
          disabled={alertas.filter(a => !a.leida).length === 0}
        >
          <FiCheckSquare size={18} /> Marcar Todas como Leídas
        </Button>
      </div>

      {/* Resumen y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Resumen de Alertas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiposAlerta.map(tipo => {
              const tipoStats = resumen[tipo.id] || { total: 0, leidas: 0, no_leidas: 0 };
              return (
                <div 
                  key={tipo.id} 
                  className={`p-4 rounded-lg border ${
                    activeFilter === tipo.id 
                      ? `border-${tipoBadgeColors[tipo.id]}-500 bg-${tipoBadgeColors[tipo.id]}-50` 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{tipo.label}</p>
                      <p className="text-xl font-semibold">{tipoStats.total || 0}</p>
                    </div>
                    <tipo.icon size={20} className={`text-${tipoBadgeColors[tipo.id]}-500`} />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-500">No leídas: {tipoStats.no_leidas || 0}</span>
                    <span className="text-gray-500">Leídas: {tipoStats.leidas || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Filtros por tipo */}
          {tiposAlerta.map(tipo => (
            <button
              key={tipo.id}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                activeFilter === tipo.id 
                  ? `bg-${tipoBadgeColors[tipo.id]}-100 text-${tipoBadgeColors[tipo.id]}-800 border border-${tipoBadgeColors[tipo.id]}-200` 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => setActiveFilter(activeFilter === tipo.id ? '' : tipo.id)}
            >
              <FiFilter size={16} />
              {tipo.label}
              {activeFilter === tipo.id && <FiX size={16} />}
            </button>
          ))}
          
          {/* Toggle para mostrar leídas/no leídas */}
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ml-auto ${
              showLeidas 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setShowLeidas(!showLeidas)}
          >
            {showLeidas ? <FiEye size={16} /> : <FiEyeOff size={16} />}
            {showLeidas ? 'Mostrar Todas' : 'Solo No Leídas'}
          </button>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Mensaje</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiInfo size={40} className="mb-2 text-gray-300" />
                    <p>No hay alertas {!showLeidas ? "sin leer" : ""} {activeFilter ? `de tipo ${activeFilter}` : ""}</p>
                    {(activeFilter || !showLeidas) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          setActiveFilter('');
                          setShowLeidas(true);
                        }}
                      >
                        Ver todas las alertas
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              alertas.map(alerta => (
                <TableRow 
                  key={alerta.id}
                  className={`cursor-pointer ${!alerta.leida ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                  onClick={() => handleViewDetails(alerta)}
                >
                  <TableCell>
                    <Badge color={tipoBadgeColors[alerta.tipo_alerta] || 'gray'}>
                      {tiposAlerta.find(t => t.id === alerta.tipo_alerta)?.label || alerta.tipo_alerta}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {alerta.mensaje}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(alerta.fecha_alerta)}</span>
                      <span className="text-xs text-gray-500">{getTimeAgo(alerta.fecha_alerta)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alerta.leida ? (
                      <Badge color="green">Leída</Badge>
                    ) : (
                      <Badge color="blue">Sin leer</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleViewDetails(alerta)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Ver detalles"
                      >
                        <FiInfo size={18} />
                      </button>
                      {!alerta.leida && (
                        <button
                          onClick={(e) => handleMarkAsRead(alerta, e)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Marcar como leída"
                        >
                          <FiCheck size={18} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalles */}
      {selectedAlerta && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detalles de la Alerta"
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-start">
              <Badge 
                color={tipoBadgeColors[selectedAlerta.tipo_alerta] || 'gray'}
                className="text-sm px-3 py-1"
              >
                {tiposAlerta.find(t => t.id === selectedAlerta.tipo_alerta)?.label || selectedAlerta.tipo_alerta}
              </Badge>
              
              <div>
                {selectedAlerta.leida ? (
                  <span className="flex items-center text-sm text-green-600">
                    <FiCheck size={16} className="mr-1" /> 
                    Leída {selectedAlerta.fecha_lectura ? `el ${formatDate(selectedAlerta.fecha_lectura)}` : ''}
                  </span>
                ) : (
                  <span className="flex items-center text-sm text-blue-600">
                    <FiEye size={16} className="mr-1" /> Sin leer
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-1">Mensaje</h3>
              <p className="text-gray-700">{selectedAlerta.mensaje}</p>
            </div>
            
            {selectedAlerta.materiaPrima && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-1">Materia Prima Relacionada</h3>
                <p className="text-gray-700">{selectedAlerta.materiaPrima.nombre}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Fecha de Alerta</h3>
                <p className="text-gray-700">{formatDate(selectedAlerta.fecha_alerta)}</p>
                <p className="text-sm text-gray-500">{getTimeAgo(selectedAlerta.fecha_alerta)}</p>
              </div>
              
              {selectedAlerta.usuarioDestinatario && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">Destinatario</h3>
                  <p className="text-gray-700">{selectedAlerta.usuarioDestinatario.nombre}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-2 mt-4">
              {!selectedAlerta.leida && (
                <Button
                  onClick={async () => {
                    await handleMarkAsRead(selectedAlerta, { stopPropagation: () => {} });
                    setIsDetailModalOpen(false);
                  }}
                >
                  Marcar como Leída
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Alertas;