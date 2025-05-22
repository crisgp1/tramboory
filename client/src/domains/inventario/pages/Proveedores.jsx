import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiTruck, 
  FiInfo, 
  FiPhone, 
  FiMail, 
  FiUser,
  FiMapPin,
  FiClock,
  FiDollarSign
} from 'react-icons/fi';
import {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  searchProviders
} from '@domains/inventario/services/inventoryService';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@shared/components/Table';
import { Button } from '@shared/components/Button';
import Modal from '@shared/components/Modal';

const Proveedores = () => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    razon_social: '',
    rfc: '',
    telefono: '',
    email: '',
    direccion: '',
    productos_servicios: '',
    condiciones_pago: '',
    tiempo_entrega_promedio: '',
    notas: ''
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let providersData;
      
      // Si hay término de búsqueda, usar la búsqueda específica
      if (searchTerm.trim()) {
        providersData = await searchProviders(searchTerm);
      } else {
        providersData = await getAllProviders();
      }
      
      setProviders(providersData);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejadores de eventos para el formulario
  const handleOpenModal = (provider = null) => {
    if (provider) {
      setSelectedProvider(provider);
      setFormData({
        nombre: provider.nombre || '',
        razon_social: provider.razon_social || '',
        rfc: provider.rfc || '',
        telefono: provider.telefono || '',
        email: provider.email || '',
        direccion: provider.direccion || '',
        productos_servicios: provider.productos_servicios || '',
        condiciones_pago: provider.condiciones_pago || '',
        tiempo_entrega_promedio: provider.tiempo_entrega_promedio || '',
        notas: provider.notas || ''
      });
    } else {
      setSelectedProvider(null);
      setFormData({
        nombre: '',
        razon_social: '',
        rfc: '',
        telefono: '',
        email: '',
        direccion: '',
        productos_servicios: '',
        condiciones_pago: '',
        tiempo_entrega_promedio: '',
        notas: ''
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
      // Convertir tiempo de entrega a número si no está vacío
      const providerData = {
        ...formData,
        tiempo_entrega_promedio: formData.tiempo_entrega_promedio 
          ? Number(formData.tiempo_entrega_promedio) 
          : null
      };

      if (selectedProvider) {
        await updateProvider(selectedProvider.id, providerData);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await createProvider(providerData);
        toast.success('Proveedor creado correctamente');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      
      // Manejar errores específicos
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al guardar el proveedor');
      }
    }
  };

  const handleViewDetails = async (provider) => {
    try {
      setLoading(true);
      // Si el proveedor ya tiene todos los datos, usarlo directamente
      // sino, obtener detalles completos
      const fullProvider = await getProviderById(provider.id);
      setSelectedProvider(fullProvider);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalles del proveedor:', error);
      toast.error('Error al obtener detalles del proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (provider) => {
    setSelectedProvider(provider);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteProvider(selectedProvider.id);
      toast.success('Proveedor eliminado correctamente');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      
      // Manejar error específico cuando hay órdenes activas
      if (error.response?.status === 409) {
        toast.error('No se puede eliminar el proveedor porque tiene órdenes de compra activas');
      } else {
        toast.error(error.response?.data?.error || 'Error al eliminar el proveedor');
      }
    }
  };

  // Búsqueda con retraso para evitar demasiadas peticiones
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && !providers.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => handleOpenModal()}
        >
          <FiPlus size={18} /> Agregar Proveedor
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Buscar por nombre, razón social o productos/servicios..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Tabla de proveedores */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Razón Social</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Productos/Servicios</TableHead>
              <TableHead>Tiempo de Entrega</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiTruck size={40} className="mb-2 text-gray-300" />
                    <p>No se encontraron proveedores</p>
                    {searchTerm && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => setSearchTerm('')}
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              providers.map(provider => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.nombre}</TableCell>
                  <TableCell>
                    {provider.razon_social || <span className="text-gray-400 italic">No especificada</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {provider.telefono && (
                        <div className="flex items-center text-sm">
                          <FiPhone className="mr-1 text-gray-500" size={14} />
                          <span>{provider.telefono}</span>
                        </div>
                      )}
                      {provider.email && (
                        <div className="flex items-center text-sm">
                          <FiMail className="mr-1 text-gray-500" size={14} />
                          <span>{provider.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {provider.productos_servicios}
                  </TableCell>
                  <TableCell>
                    {provider.tiempo_entrega_promedio 
                      ? `${provider.tiempo_entrega_promedio} días`
                      : <span className="text-gray-400 italic">No especificado</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(provider)}
                        className="p-1 text-indigo-600 hover:text-indigo-800"
                        title="Ver detalles"
                      >
                        <FiInfo size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(provider)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(provider)}
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
        title={selectedProvider ? `Editar: ${selectedProvider.nombre}` : 'Nuevo Proveedor'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  name="razon_social"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.razon_social}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  type="text"
                  name="rfc"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.rfc}
                  onChange={handleChange}
                  placeholder="Ej: XAXX010101000"
                  maxLength={13}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: (123) 456-7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                name="direccion"
                rows="2"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Productos/Servicios <span className="text-red-500">*</span>
              </label>
              <textarea
                name="productos_servicios"
                rows="3"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.productos_servicios}
                onChange={handleChange}
                placeholder="Descripción de productos o servicios que ofrece"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condiciones de Pago
                </label>
                <textarea
                  name="condiciones_pago"
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.condiciones_pago}
                  onChange={handleChange}
                  placeholder="Ej: 30 días, prepago, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Entrega Promedio (días)
                </label>
                <input
                  type="number"
                  name="tiempo_entrega_promedio"
                  min="1"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.tiempo_entrega_promedio}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notas"
                rows="3"
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Información adicional sobre el proveedor"
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
              {selectedProvider ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Proveedor: ${selectedProvider?.nombre}`}
        maxWidth="lg"
      >
        {selectedProvider && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información general */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiUser className="mr-2" /> Información General
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="font-medium">{selectedProvider.nombre}</p>
                    </div>
                    
                    {selectedProvider.razon_social && (
                      <div>
                        <p className="text-sm text-gray-500">Razón Social</p>
                        <p>{selectedProvider.razon_social}</p>
                      </div>
                    )}
                    
                    {selectedProvider.rfc && (
                      <div>
                        <p className="text-sm text-gray-500">RFC</p>
                        <p className="font-mono">{selectedProvider.rfc}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Contacto */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiPhone className="mr-2" /> Contacto
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {selectedProvider.telefono && (
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p>{selectedProvider.telefono}</p>
                      </div>
                    )}
                    
                    {selectedProvider.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-blue-600">{selectedProvider.email}</p>
                      </div>
                    )}
                    
                    {selectedProvider.direccion && (
                      <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p>{selectedProvider.direccion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Productos y condiciones */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiTruck className="mr-2" /> Productos / Servicios
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{selectedProvider.productos_servicios}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                    <FiClock className="mr-2" /> Condiciones
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {selectedProvider.tiempo_entrega_promedio && (
                      <div>
                        <p className="text-sm text-gray-500">Tiempo de entrega promedio</p>
                        <p>{selectedProvider.tiempo_entrega_promedio} días</p>
                      </div>
                    )}
                    
                    {selectedProvider.condiciones_pago && (
                      <div>
                        <p className="text-sm text-gray-500">Condiciones de pago</p>
                        <p>{selectedProvider.condiciones_pago}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedProvider.notas && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                      <FiInfo className="mr-2" /> Notas Adicionales
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-line">{selectedProvider.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenModal(selectedProvider)}
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
            ¿Estás seguro de que deseas eliminar el proveedor <span className="font-semibold">{selectedProvider?.nombre}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            No se podrá eliminar si tiene órdenes de compra activas asociadas.
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

export default Proveedores;