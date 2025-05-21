import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiArrowRight, 
  FiFilter, 
  FiX, 
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';
import { MdCalculate } from 'react-icons/md';
import {
  getAllConversiones,
  getConversionById,
  createConversion,
  updateConversion,
  deleteConversion,
  getAllUnits,
  getConversionesDisponibles,
  convertirCantidad
} from '@/services/inventoryService';
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

const Conversiones = () => {
  const [conversiones, setConversiones] = useState([]);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [formData, setFormData] = useState({
    id_unidad_origen: '',
    id_unidad_destino: '',
    factor_conversion: ''
  });
  const [calculatorData, setCalculatorData] = useState({
    cantidad: 1,
    id_unidad_origen: '',
    id_unidad_destino: '',
    resultado: null
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
    setError(null);
    
    try {
      const promises = [getAllConversiones(), getAllUnits()];
      const results = await Promise.allSettled(promises);
      
      // Revisar resultado de conversiones
      if (results[0].status === 'fulfilled') {
        setConversiones(results[0].value);
      } else {
        console.error('Error al cargar conversiones:', results[0].reason);
        toast.error('Error al cargar las conversiones');
        setConversiones([]);
      }
      
      // Revisar resultado de unidades
      if (results[1].status === 'fulfilled') {
        const unitsData = results[1].value;
        setUnidadesMedida(unitsData);
        
        // Si hay un filtro activo, aplicarlo a las unidades
        if (filtroTipo) {
          setUnidadesFiltradas(unitsData.filter(unidad => unidad.tipo === filtroTipo));
        } else {
          setUnidadesFiltradas(unitsData);
        }
      } else {
        console.error('Error al cargar unidades de medida:', results[1].reason);
        toast.error('Error al cargar las unidades de medida');
        setUnidadesMedida([]);
        setUnidadesFiltradas([]);
      }
      
      // Si ambos fallan, mostrar error general
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Error de conexión al servidor. Por favor, intente nuevamente más tarde.');
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      toast.error('Error de conexión con el servidor');
      setError('Error de conexión al servidor. Por favor, intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  }, [filtroTipo]);

  // Función para reintentar la carga de datos
  const handleRetry = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar conversiones
  const filteredConversiones = conversiones
    .filter(conversion => {
      // Filtro por tipo
      if (filtroTipo) {
        return (
          conversion.unidadOrigen?.tipo === filtroTipo && 
          conversion.unidadDestino?.tipo === filtroTipo
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Ordenar por tipo y luego por nombres
      if (a.unidadOrigen?.tipo !== b.unidadOrigen?.tipo) {
        return a.unidadOrigen?.tipo.localeCompare(b.unidadOrigen?.tipo);
      }
      return a.unidadOrigen?.nombre.localeCompare(b.unidadOrigen?.nombre);
    });

  // Manejadores de eventos para el formulario
  const handleOpenModal = (conversion = null) => {
    if (conversion) {
      setSelectedConversion(conversion);
      setFormData({
        id_unidad_origen: conversion.id_unidad_origen,
        id_unidad_destino: conversion.id_unidad_destino,
        factor_conversion: conversion.factor_conversion
      });
    } else {
      setSelectedConversion(null);
      setFormData({
        id_unidad_origen: unidadesFiltradas.length > 0 ? unidadesFiltradas[0].id : '',
        id_unidad_destino: unidadesFiltradas.length > 1 ? unidadesFiltradas[1].id : '',
        factor_conversion: ''
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

  const handleCalculatorChange = (e) => {
    const { name, value } = e.target;
    setCalculatorData(prev => ({
      ...prev,
      [name]: value,
      resultado: null // Resetear resultado al cambiar algún valor
    }));
  };

  const handleConvert = async () => {
    try {
      if (!calculatorData.cantidad || !calculatorData.id_unidad_origen || !calculatorData.id_unidad_destino) {
        toast.error('Todos los campos son requeridos para realizar la conversión');
        return;
      }

      const data = {
        cantidad: Number(calculatorData.cantidad),
        id_unidad_origen: Number(calculatorData.id_unidad_origen),
        id_unidad_destino: Number(calculatorData.id_unidad_destino)
      };

      const response = await convertirCantidad(data);
      setCalculatorData(prev => ({
        ...prev,
        resultado: response.cantidad_convertida
      }));

    } catch (error) {
      console.error('Error al convertir cantidad:', error);
      toast.error(error.response?.data?.error || 'Error al realizar la conversión');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que no sean la misma unidad
      if (formData.id_unidad_origen === formData.id_unidad_destino) {
        toast.error('La unidad de origen y destino no pueden ser iguales');
        return;
      }

      // Validar tipo de unidades iguales
      const unidadOrigen = unidadesMedida.find(u => u.id === Number(formData.id_unidad_origen));
      const unidadDestino = unidadesMedida.find(u => u.id === Number(formData.id_unidad_destino));

      if (unidadOrigen.tipo !== unidadDestino.tipo) {
        toast.error('Las unidades deben ser del mismo tipo para poder convertir entre ellas');
        return;
      }

      // Convertir valores a números
      const conversionData = {
        id_unidad_origen: Number(formData.id_unidad_origen),
        id_unidad_destino: Number(formData.id_unidad_destino),
        factor_conversion: Number(formData.factor_conversion)
      };

      if (selectedConversion) {
        await updateConversion(
          selectedConversion.id_unidad_origen, 
          selectedConversion.id_unidad_destino, 
          conversionData
        );
        toast.success('Conversión actualizada correctamente');
      } else {
        await createConversion(conversionData);
        toast.success('Conversión creada correctamente');
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al guardar conversión:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al guardar la conversión');
      }
    }
  };

  const handleOpenDeleteModal = (conversion) => {
    setSelectedConversion(conversion);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteConversion(
        selectedConversion.id_unidad_origen, 
        selectedConversion.id_unidad_destino
      );
      toast.success('Conversión eliminada correctamente');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar conversión:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar la conversión');
    }
  };

  const handleFilterByTipo = (tipo) => {
    if (filtroTipo === tipo) {
      setFiltroTipo('');
      setUnidadesFiltradas(unidadesMedida);
    } else {
      setFiltroTipo(tipo);
      setUnidadesFiltradas(unidadesMedida.filter(unidad => unidad.tipo === tipo));
    }
  };

  const handleOpenCalculator = () => {
    setCalculatorData({
      cantidad: 1,
      id_unidad_origen: unidadesMedida.length > 0 ? unidadesMedida[0].id : '',
      id_unidad_destino: unidadesMedida.length > 1 ? unidadesMedida[1].id : '',
      resultado: null
    });
    setIsCalculatorModalOpen(true);
  };

  if (loading && !conversiones.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Conversiones entre Unidades
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleOpenCalculator}
          >
            <MdCalculate size={18} /> Calculadora
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => handleOpenModal()}
          >
            <FiPlus size={18} /> Agregar Conversión
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Filtrar por tipo de unidad:</h2>
        <div className="flex flex-wrap gap-2">
          {tiposUnidad.map(tipo => (
            <button
              key={tipo.id}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                filtroTipo === tipo.id 
                  ? `bg-${tipoBadgeColors[tipo.id]}-100 text-${tipoBadgeColors[tipo.id]}-800 border border-${tipoBadgeColors[tipo.id]}-200` 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterByTipo(tipo.id)}
            >
              <FiFilter size={16} />
              {tipo.label}
              {filtroTipo === tipo.id && <FiX size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de conversiones */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidad Origen</TableHead>
              <TableHead></TableHead>
              <TableHead>Unidad Destino</TableHead>
              <TableHead>Factor de Conversión</TableHead>
              <TableHead>Equivalencia</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversiones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FiRefreshCw size={40} className="mb-2 text-gray-300" />
                    <p>No se encontraron conversiones</p>
                    {filtroTipo && (
                      <button 
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => setFiltroTipo('')}
                      >
                        Ver todas las conversiones
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredConversiones.map(conversion => (
                <TableRow key={`${conversion.id_unidad_origen}-${conversion.id_unidad_destino}`}>
                  <TableCell>
                    <Badge color={tipoBadgeColors[conversion.unidadOrigen?.tipo || 'gray']}>
                      {conversion.unidadOrigen?.tipo?.charAt(0).toUpperCase() + conversion.unidadOrigen?.tipo?.slice(1) || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {conversion.unidadOrigen?.nombre || 'N/A'} 
                    <span className="text-gray-500 ml-1">({conversion.unidadOrigen?.abreviatura || 'N/A'})</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <FiArrowRight className="inline-block text-gray-400" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {conversion.unidadDestino?.nombre || 'N/A'} 
                    <span className="text-gray-500 ml-1">({conversion.unidadDestino?.abreviatura || 'N/A'})</span>
                  </TableCell>
                  <TableCell className="font-mono">
                    {parseFloat(conversion.factor_conversion).toFixed(6)}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      1 {conversion.unidadOrigen?.abreviatura} = {parseFloat(conversion.factor_conversion).toFixed(3)} {conversion.unidadDestino?.abreviatura}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(conversion)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(conversion)}
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
        title={selectedConversion ? 'Editar Conversión' : 'Nueva Conversión'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_unidad_origen"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.id_unidad_origen}
                  onChange={handleChange}
                  disabled={selectedConversion !== null}
                >
                  <option value="">Seleccionar unidad origen</option>
                  {unidadesFiltradas.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.abreviatura}) - {unidad.tipo}
                    </option>
                  ))}
                </select>
                {selectedConversion && (
                  <p className="mt-1 text-xs text-amber-500">
                    <FiRefreshCw className="inline mr-1" />
                    Las unidades no se pueden cambiar, solo el factor de conversión
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de Destino <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_unidad_destino"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.id_unidad_destino}
                  onChange={handleChange}
                  disabled={selectedConversion !== null}
                >
                  <option value="">Seleccionar unidad destino</option>
                  {unidadesFiltradas
                    .filter(unidad => unidad.id !== Number(formData.id_unidad_origen))
                    .map(unidad => (
                      <option key={unidad.id} value={unidad.id}>
                        {unidad.nombre} ({unidad.abreviatura}) - {unidad.tipo}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de Conversión <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="factor_conversion"
                min="0.000001"
                step="any"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.factor_conversion}
                onChange={handleChange}
                placeholder="Ej: 1000 para convertir de kg a g"
              />
              {formData.id_unidad_origen && formData.id_unidad_destino && (
                <p className="mt-2 text-sm text-gray-600">
                  Esto significa que 1 {unidadesMedida.find(u => u.id === Number(formData.id_unidad_origen))?.abreviatura || 'unidad'} 
                  {' = '} 
                  {formData.factor_conversion || 'X'} {unidadesMedida.find(u => u.id === Number(formData.id_unidad_destino))?.abreviatura || 'unidades'}
                </p>
              )}
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
              {selectedConversion ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de calculadora */}
      <Modal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        title="Calculadora de Conversiones"
        maxWidth="md"
      >
        <div className="space-y-6 py-2">
          <p className="text-gray-600">
            Utilice esta herramienta para convertir cantidades entre diferentes unidades de medida.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                name="cantidad"
                min="0.000001"
                step="any"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={calculatorData.cantidad}
                onChange={handleCalculatorChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                De
              </label>
              <select
                name="id_unidad_origen"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={calculatorData.id_unidad_origen}
                onChange={handleCalculatorChange}
              >
                <option value="">Seleccionar unidad</option>
                {unidadesMedida.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura}) - {unidad.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                A
              </label>
              <select
                name="id_unidad_destino"
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={calculatorData.id_unidad_destino}
                onChange={handleCalculatorChange}
              >
                <option value="">Seleccionar unidad</option>
                {unidadesMedida.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura}) - {unidad.tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handleConvert}
              className="px-6"
            >
              <MdCalculate className="mr-2" /> Convertir
            </Button>
          </div>

          {calculatorData.resultado !== null && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Resultado:</p>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-gray-800 font-medium">
                  {calculatorData.cantidad} {unidadesMedida.find(u => u.id === Number(calculatorData.id_unidad_origen))?.abreviatura}
                </div>
                <FiArrowRight className="text-gray-400" />
                <div className="text-xl font-bold text-indigo-600">
                  {calculatorData.resultado} {unidadesMedida.find(u => u.id === Number(calculatorData.id_unidad_destino))?.abreviatura}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCalculatorModalOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
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
            ¿Estás seguro de que deseas eliminar la conversión entre <span className="font-semibold">{selectedConversion?.unidadOrigen?.nombre}</span> y <span className="font-semibold">{selectedConversion?.unidadDestino?.nombre}</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            También se eliminará la conversión inversa automáticamente.
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

export default Conversiones;