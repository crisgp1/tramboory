import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiInfo, 
  FiArrowUp, 
  FiArrowDown, 
  FiBox, 
  FiCalendar,
  FiPackage,
  FiTruck,
  FiSettings
} from 'react-icons/fi';
import {
  getAllMovements,
  getMovementById,
  createMovement,
  getAllItems,
  getAllLots,
  getAllProviders,
  getAllAdjustmentTypes,
  getMovimientosByMateriaPrima,
  getMovimientosByLote
} from '@/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tiposAjuste, setTiposAjuste] = useState([]);
  const [lotesFiltrados, setLotesFiltrados] = useState([]);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipoMovimiento: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [formData, setFormData] = useState({
    id_materia_prima: '',
    id_lote: '',
    id_proveedor: '',
    id_tipo_ajuste: '',
    tipo_movimiento: 'entrada',
    cantidad: '',
    descripcion: ''
  });
  const [filtroActivo, setFiltroActivo] = useState({
    tipo: '', // 'materiaPrima' o 'lote'
    id: null
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Determinar qué endpoint usar según filtros activos
      let movimientosData;
      
      if (filtroActivo.tipo === 'materiaPrima' && filtroActivo.id) {
        movimientosData = await getMovimientosByMateriaPrima(filtroActivo.id);
      } else if (filtroActivo.tipo === 'lote' && filtroActivo.id) {
        movimientosData = await getMovimientosByLote(filtroActivo.id);
      } else {
        // Construir parámetros de consulta para filtros
        const params = {};
        if (filters.tipoMovimiento) params.tipo = filters.tipoMovimiento;
        if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio;
        if (filters.fechaFin) params.fechaFin = filters.fechaFin;
        
        movimientosData = await getAllMovements(params);
      }
      
      // Cargar datos auxiliares
      const [itemsData, lotesData, proveedoresData, tiposAjusteData] = await Promise.all([
        getAllItems(),
        getAllLots(),
        getAllProviders(),
        getAllAdjustmentTypes()
      ]);
      
      setMovimientos(movimientosData);
      setMateriasPrimas(itemsData);
      setLotes(lotesData);
      setProveedores(proveedoresData);
      setTiposAjuste(tiposAjusteData);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      toast.error('Error al cargar los movimientos de inventario');
    } finally {
      setLoading(false);
    }
  }, [filtroActivo, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar movimientos
  const filteredMovimientos = movimientos
    .filter(movimiento => {
      // Filtro de búsqueda en descripción o materia prima
      if (searchTerm && 
          !movimiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !movimiento.materiaPrima?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha descendente

  // Manejadores de eventos para el formulario
  const handleOpenModal = () => {
    setSelectedMovimiento(null);
    setFormData({
      id_materia_prima: '',
      id_lote: '',
      id_proveedor: '',
      id_tipo_ajuste: '',
      tipo_movimiento: 'entrada',
      cantidad: '',
      descripcion: ''
    });
    setLotesFiltrados([]);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambió la materia prima, filtrar los lotes disponibles
    if (name === 'id_materia_prima' && value) {
      const lotesDeLaMateria = lotes.filter(
        lote => lote.id_materia_prima === Number(value)
      );
      setLotesFiltrados(lotesDeLaMateria);
      
      // Resetear el lote seleccionado
      setFormData(prev => ({
        ...prev,
        id_lote: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir valores a números donde sea necesario
      const movimientoData = {
        ...formData,
        id_materia_prima: Number(formData.id_materia_prima),
        id_lote: formData.id_lote ? Number(formData.id_lote) : null,
        id_proveedor: formData.id_proveedor ? Number(formData.id_proveedor) : null,
        id_tipo_ajuste: formData.id_tipo_ajuste ? Number(formData.id_tipo_ajuste) : null,
        cantidad: Number(formData.cantidad)
      };

      await createMovement(movimientoData);
      toast.success('Movimiento registrado correctamente');
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      
      // Manejar errores específicos
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.status === 400 && error.response?.data?.details) {
        toast.error(`Error: ${error.response.data.details}`);
      } else {
        toast.error('Error al registrar el movimiento');
      }
    }
  };

  const handleViewDetails = async (movimiento) => {
    try {
      setLoading(true);
      const movimientoDetalle = await getMovementById(movimiento.id);
      setSelectedMovimiento(movimientoDetalle);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalles del movimiento:', error);
      toast.error('Error al obtener detalles del movimiento');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    fetchData();
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setFilters({
      tipoMovimiento: '',
      fechaInicio: '',
      fechaFin: ''
    });
    setSearchTerm('');
    setFiltroActivo({
      tipo: '',
      id: null
    });
    fetchData();
  };

  // Filtrar por materia prima
  const handleFilterByMateriaPrima = (idMateriaPrima) => {
    setFiltroActivo({
      tipo: 'materiaPrima',
      id: idMateriaPrima
    });
  };

  // Filtrar por lote
  const handleFilterByLote = (idLote) => {
    setFiltroActivo({
      tipo: 'lote',
      id: idLote
    });
  };

  // Obtener nombre de la materia prima o lote activo
  const getFilterLabel = () => {
    if (filtroActivo.tipo === 'materiaPrima') {
      const materiaPrima = materiasPrimas.find(mp => mp.id === filtroActivo.id);
      return materiaPrima ? `Movimientos de ${materiaPrima.nombre}` : 'Movimientos';
    } else if (filtroActivo.tipo === 'lote') {
      const lote = lotes.find(l => l.id === filtroActivo.id);
      return lote ? `Movimientos del Lote ${lote.codigo_lote}` : 'Movimientos';
    }
    return 'Movimientos de Inventario';
  };

  if (loading && !movimientos.length) {
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
            {getFilterLabel()}
          </h1>
          {filtroActivo.tipo && (
            <button 
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-1"
              onClick={handleResetFilters}
            >
              <FiX className="mr-1" /> Quitar filtro
            </button>
          )}
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={handleOpenModal}
        >
          <FiPlus size={18} /> Registrar Movimiento
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar en descripción o materia prima..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="py-2 px-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.tipoMovimiento}
            onChange={e => setFilters(prev => ({ ...prev, tipoMovimiento: e.target.value }))}
          >
            <option value="">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              className="py-2 px-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.fechaInicio}
              onChange={e => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              className="py-2 px-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.fechaFin}
              onChange={e => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleApplyFilters}
              className="flex items-center"
            >
              <FiFilter className="mr-1" size={16} /> Aplicar Filtros
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleResetFilters}
              className="flex items-center"
            >
              <FiX className="mr-1" size={16} /> Resetear
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Materia Prima</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Ajuste/Proveedor</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiBox size={40} className="mb-2 text-gray-300" />
                    <p>No se encontraron movimientos</p>
                    {(searchTerm || filters.tipoMovimiento || filters.fechaInicio || filters.fechaFin) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={handleResetFilters}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovimientos.map(movimiento => (
                <TableRow 
                  key={movimiento.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewDetails(movimiento)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDate(movimiento.fecha).split(' ')[0]}</span>
                      <span className="text-xs text-gray-500">{formatDate(movimiento.fecha).split(' ')[1]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      color={movimiento.tipo_movimiento === 'entrada' ? 'green' : 'red'}
                      className="flex items-center"
                    >
                      {movimiento.tipo_movimiento === 'entrada' ? (
                        <><FiArrowDown className="mr-1" size={14} /> Entrada</>
                      ) : (
                        <><FiArrowUp className="mr-1" size={14} /> Salida</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button 
                      className="text-indigo-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterByMateriaPrima(movimiento.id_materia_prima);
                      }}
                    >
                      {movimiento.materiaPrima?.nombre || 'N/A'}
                    </button>
                  </TableCell>
                  <TableCell>
                    {movimiento.lote ? (
                      <button 
                        className="text-indigo-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterByLote(movimiento.id_lote);
                        }}
                      >
                        {movimiento.lote.codigo_lote}
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">Sin lote</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {movimiento.cantidad}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movimiento.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                  </TableCell>
                  <TableCell>
                    {movimiento.tipoAjuste ? (
                      <span className="text-purple-600">{movimiento.tipoAjuste.nombre}</span>
                    ) : movimiento.proveedor ? (
                      <span className="text-blue-600">{movimiento.proveedor.nombre}</span>
                    ) : (
                      <span className="text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(movimiento);
                      }}
                      className="p-1 text-indigo-600 hover:text-indigo-800"
                      title="Ver detalles"
                    >
                      <FiInfo size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de creación de movimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Movimiento de Inventario"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Movimiento <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipo_movimiento"
                    value="entrada"
                    checked={formData.tipo_movimiento === 'entrada'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">Entrada</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipo_movimiento"
                    value="salida"
                    checked={formData.tipo_movimiento === 'salida'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">Salida</span>
                </label>
              </div>
            </div>

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
              >
                <option value="">Seleccionar materia prima</option>
                {materiasPrimas.map(mp => (
                  <option key={mp.id} value={mp.id}>
                    {mp.nombre} ({mp.unidadMedida?.abreviatura || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lote
              </label>
              <select
                name="id_lote"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.id_lote}
                onChange={handleChange}
                disabled={!formData.id_materia_prima}
              >
                <option value="">Seleccionar lote</option>
                {lotesFiltrados.map(lote => (
                  <option key={lote.id} value={lote.id}>
                    {lote.codigo_lote} - Disponible: {lote.cantidad_actual}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.cantidad}
                  onChange={handleChange}
                />
              </div>

              {formData.tipo_movimiento === 'entrada' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <select
                    name="id_proveedor"
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.id_proveedor}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Ajuste
                  </label>
                  <select
                    name="id_tipo_ajuste"
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.id_tipo_ajuste}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar tipo de ajuste</option>
                    {tiposAjuste.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                rows="3"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles del movimiento..."
              />
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
              Registrar Movimiento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalles del Movimiento"
        maxWidth="md"
      >
        {selectedMovimiento && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información general */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiBox className="mr-2" /> Información General
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Movimiento</p>
                        <Badge 
                          color={selectedMovimiento.tipo_movimiento === 'entrada' ? 'green' : 'red'}
                          className="mt-1"
                        >
                          {selectedMovimiento.tipo_movimiento === 'entrada' ? (
                            <span className="flex items-center"><FiArrowDown className="mr-1" /> Entrada</span>
                          ) : (
                            <span className="flex items-center"><FiArrowUp className="mr-1" /> Salida</span>
                          )}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Fecha y Hora</p>
                        <p className="font-medium">{formatDate(selectedMovimiento.fecha)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Materia Prima</p>
                      <p className="font-medium flex items-center">
                        <FiPackage className="mr-1 text-indigo-500" size={14} />
                        {selectedMovimiento.materiaPrima?.nombre || 'N/A'}
                      </p>
                    </div>
                    
                    {selectedMovimiento.lote && (
                      <div>
                        <p className="text-sm text-gray-500">Lote</p>
                        <p className="font-medium">{selectedMovimiento.lote.codigo_lote}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Cantidad</p>
                      <p className="font-medium">{selectedMovimiento.cantidad}</p>
                    </div>
                  </div>
                </div>
                
                {/* Detalles específicos */}
                {selectedMovimiento.tipo_movimiento === 'entrada' && selectedMovimiento.proveedor && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                      <FiTruck className="mr-2" /> Proveedor
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium flex items-center">
                        {selectedMovimiento.proveedor.nombre}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedMovimiento.tipo_movimiento === 'salida' && selectedMovimiento.tipoAjuste && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                      <FiSettings className="mr-2" /> Tipo de Ajuste
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedMovimiento.tipoAjuste.nombre}</p>
                      {selectedMovimiento.tipoAjuste.requiere_autorizacion && (
                        <Badge color="purple" className="mt-1">Requiere autorización</Badge>
                      )}
                      {selectedMovimiento.tipoAjuste.afecta_costos && (
                        <Badge color="blue" className="mt-1 ml-2">Afecta costos</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Descripción y usuario */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiInfo className="mr-2" /> Descripción
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{selectedMovimiento.descripcion}</p>
                  </div>
                </div>
                
                {selectedMovimiento.usuario && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                      <FiUser className="mr-2" /> Registrado por
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedMovimiento.usuario.nombre}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
};

const FiUser = ({ className, size }) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={size || "1em"}
      width={size || "1em"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
};

export default Movimientos;