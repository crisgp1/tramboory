import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiBox, 
  FiFilter, 
  FiX, 
  FiInfo,
  FiCalendar,
  FiPackage,
  FiAlertCircle,
  FiDollarSign
} from 'react-icons/fi';
import {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotsByMateriaPrima,
  getAllItems
} from '@domains/inventario/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@shared/components/Table';
import { Button } from '@shared/components/Button';
import Modal from '@shared/components/Modal';
import { Badge } from '@shared/components/Badge';

const Lotes = () => {
  const [lotes, setLotes] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [selectedLote, setSelectedLote] = useState(null);
  const [selectedMateriaPrima, setSelectedMateriaPrima] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    porCaducar: false,
    sinExistencias: false
  });
  const [formData, setFormData] = useState({
    id_materia_prima: '',
    codigo_lote: '',
    fecha_produccion: '',
    fecha_caducidad: '',
    cantidad_inicial: '',
    costo_unitario: ''
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lotesData, itemsData] = await Promise.all([
        getAllLots(),
        getAllItems()
      ]);
      
      setLotes(lotesData);
      setMateriasPrimas(itemsData);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
      toast.error('Error al cargar los lotes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar lotes de una materia prima específica
  const fetchLotesByMateriaPrima = useCallback(async (idMateriaPrima, incluirSinStock = false) => {
    setLoading(true);
    try {
      const lotesData = await getLotsByMateriaPrima(idMateriaPrima, { incluir_sin_stock: incluirSinStock });
      setLotes(lotesData);
      
      // Establecer la materia prima seleccionada
      const materiaPrima = materiasPrimas.find(mp => mp.id === idMateriaPrima);
      setSelectedMateriaPrima(materiaPrima);
    } catch (error) {
      console.error('Error al cargar lotes por materia prima:', error);
      toast.error('Error al cargar los lotes por materia prima');
    } finally {
      setLoading(false);
    }
  }, [materiasPrimas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar lotes
  const filteredLotes = lotes
    .filter(lote => {
      // Filtro de búsqueda
      if (searchTerm && 
          !lote.codigo_lote.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !lote.materiaPrima?.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por caducidad próxima
      if (filters.porCaducar && lote.fecha_caducidad) {
        const fechaCaducidad = new Date(lote.fecha_caducidad);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaCaducidad - hoy) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes > 7) {
          return false;
        }
      }
      
      // Filtro por sin existencias
      if (filters.sinExistencias && parseFloat(lote.cantidad_actual) > 0) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Ordenar por fecha de caducidad ascendente (primero los que caducan antes)
      if (a.fecha_caducidad && b.fecha_caducidad) {
        return new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad);
      }
      
      // Si alguno no tiene fecha de caducidad, ordenar por código de lote
      return a.codigo_lote.localeCompare(b.codigo_lote);
    });

  // Manejadores de eventos para el formulario
  const handleOpenModal = (lote = null) => {
    if (lote) {
      setSelectedLote(lote);
      setFormData({
        id_materia_prima: lote.id_materia_prima,
        codigo_lote: lote.codigo_lote,
        fecha_produccion: lote.fecha_produccion ? new Date(lote.fecha_produccion).toISOString().split('T')[0] : '',
        fecha_caducidad: lote.fecha_caducidad ? new Date(lote.fecha_caducidad).toISOString().split('T')[0] : '',
        cantidad_inicial: lote.cantidad_inicial,
        costo_unitario: lote.costo_unitario
      });
    } else {
      setSelectedLote(null);
      setFormData({
        id_materia_prima: selectedMateriaPrima?.id || '',
        codigo_lote: '',
        fecha_produccion: '',
        fecha_caducidad: '',
        cantidad_inicial: '',
        costo_unitario: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir valores a números donde sea necesario
      const loteData = {
        ...formData,
        id_materia_prima: Number(formData.id_materia_prima),
        cantidad_inicial: Number(formData.cantidad_inicial),
        costo_unitario: Number(formData.costo_unitario),
      };

      if (selectedLote) {
        await updateLot(selectedLote.id, loteData);
        toast.success('Lote actualizado correctamente');
      } else {
        await createLot(loteData);
        toast.success('Lote creado correctamente');
      }
      
      setIsModalOpen(false);
      // Si hay una materia prima seleccionada, recargar solo sus lotes
      if (selectedMateriaPrima) {
        fetchLotesByMateriaPrima(selectedMateriaPrima.id, true);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Error al guardar lote:', error);
      toast.error(error.response?.data?.error || 'Error al guardar el lote');
    }
  };

  const handleViewDetails = async (lote) => {
    try {
      setLoading(true);
      const loteDetalle = await getLotById(lote.id);
      setSelectedLote(loteDetalle);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalles del lote:', error);
      toast.error('Error al obtener detalles del lote');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (lote) => {
    setSelectedLote(lote);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteLot(selectedLote.id);
      toast.success('Lote eliminado correctamente');
      setIsDeleteModalOpen(false);
      
      if (selectedMateriaPrima) {
        fetchLotesByMateriaPrima(selectedMateriaPrima.id, true);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Error al eliminar lote:', error);
      
      // Manejar error cuando el lote tiene existencias
      if (error.response?.status === 409) {
        toast.error('No se puede eliminar un lote que aún tiene existencias');
      } else {
        toast.error(error.response?.data?.error || 'Error al eliminar el lote');
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Calcular estado de caducidad
  const getCaducidadStatus = (fechaCaducidad) => {
    if (!fechaCaducidad) return { status: 'notSet', label: 'No establecida', color: 'gray' };
    
    const hoy = new Date();
    const fecha = new Date(fechaCaducidad);
    const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { status: 'expired', label: 'Caducado', color: 'red' };
    } else if (diasRestantes <= 7) {
      return { status: 'warning', label: `${diasRestantes} días`, color: 'amber' };
    } else if (diasRestantes <= 30) {
      return { status: 'soon', label: `${diasRestantes} días`, color: 'yellow' };
    } else {
      return { status: 'ok', label: formatDate(fechaCaducidad), color: 'green' };
    }
  };

  // Limpiar filtro de materia prima
  const clearMateriaFilter = () => {
    setSelectedMateriaPrima(null);
    fetchData();
  };

  if (loading && !lotes.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedMateriaPrima 
              ? `Lotes de ${selectedMateriaPrima.nombre}`
              : 'Lotes'
            }
          </h1>
          {selectedMateriaPrima && (
            <button 
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-1"
              onClick={clearMateriaFilter}
            >
              <FiX className="mr-1" /> Quitar filtro
            </button>
          )}
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <FiPlus size={18} /> Agregar Lote
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Buscar por código o materia prima..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              filters.porCaducar 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, porCaducar: !prev.porCaducar }))}
          >
            <FiFilter size={16} />
            Por Caducar (7 días)
            {filters.porCaducar && <FiX size={16} className="ml-1" />}
          </button>
          
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              filters.sinExistencias 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, sinExistencias: !prev.sinExistencias }))}
          >
            <FiFilter size={16} />
            Sin Existencias
            {filters.sinExistencias && <FiX size={16} className="ml-1" />}
          </button>
        </div>
      </div>

      {/* Tabla de lotes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Materia Prima</TableHead>
              <TableHead>Fecha Producción</TableHead>
              <TableHead>Fecha Caducidad</TableHead>
              <TableHead>Cantidad Inicial</TableHead>
              <TableHead>Existencias</TableHead>
              <TableHead>Costo Unitario</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiBox size={40} className="mb-2 text-gray-300" />
                    <p>
                      {selectedMateriaPrima
                        ? `No se encontraron lotes para ${selectedMateriaPrima.nombre}`
                        : 'No se encontraron lotes'
                      }
                    </p>
                    {(searchTerm || filters.porCaducar || filters.sinExistencias) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          setSearchTerm('');
                          setFilters({ porCaducar: false, sinExistencias: false });
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLotes.map(lote => {
                const caducidadStatus = getCaducidadStatus(lote.fecha_caducidad);
                return (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.codigo_lote}</TableCell>
                    <TableCell>
                      <button 
                        className="text-indigo-600 hover:underline"
                        onClick={() => fetchLotesByMateriaPrima(lote.id_materia_prima, true)}
                      >
                        {lote.materiaPrima?.nombre || 'N/A'}
                      </button>
                    </TableCell>
                    <TableCell>{formatDate(lote.fecha_produccion)}</TableCell>
                    <TableCell>
                      <Badge color={caducidadStatus.color}>
                        {caducidadStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{lote.cantidad_inicial}</TableCell>
                    <TableCell>
                      <span className={parseFloat(lote.cantidad_actual) === 0 ? 'text-red-500 font-medium' : ''}>
                        {lote.cantidad_actual}
                        {parseFloat(lote.cantidad_actual) === 0 && ' (Agotado)'}
                      </span>
                    </TableCell>
                    <TableCell>${parseFloat(lote.costo_unitario).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(lote)}
                          className="p-1 text-indigo-600 hover:text-indigo-800"
                          title="Ver detalles"
                        >
                          <FiInfo size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(lote)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(lote)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                          disabled={parseFloat(lote.cantidad_actual) > 0}
                        >
                          <FiTrash2 size={18} className={parseFloat(lote.cantidad_actual) > 0 ? 'opacity-40 cursor-not-allowed' : ''} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de creación/edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLote ? `Editar Lote: ${selectedLote.codigo_lote}` : 'Nuevo Lote'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia Prima <span className="text-red-500">*</span>
              </label>
              <select
                name="id_materia_prima"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.id_materia_prima}
                onChange={handleChange}
                disabled={selectedLote !== null}
              >
                <option value="">Seleccionar materia prima</option>
                {materiasPrimas.map(mp => (
                  <option key={mp.id} value={mp.id}>
                    {mp.nombre}
                  </option>
                ))}
              </select>
              {selectedLote && (
                <p className="mt-1 text-xs text-amber-500">
                  <FiAlertCircle className="inline mr-1" />
                  La materia prima no se puede cambiar una vez creado el lote
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de Lote <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo_lote"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.codigo_lote}
                onChange={handleChange}
                placeholder="Ej: L20250326-001"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Producción
                </label>
                <input
                  type="date"
                  name="fecha_produccion"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.fecha_produccion}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Caducidad
                </label>
                <input
                  type="date"
                  name="fecha_caducidad"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.fecha_caducidad}
                  onChange={handleChange}
                  min={formData.fecha_produccion || undefined}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Inicial <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad_inicial"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.cantidad_inicial}
                  onChange={handleChange}
                  disabled={selectedLote !== null}
                />
                {selectedLote && (
                  <p className="mt-1 text-xs text-amber-500">
                    <FiAlertCircle className="inline mr-1" />
                    La cantidad inicial no se puede modificar una vez creado el lote
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Unitario <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="costo_unitario"
                    min="0"
                    step="0.01"
                    required
                    className="pl-7 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.costo_unitario}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit">
              {selectedLote ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Lote: ${selectedLote?.codigo_lote}`}
        maxWidth="md"
      >
        {selectedLote && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del lote */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiBox className="mr-2" /> Información del Lote
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Código</p>
                      <p className="font-medium">{selectedLote.codigo_lote}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Materia Prima</p>
                      <p className="font-medium">{selectedLote.materiaPrima?.nombre}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Cantidad Inicial</p>
                        <p>{selectedLote.cantidad_inicial}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Cantidad Actual</p>
                        <p className={parseFloat(selectedLote.cantidad_actual) === 0 ? 'text-red-500 font-medium' : ''}>
                          {selectedLote.cantidad_actual}
                          {parseFloat(selectedLote.cantidad_actual) === 0 && ' (Agotado)'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Costo Unitario</p>
                      <p>${parseFloat(selectedLote.costo_unitario).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Fechas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiCalendar className="mr-2" /> Fechas
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {selectedLote.fecha_produccion && (
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Producción</p>
                        <p>{formatDate(selectedLote.fecha_produccion)}</p>
                      </div>
                    )}
                    
                    {selectedLote.fecha_caducidad && (
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Caducidad</p>
                        <div className="flex items-center">
                          <Badge color={getCaducidadStatus(selectedLote.fecha_caducidad).color} className="mr-2">
                            {getCaducidadStatus(selectedLote.fecha_caducidad).label}
                          </Badge>
                          <span>{formatDate(selectedLote.fecha_caducidad)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Movimientos recientes */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                  <FiPackage className="mr-2" /> Movimientos Recientes
                </h3>
                
                {selectedLote.movimientos && selectedLote.movimientos.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="divide-y divide-gray-200">
                      {selectedLote.movimientos.map(movimiento => (
                        <li key={movimiento.id} className="py-3">
                          <div className="flex justify-between">
                            <div>
                              <Badge 
                                color={movimiento.tipo_movimiento === 'entrada' ? 'green' : 'red'}
                                className="mb-1"
                              >
                                {movimiento.tipo_movimiento === 'entrada' ? 'Entrada' : 'Salida'}
                              </Badge>
                              <p className="text-sm">{movimiento.descripcion}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{movimiento.cantidad} {selectedLote.materiaPrima?.unidadMedida?.abreviatura}</p>
                              <p className="text-xs text-gray-500">{new Date(movimiento.fecha).toLocaleString()}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No hay movimientos recientes para este lote
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              {parseFloat(selectedLote.cantidad_actual) === 0 && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenDeleteModal(selectedLote);
                  }}
                >
                  Eliminar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenModal(selectedLote);
                }}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        maxWidth="sm"
      >
        <div className="py-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar el lote <span className="font-semibold">{selectedLote?.codigo_lote}</span>?
          </p>
          {parseFloat(selectedLote?.cantidad_actual) > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <p className="flex items-center font-medium">
                <FiAlertCircle className="mr-2" /> Este lote no puede ser eliminado
              </p>
              <p className="text-sm mt-1">
                El lote aún tiene {selectedLote?.cantidad_actual} unidades en existencia.
                Debe consumir todo el stock antes de poder eliminarlo.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={parseFloat(selectedLote?.cantidad_actual) > 0}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Lotes;