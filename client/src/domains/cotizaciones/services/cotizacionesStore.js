import { create } from 'zustand';
import axiosInstance from '@/components/axiosConfig';
import { toast } from 'react-toastify';

/**
 * Store para gestionar las cotizaciones
 */
const useCotizacionesStore = create((set, get) => ({
  // Estado
  cotizaciones: [],
  cotizacionActual: null,
  loading: false,
  error: null,
  
  /**
   * Crear una nueva cotización
   * @param {Object} cotizacionData - Datos de la cotización
   * @returns {Promise} - Promesa con el resultado
   */
  crearCotizacion: async (cotizacionData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axiosInstance.post('/api/cotizaciones', cotizacionData);
      
      set(state => ({
        loading: false,
        cotizacionActual: response.data.cotizacion,
        cotizaciones: [response.data.cotizacion, ...state.cotizaciones]
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error al crear cotización:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Error al crear la cotización. Por favor, intenta nuevamente.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Obtener todas las cotizaciones del usuario
   * @returns {Promise} - Promesa con el resultado
   */
  obtenerCotizaciones: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axiosInstance.get('/api/cotizaciones');
      
      set({ 
        loading: false, 
        cotizaciones: response.data.cotizaciones 
      });
      
      return response.data.cotizaciones;
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Error al obtener las cotizaciones. Por favor, intenta nuevamente.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Obtener detalles de una cotización específica
   * @param {number} id - ID de la cotización
   * @returns {Promise} - Promesa con el resultado
   */
  obtenerCotizacion: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axiosInstance.get(`/api/cotizaciones/${id}`);
      
      set({ 
        loading: false, 
        cotizacionActual: response.data.cotizacion 
      });
      
      return response.data.cotizacion;
    } catch (error) {
      console.error('Error al obtener cotización:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Error al obtener la cotización. Por favor, intenta nuevamente.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Convertir una cotización en reserva
   * @param {number} id - ID de la cotización
   * @returns {Promise} - Promesa con el resultado
   */
  convertirAReserva: async (id) => {
    set({ loading: true, error: null });
    
    try {
      console.log('Convirtiendo cotización a reserva:', id);
      const response = await axiosInstance.post(`/api/cotizaciones/${id}/convertir`);
      
      console.log('Respuesta de conversión:', response.data);
      
      // Asegurarse de que la reserva tenga todos los campos necesarios
      if (response.data && response.data.reserva) {
        // Asegurar que la reserva tenga el estado correcto
        response.data.reserva.estado = 'pendiente';
        
        // Asegurar que el campo total esté presente (no precio_total)
        if (response.data.reserva.precio_total && !response.data.reserva.total) {
          response.data.reserva.total = response.data.reserva.precio_total;
        }
      }
      
      // Actualizar la lista de cotizaciones para reflejar el cambio de estado
      set(state => ({
        loading: false,
        cotizaciones: state.cotizaciones.map(cotizacion =>
          cotizacion.id === id
            ? { ...cotizacion, estado: 'convertida' }
            : cotizacion
        )
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error al convertir cotización a reserva:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Error al convertir la cotización a reserva. Por favor, intenta nuevamente.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Verificar disponibilidad para una cotización
   * @param {Object} datos - Datos para verificar disponibilidad
   * @returns {Promise} - Promesa con el resultado
   */
  verificarDisponibilidad: async (datos) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axiosInstance.post('/api/cotizaciones/verificar-disponibilidad', datos);
      
      set({ loading: false });
      
      return response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      
      const errorMessage = error.response?.data?.message || 
        'Error al verificar disponibilidad. Por favor, intenta nuevamente.';
      
      set({ 
        loading: false, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Limpiar la cotización actual
   */
  limpiarCotizacionActual: () => {
    set({ cotizacionActual: null });
  },
  
  /**
   * Limpiar errores
   */
  limpiarError: () => {
    set({ error: null });
  }
}));

export default useCotizacionesStore;