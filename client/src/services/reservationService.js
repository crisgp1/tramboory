import { axiosInstance } from '@/components/axiosConfig';

// Ruta base para las API de reservas
const API_PATH = '/api/reservas';

/**
 * Inicia el proceso de reserva obteniendo un ID provisional
 * @returns {Promise<Object>} Objeto con el ID de reserva provisional
 */
export const initiateReservation = async () => {
  try {
    const response = await axiosInstance.post(`${API_PATH}/initiate`);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar el proceso de reserva:', error);
    throw error;
  }
};

/**
 * Procesa el pago de una reserva
 * @param {Object} paymentData Datos del pago
 * @param {number} paymentData.reservationId ID de la reserva
 * @param {number} paymentData.amount Monto del pago
 * @param {string} paymentData.paymentMethod Método de pago
 * @returns {Promise<Object>} Resultado del procesamiento del pago
 */
export const processPayment = async ({ reservationId, amount, paymentMethod }) => {
  try {
    // Normalizar el método de pago para asegurar compatibilidad
    let metodoPagoNormalizado;
    
    // Verificar si el método de pago ya está normalizado
    if (['transferencia', 'efectivo', 'tarjeta_credito', 'tarjeta_debito'].includes(paymentMethod)) {
      metodoPagoNormalizado = paymentMethod;
    } else {
      // Normalizar desde valores en inglés
      switch(paymentMethod) {
        case 'transfer':
          metodoPagoNormalizado = 'transferencia';
          break;
        case 'cash':
          metodoPagoNormalizado = 'efectivo';
          break;
        case 'credit':
          metodoPagoNormalizado = 'tarjeta_credito';
          break;
        case 'debit':
          metodoPagoNormalizado = 'tarjeta_debito';
          break;
        default:
          metodoPagoNormalizado = 'transferencia'; // Valor por defecto
      }
    }
    
    const response = await axiosInstance.post('/api/pagos', {
      id_reserva: reservationId,
      monto: amount,
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: metodoPagoNormalizado,
      estado: 'completado'
    });
    return response.data;
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    throw error;
  }
};

/**
 * Confirma una reserva después de que el pago ha sido procesado
 * @param {Object} reservationData Datos completos de la reserva
 * @returns {Promise<Object>} Reserva confirmada
 */
export const confirmReservation = async (reservationData) => {
  try {
    // Verificar que el código de seguimiento esté presente
    if (!reservationData.codigo_seguimiento || reservationData.codigo_seguimiento.length !== 10) {
      // Generar un código de seguimiento si no existe o no es válido
      reservationData.codigo_seguimiento = generateTrackingCode();
    }
    
    const response = await axiosInstance.post(`${API_PATH}/confirm`, reservationData);
    return response.data;
  } catch (error) {
    console.error('Error al confirmar la reserva:', error);
    throw error;
  }
};

/**
 * Genera un código de seguimiento de 10 caracteres
 * @returns {string} Código de seguimiento
 */
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

/**
 * Obtiene todas las reservas
 * @returns {Promise<Array>} Lista de reservas
 */
export const getAllReservations = async () => {
  try {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    throw error;
  }
};

/**
 * Obtiene una reserva por su ID
 * @param {number} id ID de la reserva
 * @returns {Promise<Object>} Datos de la reserva
 */
export const getReservationById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la reserva con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene las reservas del usuario autenticado
 * @returns {Promise<Array>} Lista de reservas del usuario
 */
export const getUserReservations = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATH}/user`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las reservas del usuario:', error);
    throw error;
  }
};

/**
 * Actualiza una reserva existente
 * @param {number} id ID de la reserva
 * @param {Object} reservationData Datos actualizados de la reserva
 * @returns {Promise<Object>} Reserva actualizada
 */
export const updateReservation = async (id, reservationData) => {
  try {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, reservationData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la reserva con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Cancela una reserva
 * @param {number} id ID de la reserva
 * @returns {Promise<Object>} Resultado de la cancelación
 */
export const cancelReservation = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar la reserva con ID ${id}:`, error);
    throw error;
  }
};

export default {
  initiateReservation,
  processPayment,
  confirmReservation,
  getAllReservations,
  getReservationById,
  getUserReservations,
  updateReservation,
  cancelReservation
};