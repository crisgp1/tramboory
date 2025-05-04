import { create } from 'zustand';
import axios from '../components/axiosConfig';

/**
 * Store para gestionar las pre-reservas y el flujo de pago-primero
 */
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
      const metodoNormalizado = metodoPago === 'transfer' ? 'transferencia' : metodoPago;
      
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