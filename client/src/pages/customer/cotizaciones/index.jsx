import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiPackage, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi';

// Stores
import useCotizacionesStore from '@/store/cotizacionesStore';
import usePreReservasStore from '@/store/preReservasStore';

// Componentes
import ParticlesBackground from '../../public/home-components/decorative/ParticlesBackground';

const CotizacionesPage = () => {
  const navigate = useNavigate();
  
  // Estados del store de cotizaciones
  const { 
    cotizaciones, 
    obtenerCotizaciones, 
    convertirAReserva, 
    loading, 
    error 
  } = useCotizacionesStore();
  
  // Estados del store de pre-reservas (para el flujo de pago)
  const { iniciarProcesoPago } = usePreReservasStore();
  
  // Estados locales
  const [procesando, setProcesando] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    const cargarCotizaciones = async () => {
      try {
        await obtenerCotizaciones();
      } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
      }
    };
    
    cargarCotizaciones();
  }, [obtenerCotizaciones]);
  
  // Función para convertir una cotización a reserva
  const handleConvertirAReserva = async (cotizacion) => {
    try {
      setProcesando(true);
      setCotizacionSeleccionada(cotizacion);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al preparar conversión:', error);
      toast.error('Error al preparar la conversión a reserva.');
      setProcesando(false);
    }
  };
  
  // Función para confirmar la conversión a reserva
  const confirmarConversion = async () => {
    try {
      console.log('Iniciando conversión de cotización a reserva:', cotizacionSeleccionada.id);
      
      // Convertir cotización a reserva
      const resultado = await convertirAReserva(cotizacionSeleccionada.id);
      
      console.log('Resultado de conversión:', resultado);
      
      if (!resultado || !resultado.reserva) {
        throw new Error('No se recibió información de la reserva');
      }
      
      // Asegurarse de que la reserva tenga el estado correcto
      const reservaConEstado = {
        ...resultado.reserva,
        estado: 'pendiente'
      };
      
      console.log('Iniciando proceso de pago con reserva:', reservaConEstado);
      
      // Iniciar proceso de pago con la reserva creada
      // Usar 'transferencia' como método de pago para asegurar compatibilidad
      await iniciarProcesoPago(reservaConEstado, 'transferencia');
      
      toast.success('Cotización convertida a reserva. Proceda con el pago.');
      setModalVisible(false);
      
      // Navegar a la página de estado de reserva
      navigate(`/customer/reservationstatus/${resultado.reserva.id}`);
    } catch (error) {
      console.error('Error al convertir cotización:', error);
      toast.error('Error al convertir la cotización a reserva.');
    } finally {
      setProcesando(false);
    }
  };
  
  // Función para formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Función para determinar el color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'creada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expirada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'convertida':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Renderizar modal de confirmación
  const renderModal = () => {
    if (!modalVisible || !cotizacionSeleccionada) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-indigo-800 dark:text-indigo-400">Confirmar Reserva</h2>
          
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que deseas convertir esta cotización en una reserva? 
            Una vez confirmada, procederás al proceso de pago.
          </p>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-6">
            <p className="dark:text-gray-200"><strong>Cotización:</strong> #{cotizacionSeleccionada.codigo_seguimiento}</p>
            <p className="dark:text-gray-200"><strong>Fecha del evento:</strong> {formatearFecha(cotizacionSeleccionada.fecha_evento)}</p>
            <p className="dark:text-gray-200"><strong>Horario:</strong> {cotizacionSeleccionada.hora_inicio} - {cotizacionSeleccionada.hora_fin}</p>
            <p className="dark:text-gray-200"><strong>Total:</strong> ${parseFloat(cotizacionSeleccionada.total).toFixed(2)}</p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setModalVisible(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={procesando}
            >
              Cancelar
            </button>
            
            <button
              onClick={confirmarConversion}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
              disabled={procesando}
            >
              {procesando ? 'Procesando...' : 'Confirmar y Proceder al Pago'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Renderizar tarjeta de cotización
  const renderCotizacionCard = (cotizacion) => {
    return (
      <motion.div 
        key={cotizacion.id}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-4">
          <h3 className="font-bold text-lg">Cotización #{cotizacion.codigo_seguimiento}</h3>
          <p className="text-sm opacity-90">Creada: {formatearFecha(cotizacion.fecha_creacion)}</p>
        </div>
        
        <div className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fecha del Evento</p>
              <p className="font-medium dark:text-white">{formatearFecha(cotizacion.fecha_evento)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Horario</p>
              <p className="font-medium dark:text-white">{cotizacion.hora_inicio} - {cotizacion.hora_fin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paquete</p>
              <p className="font-medium dark:text-white">{cotizacion.paquete_nombre || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="font-bold text-indigo-700 dark:text-indigo-400">${parseFloat(cotizacion.total).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cotizacion.estado)}`}>
              {cotizacion.estado === 'creada' ? 'Activa' : 
               cotizacion.estado === 'expirada' ? 'Expirada' : 
               cotizacion.estado === 'convertida' ? 'Convertida' : cotizacion.estado}
            </span>
            
            {cotizacion.estado === 'creada' && (
              <button
                onClick={() => handleConvertirAReserva(cotizacion)}
                disabled={procesando}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Reservar Ahora
              </button>
            )}
            
            {cotizacion.estado === 'expirada' && (
              <button
                onClick={() => navigate('/customer/reservation')}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Crear Nueva
              </button>
            )}
          </div>
          
          {cotizacion.estado === 'expirada' && (
            <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400">
              <FiAlertCircle className="mr-1" />
              <span>Esta cotización ha expirado</span>
            </div>
          )}
          
          {cotizacion.fecha_expiracion && cotizacion.estado === 'creada' && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Expira: {formatearFecha(cotizacion.fecha_expiracion)}
            </div>
          )}
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ParticlesBackground color="#4f46e5" />
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Cabecera */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span>Volver al Dashboard</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-400 mb-4">
            Mis Cotizaciones
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Aquí puedes ver todas tus cotizaciones activas y convertirlas en reservas cuando estés listo para confirmar.
          </p>
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        )}
        
        {/* Mensaje de error */}
        {error && !loading && (
          <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Sin cotizaciones */}
        {!loading && !error && cotizaciones.length === 0 && (
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No tienes cotizaciones</h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Crea una cotización para tu evento y recibe un presupuesto sin compromiso.
            </p>
            
            <button
              onClick={() => navigate('/customer/reservation')}
              className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Crear Nueva Cotización
            </button>
          </div>
        )}
        
        {/* Lista de cotizaciones */}
        {!loading && !error && cotizaciones.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cotizaciones.map(renderCotizacionCard)}
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/customer/reservation')}
                className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Crear Nueva Cotización
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Modal de confirmación */}
      {renderModal()}
    </div>
  );
};

export default CotizacionesPage;