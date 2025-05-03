/**
 * Utilidades para generar códigos de seguimiento y referencias
 */

/**
 * Genera un código de seguimiento único con un prefijo específico
 * @param {string} prefix - Prefijo para el código (ej: 'COT', 'RES')
 * @returns {string} - Código de seguimiento único
 */
function generateTrackingCode(prefix = 'COT') {
  // Obtener fecha actual
  const now = new Date();
  
  // Extraer componentes de fecha
  const year = now.getFullYear().toString().slice(2); // Últimos 2 dígitos del año
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Generar parte aleatoria (5 dígitos)
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  
  // Construir código: PREFIX-YYMMDD-XXXXX
  return `${prefix}-${year}${month}${day}-${randomPart}`;
}

/**
 * Genera un token de transacción único
 * @returns {string} - Token de transacción único
 */
function generateTransactionToken() {
  // Obtener timestamp actual en milisegundos
  const timestamp = Date.now().toString(36);
  
  // Generar parte aleatoria
  const randomPart = Math.random().toString(36).substring(2, 10);
  
  // Construir token
  return `${timestamp}-${randomPart}`.toUpperCase();
}

module.exports = {
  generateTrackingCode,
  generateTransactionToken
};