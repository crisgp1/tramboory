import { io } from 'socket.io-client';

let socket;

/**
 * Inicializa la conexión Socket.IO con el servidor
 * @param {string} serverUrl - URL del servidor al que conectarse (opcional, usa la URL base de la aplicación por defecto)
 * @returns {Object} El objeto socket para su uso en otros componentes
 */
export const initSocket = (serverUrl = '') => {
  // Si ya existe una conexión, no crear una nueva
  if (socket) return socket;

  // Determinar la URL del servidor
  const url = serverUrl || import.meta.env.VITE_API_URL || window.location.origin.replace(/:\d+$/, ':3001');

  // Crear y configurar la conexión Socket.IO
  socket = io(url, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  // Configurar manejadores de eventos por defecto
  socket.on('connect', () => {
    console.log('Conectado a Socket.IO, ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión Socket.IO:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Desconectado de Socket.IO:', reason);
  });

  return socket;
};

/**
 * Suscribe a un evento Socket.IO
 * @param {string} event - Nombre del evento
 * @param {Function} callback - Función a ejecutar cuando se reciba el evento
 */
export const subscribe = (event, callback) => {
  if (!socket) {
    console.warn('Socket.IO no inicializado. Llamar a initSocket() primero.');
    return;
  }
  socket.on(event, callback);
};

/**
 * Cancela la suscripción a un evento Socket.IO
 * @param {string} event - Nombre del evento
 * @param {Function} callback - Función que fue registrada (opcional, si se omite se eliminan todos los handlers)
 */
export const unsubscribe = (event, callback) => {
  if (!socket) {
    console.warn('Socket.IO no inicializado. Llamar a initSocket() primero.');
    return;
  }
  
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

/**
 * Cierra la conexión Socket.IO
 */
export const disconnect = () => {
  if (!socket) return;
  
  socket.disconnect();
  socket = null;
};

/**
 * Obtiene el objeto socket para uso directo
 * @returns {Object|null} El objeto socket o null si no está inicializado
 */
export const getSocket = () => socket;

/**
 * Emite un evento al servidor
 * @param {string} event - Nombre del evento
 * @param {any} data - Datos a enviar con el evento
 */
export const emit = (event, data) => {
  if (!socket) {
    console.warn('Socket.IO no inicializado. Llamar a initSocket() primero.');
    return;
  }
  socket.emit(event, data);
};

export default {
  initSocket,
  subscribe,
  unsubscribe,
  disconnect,
  getSocket,
  emit
};