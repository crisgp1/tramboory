import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

// Mock data
const MOCK_MOVEMENTS = [
  {
    id: 1,
    type: 'entrada',
    itemName: 'Silla Gamer',
    quantity: 10,
    date: '2024-01-22',
    provider: 'Deportes Elite',
    description: 'Reposición de stock'
  },
  {
    id: 2,
    type: 'salida',
    itemName: 'Mesa de Ping Pong',
    quantity: 1,
    date: '2024-01-21',
    provider: null,
    description: 'Venta a cliente'
  },
  {
    id: 3,
    type: 'entrada',
    itemName: 'Raqueta Pro',
    quantity: 20,
    date: '2024-01-20',
    provider: 'Sport Equipment SA',
    description: 'Nuevo modelo'
  }
];

// Mock items y providers para el formulario
const MOCK_ITEMS = [
  { id: 1, name: 'Silla Gamer' },
  { id: 2, name: 'Mesa de Ping Pong' },
  { id: 3, name: 'Raqueta Pro' }
];

const MOCK_PROVIDERS = [
  { id: 1, name: 'Deportes Elite' },
  { id: 2, name: 'Sport Equipment SA' },
  { id: 3, name: 'Implementos Pro' }
];

const MovementsView = () => {
  const [movements, setMovements] = useState(MOCK_MOVEMENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [formData, setFormData] = useState({
    type: 'entrada',
    itemName: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMovement) {
      setMovements(prev => prev.map(movement => 
        movement.id === editingMovement.id ? { ...formData, id: movement.id } : movement
      ));
    } else {
      setMovements(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    handleCloseForm();
  };

  const handleEdit = (movement) => {
    setEditingMovement(movement);
    setFormData(movement);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setMovements(prev => prev.filter(movement => movement.id !== id));
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMovement(null);
    setFormData({
      type: 'entrada',
      itemName: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      provider: '',
      description: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Movimientos de Inventario</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    movement.type === 'entrada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.provider || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(movement)}
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(movement.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Movimiento</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item</label>
                  <select
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccionar Item</option>
                    {MOCK_ITEMS.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                {formData.type === 'entrada' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                    <select
                      name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Seleccionar Proveedor</option>
                      {MOCK_PROVIDERS.map(provider => (
                        <option key={provider.id} value={provider.name}>{provider.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingMovement ? 'Guardar Cambios' : 'Crear Movimiento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementsView;