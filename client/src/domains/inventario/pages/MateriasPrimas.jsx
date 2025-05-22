import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiPackage, 
  FiFilter, 
  FiX, 
  FiBox, 
  FiAlertTriangle, 
  FiChevronDown, 
  FiDollarSign,
  FiInfo,
  FiCalendar,
  FiShield
} from 'react-icons/fi';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getAllUnits
} from '@domains/inventario/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@shared/components/Table';
import { Button } from '@shared/components/Button';
import Modal from '@shared/components/Modal';
import { Badge } from '@shared/components/Badge';

const MateriasPrimas = () => {
  const [items, setItems] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bajoStock: false,
    sinStock: false
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock_actual: 0,
    stock_minimo: 0,
    id_unidad_medida: '',
    costo_unitario: 0
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, unitsData] = await Promise.all([
        getAllItems(),
        getAllUnits()
      ]);
      setItems(itemsData);
      setUnidadesMedida(unitsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos de materias primas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar items
  const filteredItems = items
    .filter(item => {
      // Filtro de búsqueda
      if (searchTerm && !item.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro de bajo stock
      if (filters.bajoStock && item.stock_actual > item.stock_minimo) {
        return false;
      }
      
      // Filtro de sin stock
      if (filters.sinStock && item.stock_actual > 0) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Manejadores de eventos para el formulario
  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        id_unidad_medida: item.id_unidad_medida,
        costo_unitario: item.costo_unitario
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nombre: '',
        descripcion: '',
        stock_actual: 0,
        stock_minimo: 0,
        id_unidad_medida: unidadesMedida.length > 0 ? unidadesMedida[0].id : '',
        costo_unitario: 0
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
      // Convertir valores numéricos
      const itemData = {
        ...formData,
        stock_actual: Number(formData.stock_actual),
        stock_minimo: Number(formData.stock_minimo),
        costo_unitario: Number(formData.costo_unitario),
        id_unidad_medida: Number(formData.id_unidad_medida)
      };

      if (selectedItem) {
        await updateItem(selectedItem.id, itemData);
        toast.success('Materia prima actualizada correctamente');
      } else {
        await createItem(itemData);
        toast.success('Materia prima creada correctamente');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar materia prima:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la materia prima');
    }
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteItem(selectedItem.id);
      toast.success('Materia prima eliminada correctamente');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar materia prima:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar la materia prima');
    }
  };

  // Renderizar el estado del stock
  const renderStockStatus = (item) => {
    if (item.stock_actual <= 0) {
      return <Badge color="red">Sin Stock</Badge>;
    } else if (item.stock_actual <= item.stock_minimo) {
      return <Badge color="amber">Bajo Stock</Badge>;
    } else {
      return <Badge color="green">Stock Óptimo</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Materias Primas</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <FiPlus size={18} /> Agregar Materia Prima
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
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              filters.bajoStock 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, bajoStock: !prev.bajoStock }))}
          >
            <FiFilter size={16} />
            Bajo Stock
            {filters.bajoStock && <FiX size={16} />}
          </button>
          
          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              filters.sinStock 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, sinStock: !prev.sinStock }))}
          >
            <FiFilter size={16} />
            Sin Stock
            {filters.sinStock && <FiX size={16} />}
          </button>
        </div>
      </div>

      {/* Tabla de materias primas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Unidad de Medida</TableHead>
              <TableHead>Costo Unitario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiPackage size={40} className="mb-2 text-gray-300" />
                    <p>No se encontraron materias primas</p>
                    {(searchTerm || filters.bajoStock || filters.sinStock) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          setSearchTerm('');
                          setFilters({ bajoStock: false, sinStock: false });
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                  </TableCell>
                  <TableCell>
                    {item.stock_actual} {item.unidadMedida?.abreviatura}
                  </TableCell>
                  <TableCell>
                    {item.stock_minimo} {item.unidadMedida?.abreviatura}
                  </TableCell>
                  <TableCell>
                    {item.unidadMedida?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(item.costo_unitario).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {renderStockStatus(item)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(item)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de creación/edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? `Editar: ${selectedItem.nombre}` : 'Nueva Materia Prima'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Sección de información general */}
          <div className="grid grid-cols-1 gap-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                  placeholder="Nombre de la materia prima"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Descripción
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FiEdit2 className="text-gray-400" size={16} />
                </div>
                <textarea
                  name="descripcion"
                  rows="3"
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.descripcion}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                  placeholder="Descripción detallada del producto"
                />
              </div>
            </div>
          </div>

          {/* Sección de inventario - Grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {/* Stock Actual */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Stock Actual
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBox className="text-gray-400" size={16} />
                </div>
                <input
                  type="number"
                  name="stock_actual"
                  min="0"
                  step="0.01"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.stock_actual}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Stock Mínimo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiAlertTriangle className="text-gray-400" size={16} />
                </div>
                <input
                  type="number"
                  name="stock_minimo"
                  min="0"
                  step="0.01"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.stock_minimo}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Unidad de Medida */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Unidad de Medida
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" size={16} />
                </div>
                <select
                  name="id_unidad_medida"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  value={formData.id_unidad_medida}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                >
                  <option value="">Seleccionar unidad</option>
                  {unidadesMedida.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.abreviatura})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiChevronDown className="text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* Costo Unitario */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Costo Unitario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" size={16} />
                </div>
                <input
                  type="number"
                  name="costo_unitario"
                  min="0"
                  step="0.01"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.costo_unitario}
                  onChange={handleChange}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
              className="flex items-center gap-2"
            >
              <FiX size={16} /> Cancelar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              {selectedItem ? <FiEdit2 size={16} /> : <FiPlus size={16} />}
              {selectedItem ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
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
            ¿Estás seguro de que deseas eliminar la materia prima <span className="font-semibold">{selectedItem?.nombre}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Esta acción no se puede deshacer y podría afectar a registros relacionados.
          </p>
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
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MateriasPrimas;