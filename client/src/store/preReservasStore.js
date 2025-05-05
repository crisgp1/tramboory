import { create } from 'zustand';
import axios from '../components/axiosConfig';

/**
 * Store para gestionar las pre-reservas y el flujo de pago-primero
 */
// Función para generar un código de seguimiento de exactamente 10 caracteres
const generateTrackingCode = () => {
  // Obtener fecha actual
  const now = new Date();
  
  // Extraer componentes de fecha (2 dígitos del año, mes y día)
  const year = now.getFullYear().toString().slice(2); // 2 dígitos
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 2 dígitos
  const day = now.getDate().toString().padStart(2, '0'); // 2 dígitos
  
  // Generar parte aleatoria (4 dígitos para completar 10 caracteres en total)
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  
  // Construir código: YYMMDDXXXX (exactamente 10 caracteres)
  return `${year}${month}${day}${randomPart}`;
};

const usePreReservasStore = create((set, get) => ({
  preReserva: null,
  pagoEnProceso: null,
  loading: false,
  error: null,
  
  /**
   * Inicia el proceso de pago creando una pre-reserva y obteniendo los datos para el procesador de pago
   * @param {Object} datosReserva - Datos completos de la reserva
   * @param {string} metodoPago - Método de pago seleccionado
   * @returns {Promise<Object>} - Datos para procesar el pago
   */
  iniciarProcesoPago: async (datosReserva, metodoPago) => {
    set({ loading: true, error: null });
    
    try {
      // Normalizar el método de pago para asegurar compatibilidad
      let metodoNormalizado;
      switch(metodoPago) {
        case 'transfer':
          metodoNormalizado = 'transferencia';
          break;
        case 'cash':
          metodoNormalizado = 'efectivo';
          break;
        case 'credit':
          metodoNormalizado = 'tarjeta_credito';
          break;
        case 'debit':
          metodoNormalizado = 'tarjeta_debito';
          break;
        default:
          metodoNormalizado = metodoPago;
      }
      
      // Formatear la fecha en formato YYYY-MM-DD
      if (datosReserva.fecha_reserva) {
        if (datosReserva.fecha_reserva instanceof Date) {
          datosReserva.fecha_reserva = datosReserva.fecha_reserva.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        }
      }
      
      // Asegurarse de que datosReserva tenga hora_fin si tiene hora_inicio
      if (datosReserva.hora_inicio && !datosReserva.hora_fin) {
        // Convertir hora_inicio a formato correcto si es "tarde" o "mañana"
        let horaInicio = typeof datosReserva.hora_inicio === 'object' ?
          datosReserva.hora_inicio.value : datosReserva.hora_inicio;
          
        if (horaInicio === 'tarde') {
          horaInicio = '14:00:00';
        } else if (horaInicio === 'mañana' || horaInicio === 'manana') {
          horaInicio = '10:00:00';
        }
        
        // Calcular hora_fin (3 horas después de hora_inicio)
        const [horas, minutos, segundos] = horaInicio.split(':').map(Number);
        const horaFin = `${String(horas + 3).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        
        datosReserva.hora_inicio = horaInicio;
        datosReserva.hora_fin = horaFin;
      }
      
      // Convertir edad_festejado a número si es string
      if (datosReserva.edad_festejado && typeof datosReserva.edad_festejado === 'string') {
        datosReserva.edad_festejado = parseInt(datosReserva.edad_festejado, 10);
      }
      
      // Combinar campos adicionales en comentarios
      let comentarios = '';
      if (datosReserva.sexo_festejado) {
        comentarios += `Sexo: ${datosReserva.sexo_festejado}. `;
        delete datosReserva.sexo_festejado;
      }
      if (datosReserva.color_favorito) {
        comentarios += `Color favorito: ${datosReserva.color_favorito}. `;
        delete datosReserva.color_favorito;
      }
      if (datosReserva.detalles_especiales) {
        comentarios += `Detalles especiales: ${datosReserva.detalles_especiales}`;
        delete datosReserva.detalles_especiales;
      }
      
      if (comentarios.trim()) {
        datosReserva.comentarios = comentarios.trim();
      }
      
      // Asegurarse de que haya un código de seguimiento
      if (!datosReserva.codigo_seguimiento) {
        datosReserva.codigo_seguimiento = generateTrackingCode();
      }
      
      const response = await axios.post('/api/pagos/iniciar', {
        datosReserva,
        metodo_pago: metodoNormalizado
      });
      
      set({
        preReserva: {
          ...datosReserva,
          id: response.data.pago.id_pre_reserva
        },
        pagoEnProceso: response.data.pago,
        loading: false
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al iniciar el proceso de pago:', error);
      set({ 
        error: error.response?.data?.message || 'Error al iniciar el proceso de pago', 
        loading: false 
      });
      throw error;
    }
  },
  
  /**
   * Confirma un pago y completa la pre-reserva convirtiéndola en reserva
   * @param {Object} datosPago - Datos del procesador de pago (token, etc)
   * @returns {Promise<Object>} - Datos de la reserva creada
   */
  confirmarPago: async (datosPago) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post('/api/pagos/confirmar', {
        id_pago: get().pagoEnProceso.id,
        ...datosPago
      });
      
      // Limpiar el estado después de confirmar exitosamente
      set({ loading: false, preReserva: null, pagoEnProceso: null });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      set({ 
        error: error.response?.data?.message || 'Error al confirmar el pago', 
        loading: false 
      });
      throw error;
    }
  },
  
  /**
   * Obtiene información de un pago asociado a una pre-reserva
   * @param {number} idPreReserva - ID de la pre-reserva
   * @returns {Promise<Object>} - Datos del pago
   */
  obtenerPagoPorPreReserva: async (idPreReserva) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(`/api/pagos/pre-reserva/${idPreReserva}`);
      set({ 
        pagoEnProceso: response.data.pago,
        loading: false 
      });
      return response.data.pago;
    } catch (error) {
      console.error('Error al obtener pago de pre-reserva:', error);
      set({ 
        error: error.response?.data?.message || 'Error al obtener información del pago', 
        loading: false 
      });
      throw error;
    }
  },
  
  /**
   * Verifica si la pre-reserva actual ha expirado
   * @returns {boolean} - true si ha expirado
   */
  haExpirado: () => {
    const { pagoEnProceso } = get();
    if (!pagoEnProceso || !pagoEnProceso.expiracion) return false;
    
    return new Date() > new Date(pagoEnProceso.expiracion);
  },
  
  /**
   * Limpia los datos de pre-reserva y pago
   */
  limpiarPreReserva: () => {
    set({ preReserva: null, pagoEnProceso: null, error: null });
  }
}));

export default usePreReservasStore;