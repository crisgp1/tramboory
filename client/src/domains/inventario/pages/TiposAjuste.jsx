import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiSettings, 
  FiDollarSign, 
  FiShield, 
  FiInfo
} from 'react-icons/fi';
import {
  getAllAdjustmentTypes,
  createAdjustmentType,
  updateAdjustmentType,
  deleteAdjustmentType,
  getTiposAjusteAutorizacion,
  getTiposAjusteCostos
} from '@/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

const TiposAjuste = () => {
  const [tiposAjuste, setTiposAjuste] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    requiereAutorizacion: false,
    afectaCostos: false
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    afecta_costos: false,
    requiere_autorizacion: false
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let tiposData;
      
      // Aplicar filtros si es necesario
      if (filtros.requiereAutorizacion) {
        tiposData = await getTiposAjusteAutorizacion();
      } else if (filtros.afectaCostos) {
        tiposData = await getTiposAjusteCostos();
      } else {
        tiposData = await getAllAdjustmentTypes();
      }
      
      setTiposAjuste(tiposData);
    } catch (error) {
      console.error('Error al cargar tipos de ajuste:', error);
      toast.error('Error al cargar los tipos de ajuste');
    } finally {
      setLoading(false);
    }
  }, [filtros.requiereAutorizacion, filtros.afectaCostos]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar tipos
  const filteredTipos = tiposAjuste
    .filter(tipo => {
      // Filtro de búsqueda
      if (searchTerm && 
          !tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Manejadores de eventos para el formulario
  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setSelectedTipo(tipo);
      setFormData({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || '',
        afecta_costos: tipo.afecta_costos,
        requiere_autorizacion: tipo.requiere_autorizacion
      });
    } else {
      setSelectedTipo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        afecta_costos: false,
        requiere_autorizacion: false
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTipo) {
        await updateAdjustmentType(selectedTipo.id, formData);
        toast.success('Tipo de ajuste actualizado correctamente');
      } else {
        await createAdjustmentType(formData);
        toast.success('Tipo de ajuste creado correctamente');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar tipo de ajuste:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al guardar el tipo de ajuste');
      }
    }
  };

  const handleViewDetails = (tipo) => {
    setSelectedTipo(tipo);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (tipo) => {
    setSelectedTipo(tipo);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteAdjustmentType(selectedTipo.id);
      toast.success('Tipo de ajuste eliminado correctamente');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar tipo de ajuste:', error);
      
      if (error.response?.status === 409) {
        toast.error('No se puede eliminar el tipo de ajuste porque tiene movimientos asociados');
      } else {
        toast.error(error.response?.data?.error || 'Error al eliminar el tipo de ajuste');
      }
    }
  };

  // Filtrado
  const toggleFiltroAutorizacion = () => {
    setFiltros(prev => ({
      ...prev,
      requiereAutorizacion: !prev.requiereAutorizacion,
      afectaCostos: false // Desactivar el otro filtro
    }));
  };

  const toggleFiltroCostos = () => {
    setFiltros(prev => ({
      ...prev,
      afectaCostos: !prev.afectaCostos,
      requiereAutorizacion: false // Desactivar el otro filtro
    }));
  };

  const resetFiltros = () => {
    setFiltros({
      requiereAutorizacion: false,
      afectaCostos: false
    });
    setSearchTerm('');
  };

  if (loading && !tiposAjuste.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tipos de Ajuste</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <FiPlus size={18} /> Agregar Tipo
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                filtros.requiereAutorizacion 
                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={toggleFiltroAutorizacion}
            >
              <FiShield size={16} />
              Requiere Autorización
              {filtros.requiereAutorizacion && <FiX size={16} className="ml-1" />}
            </button>
            
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                filtros.afectaCostos 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={toggleFiltroCostos}
            >
              <FiDollarSign size={16} />
              Afecta Costos
              {filtros.afectaCostos && <FiX size={16} className="ml-1" />}
            </button>
            
            {(searchTerm || filtros.requiereAutorizacion || filtros.afectaCostos) && (
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={resetFiltros}
              >
                <FiX size={16} />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de tipos de ajuste */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Autorizaciones</TableHead>
              <TableHead>Afectación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiSettings size={40} className="mb-2 text-gray-300" />
                    <p>No se encontraron tipos de ajuste</p>
                    {(searchTerm || filtros.requiereAutorizacion || filtros.afectaCostos) && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={resetFiltros}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTipos.map(tipo => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nombre}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {tipo.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                  </TableCell>
                  <TableCell>
                    {tipo.requiere_autorizacion ? (
                      <Badge color="purple">Requiere autorización</Badge>
                    ) : (
                      <span className="text-gray-500">No necesita</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tipo.afecta_costos ? (
                      <Badge color="blue">Afecta costos</Badge>
                    ) : (
                      <span className="text-gray-500">No afecta</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(tipo)}
                        className="p-1 text-indigo-600 hover:text-indigo-800"
                        title="Ver detalles"
                      >
                        <FiInfo size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(tipo)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(tipo)}
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
        title={selectedTipo ? `Editar Tipo: ${selectedTipo.nombre}` : 'Nuevo Tipo de Ajuste'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Merma por caducidad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                rows="3"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del tipo de ajuste..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="afecta_costos"
                  name="afecta_costos"
                  checked={formData.afecta_costos}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="afecta_costos" className="ml-2 block text-sm text-gray-700">
                  Afecta costos
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Si está activado, este tipo de ajuste modificará el costo promedio de los productos.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiere_autorizacion"
                  name="requiere_autorizacion"
                  checked={formData.requiere_autorizacion}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requiere_autorizacion" className="ml-2 block text-sm text-gray-700">
                  Requiere autorización
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Si está activado, solo los administradores podrán realizar ajustes de este tipo.
              </p>
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
              {selectedTipo ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Tipo de Ajuste: ${selectedTipo?.nombre}`}
        maxWidth="md"
      >
        {selectedTipo && (
          <div className="space-y-6 py-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Información General</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{selectedTipo.nombre}</p>
                  </div>
                  
                  {selectedTipo.descripcion && (
                    <div>
                      <p className="text-sm text-gray-500">Descripción</p>
                      <p className="whitespace-pre-line">{selectedTipo.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Configuración</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiDollarSign className={`mr-2 ${selectedTipo.afecta_costos ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>Afecta costos</span>
                      </div>
                      <div>
                        {selectedTipo.afecta_costos ? (
                          <Badge color="blue">Activado</Badge>
                        ) : (
                          <Badge color="gray">Desactivado</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiShield className={`mr-2 ${selectedTipo.requiere_autorizacion ? 'text-purple-500' : 'text-gray-400'}`} />
                        <span>Requiere autorización</span>
                      </div>
                      <div>
                        {selectedTipo.requiere_autorizacion ? (
                          <Badge color="purple">Activado</Badge>
                        ) : (
                          <Badge color="gray">Desactivado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenModal(selectedTipo)}
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
            ¿Estás seguro de que deseas eliminar el tipo de ajuste <span className="font-semibold">{selectedTipo?.nombre}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            No se podrá eliminar si tiene movimientos asociados.
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

// FiX component para mantener consistencia con los otros íconos
const FiX = ({ size, className }) => {
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
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
};

export default TiposAjuste;