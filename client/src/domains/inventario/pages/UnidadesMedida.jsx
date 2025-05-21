import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { getAllUnits, getUnitById, createUnit, updateUnit, deleteUnit } from '@/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const tipoBadgeColors = {
  masa: 'blue',
  volumen: 'green',
  unidad: 'purple',
  longitud: 'amber',
  area: 'indigo'
};

const UnidadesMedida = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    tipo: 'masa'
  });

  const tiposUnidad = [
    { id: 'masa', label: 'Masa' },
    { id: 'volumen', label: 'Volumen' },
    { id: 'unidad', label: 'Unidad' },
    { id: 'longitud', label: 'Longitud' },
    { id: 'area', label: 'Área' }
  ];

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const unitsData = await getAllUnits();
      setUnits(unitsData);
    } catch (error) {
      console.error('Error al cargar unidades de medida:', error);
      toast.error('Error al cargar las unidades de medida');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar unidades
  const filteredUnits = units
    .filter(unit => {
      // Filtro de búsqueda
      if (searchTerm && !unit.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !unit.abreviatura.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por tipo
      if (activeFilter && unit.tipo !== activeFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Manejadores de eventos para el formulario
  const handleOpenModal = (unit = null) => {
    if (unit) {
      setSelectedUnit(unit);
      setFormData({
        nombre: unit.nombre,
        abreviatura: unit.abreviatura,
        tipo: unit.tipo
      });
    } else {
      setSelectedUnit(null);
      setFormData({
        nombre: '',
        abreviatura: '',
        tipo: 'masa'
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
      if (selectedUnit) {
        await updateUnit(selectedUnit.id, formData);
        toast.success('Unidad de medida actualizada correctamente');
      } else {
        await createUnit(formData);
        toast.success('Unidad de medida creada correctamente');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar unidad de medida:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la unidad de medida');
    }
  };

  const handleOpenDeleteModal = (unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUnit(selectedUnit.id);
      toast.success('Unidad de medida eliminada correctamente');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar unidad de medida:', error);
      
      // Manejar el caso específico de error cuando la unidad está en uso
      if (error.response?.data?.error?.includes('tiene conversiones asociadas') || 
          error.response?.status === 409) {
        toast.error('No se puede eliminar la unidad porque está siendo utilizada en conversiones o productos');
      } else {
        toast.error(error.response?.data?.error || 'Error al eliminar la unidad de medida');
      }
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
        <h1 className="text-2xl font-bold text-gray-800">Unidades de Medida</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <FiPlus size={18} /> Agregar Unidad
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
            placeholder="Buscar por nombre o abreviatura..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tiposUnidad.map(tipo => (
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
        </div>
      </div>

      {/* Tabla de unidades de medida */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Abreviatura</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="mb-2 text-gray-300 text-4xl">⚖️</div>
                    <p>No se encontraron unidades de medida</p>
                    {(searchTerm || activeFilter) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => {
                          setSearchTerm('');
                          setActiveFilter('');
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.nombre}</TableCell>
                  <TableCell className="font-mono">{unit.abreviatura}</TableCell>
                  <TableCell>
                    <Badge color={tipoBadgeColors[unit.tipo] || 'gray'}>
                      {unit.tipo.charAt(0).toUpperCase() + unit.tipo.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(unit)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(unit)}
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
        title={selectedUnit ? `Editar: ${selectedUnit.nombre}` : 'Nueva Unidad de Medida'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiEdit2 className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Kilogramo"
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                />
              </div>
            </div>

            {/* Abreviatura */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Abreviatura
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-mono text-sm font-bold">Aa</span>
                </div>
                <input
                  type="text"
                  name="abreviatura"
                  required
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.abreviatura}
                  onChange={handleChange}
                  placeholder="Ej: kg"
                  maxLength={10}
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--input-text)', 
                    borderColor: 'var(--input-border)'
                  }}
                />
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Máximo 10 caracteres. Se recomienda usar abreviaturas estándar.
              </p>
            </div>
          </div>

          {/* Tipo de Unidad - Ocupa una fila completa */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Tipo de Unidad
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" size={16} />
              </div>
              <select
                name="tipo"
                required
                className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                value={formData.tipo}
                onChange={handleChange}
                style={{ 
                  backgroundColor: 'var(--input-bg)', 
                  color: 'var(--input-text)', 
                  borderColor: 'var(--input-border)'
                }}
              >
                {tiposUnidad.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-gray-400" size={16} />
              </div>
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Las conversiones solo pueden realizarse entre unidades del mismo tipo.
            </p>
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
              {selectedUnit ? <FiEdit2 size={16} /> : <FiPlus size={16} />}
              {selectedUnit ? 'Actualizar' : 'Crear'}
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
            ¿Estás seguro de que deseas eliminar la unidad de medida <span className="font-semibold">{selectedUnit?.nombre}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            No se podrá eliminar si está siendo utilizada en materias primas o conversiones.
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

export default UnidadesMedida;