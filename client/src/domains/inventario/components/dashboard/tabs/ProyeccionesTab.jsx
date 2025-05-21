import React, { useState, useEffect } from 'react';
import axios from '../../../../components/axiosConfig';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Componentes compartidos
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import RefreshButton from '../RefreshButton';
import FadeInUp from '../FadeInUp';

// Constantes y utilidades
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const ProyeccionesTab = () => {
  // Estados
  const [proyecciones, setProyecciones] = useState([]);
  const [alertasCaducidad, setAlertasCaducidad] = useState([]);
  const [reabastecimiento, setReabastecimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleMateriaPrima, setDetalleMateriaPrima] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  
  // Estado para filtros
  const [filtro, setFiltro] = useState({
    fechaInicio: format(new Date(), 'yyyy-MM-dd'),
    fechaFin: format(addDays(new Date(), 30), 'yyyy-MM-dd'), // 30 días por defecto
    materiaPrimaId: ''
  });
  
  // Efecto para cargar datos al montar o cambiar filtros
  useEffect(() => {
    cargarProyecciones();
  }, [filtro]);
  
  // Función para cargar proyecciones
  const cargarProyecciones = async () => {
    setLoading(true);
    try {
      // Obtener proyecciones generales
      const responseProyecciones = await axios.get('/api/inventory/proyecciones', {
        params: {
          fecha_inicio: filtro.fechaInicio,
          fecha_fin: filtro.fechaFin,
          id_materia_prima: filtro.materiaPrimaId || undefined
        }
      });
      
      // Obtener alertas de caducidad
      const responseAlertas = await axios.get('/api/inventory/proyecciones/caducidad', {
        params: {
          dias_alerta: 30
        }
      });
      
      // Obtener informe de reabastecimiento
      const responseReabastecimiento = await axios.get('/api/inventory/proyecciones/reabastecimiento', {
        params: {
          dias_proyeccion: 30,
          umbral_dias: 7
        }
      });
      
      setProyecciones(responseProyecciones.data.proyecciones || []);
      setAlertasCaducidad(responseAlertas.data.alertas_caducidad || []);
      setReabastecimiento(responseReabastecimiento.data.necesidades_reabastecimiento || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar proyecciones:', error);
      setError('Error al cargar las proyecciones de inventario');
      setLoading(false);
    }
  };
  
  // Función para cargar detalle de una materia prima específica
  const cargarDetalleMateriaPrima = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/inventory/proyecciones/materia-prima/${id}`, {
        params: {
          dias: 30
        }
      });
      
      setDetalleMateriaPrima(response.data.proyeccion);
      setShowDetalleModal(true);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar detalle de materia prima:', error);
      setError('Error al cargar el detalle de la materia prima');
      setLoading(false);
    }
  };
  
  // Función para manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };
  
  // Preparar datos para gráficos
  const materialesEnRiesgo = proyecciones.filter(p => p.alerta_stock || p.cantidad_por_caducar > 0);
  const datosCaducidad = alertasCaducidad.slice(0, 5).map(a => ({
    name: a.nombre,
    value: a.lotes.reduce((total, lote) => total + lote.cantidad, 0)
  }));
  
  // Preparar datos para gráfico de proyección
  const datosProyeccion = proyecciones.map(p => ({
    name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
    stockActual: p.stock_actual,
    proyeccion: p.proyeccion_stock,
    stockMinimo: p.stock_minimo
  }));
  
  // Modal para detalle de materia prima
  const DetalleModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showDetalleModal ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Detalle de proyección: {detalleMateriaPrima?.nombre}
          </h3>
          <button onClick={() => setShowDetalleModal(false)} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {detalleMateriaPrima && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-500">Stock Actual</p>
                <p className="text-xl font-bold">
                  {detalleMateriaPrima.stock_actual} {detalleMateriaPrima.abreviacion_um}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-500">Consumo Diario</p>
                <p className="text-xl font-bold">
                  {detalleMateriaPrima.consumo_promedio_diario.toFixed(2)} {detalleMateriaPrima.abreviacion_um}
                </p>
              </div>
              <div className={`${detalleMateriaPrima.dias_hasta_nivel_critico <= 7 ? 'bg-red-50' : 'bg-green-50'} rounded-lg p-4`}>
                <p className={`text-sm ${detalleMateriaPrima.dias_hasta_nivel_critico <= 7 ? 'text-red-500' : 'text-green-500'}`}>
                  Días hasta nivel crítico
                </p>
                <p className="text-xl font-bold">
                  {detalleMateriaPrima.dias_hasta_nivel_critico === null 
                    ? 'N/A' 
                    : detalleMateriaPrima.dias_hasta_nivel_critico}
                </p>
              </div>
            </div>
            
            {/* Gráfico de proyección diaria */}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium mb-4">Proyección de Stock (30 días)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={detalleMateriaPrima.proyeccion_diaria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'dd/MM');
                    }}
                    interval={5}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} ${detalleMateriaPrima.abreviacion_um}`, '']}
                    labelFormatter={(value) => `Fecha: ${formatDate(value)}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="stock_proyectado" 
                    name="Stock Proyectado" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="caducidad" 
                    name="Caducidad" 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  {/* Línea horizontal para stock mínimo */}
                  <Line 
                    type="monotone" 
                    dataKey={() => detalleMateriaPrima.stock_minimo} 
                    name="Stock Mínimo" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Tabla de lotes */}
            {detalleMateriaPrima.lotes && detalleMateriaPrima.lotes.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <h4 className="text-lg font-medium p-4 bg-gray-50 border-b">Lotes Disponibles</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caducidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Restantes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detalleMateriaPrima.lotes.map((lote) => (
                        <tr key={lote.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{lote.codigo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lote.cantidad} {detalleMateriaPrima.abreviacion_um}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(lote.fecha_caducidad)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                lote.dias_para_caducidad <= 7 
                                  ? 'bg-red-100 text-red-800' 
                                  : lote.dias_para_caducidad <= 30 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {lote.dias_para_caducidad}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Renderizado condicional para carga y error
  if (loading && proyecciones.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && proyecciones.length === 0) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow text-red-700">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          onClick={cargarProyecciones}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Proyecciones de Inventario</h2>
        <RefreshButton onClick={cargarProyecciones} loading={loading} />
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={filtro.fechaInicio}
            onChange={handleFilterChange}
            className="border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={filtro.fechaFin}
            onChange={handleFilterChange}
            className="border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={cargarProyecciones}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Aplicar Filtros'}
        </button>
      </div>
      
      {/* Tarjetas de resumen */}
      <FadeInUp delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Materiales en Riesgo"
            value={materialesEnRiesgo.length}
            icon="warning"
            color="amber"
          />
          <StatCard
            title="Próximos a Caducar"
            value={alertasCaducidad.reduce((total, mp) => 
              total + mp.lotes.filter(l => l.dias_restantes <= 30).length, 0)}
            icon="calendar"
            color="red"
          />
          <StatCard
            title="Necesitan Reabastecimiento"
            value={reabastecimiento.length}
            icon="shopping-cart"
            color="blue"
          />
        </div>
      </FadeInUp>
      
      {/* Sección de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de proyección de stock */}
        <FadeInUp delay={0.2}>
          <ChartCard title="Proyección de Stock">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosProyeccion.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stockActual" name="Stock Actual" fill="#8884d8" />
                <Bar dataKey="proyeccion" name="Proyección" fill="#82ca9d" />
                <Bar dataKey="stockMinimo" name="Stock Mínimo" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeInUp>
        
        {/* Gráfico de caducidad */}
        <FadeInUp delay={0.3}>
          <ChartCard title="Materiales por Caducar">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosCaducidad}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {datosCaducidad.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </FadeInUp>
      </div>
      
      {/* Lista de materiales */}
      <FadeInUp delay={0.4}>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="p-4 bg-gray-50 border-b text-lg font-medium">Materiales con Proyección</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caducidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proyecciones.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stock_actual} {item.abreviacion_um}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.proyeccion_stock} {item.abreviacion_um}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.cantidad_por_caducar > 0 ? (
                        <span className="text-red-600 font-medium">
                          {item.cantidad_por_caducar} {item.abreviacion_um}
                        </span>
                      ) : (
                        <span className="text-green-600">Sin caducidad próxima</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.alerta_stock ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Alerta Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => cargarDetalleMateriaPrima(item.id)}
                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 text-sm"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInUp>
      
      {/* Modal para detalle */}
      {showDetalleModal && detalleMateriaPrima && <DetalleModal />}
    </div>
  );
};

export default ProyeccionesTab;