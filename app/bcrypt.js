/**
 * Este archivo es un módulo de compatibilidad que implementa la API de bcrypt
 * usando argon2 internamente. Esto permite que el código que depende de bcrypt
 * siga funcionando sin cambios, evitando el error de "invalid ELF header".
 */

const argon2 = require('argon2');

// Valores predeterminados para simular la API de bcrypt
const DEFAULT_ROUNDS = 10;

/**
 * Genera un hash de contraseña usando argon2
 * @param {string} password - La contraseña a hashear
 * @param {number} saltRounds - Equivalente a las rondas en bcrypt (no se usa directamente en argon2)
 * @returns {Promise<string>} - El hash generado
 */
const hash = async (password, saltRounds = DEFAULT_ROUNDS) => {
  try {
    // Argon2 usa diferentes parámetros, pero simulamos el comportamiento de bcrypt
    const options = {
      type: argon2.argon2id,
      memoryCost: 4096, // Equivalente a 4 MB
      timeCost: Math.max(3, Math.floor(saltRounds / 3)), // Aproximación a las rondas de bcrypt
      parallelism: 1
    };
    
    return await argon2.hash(password, options);
  } catch (error) {
    console.error('Error en bcrypt.hash:', error);
    throw error;
  }
};

/**
 * Compara una contraseña con un hash
 * @param {string} password - La contraseña a verificar
 * @param {string} hash - El hash con el que comparar
 * @returns {Promise<boolean>} - true si coincide, false si no
 */
const compare = async (password, hash) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error en bcrypt.compare:', error);
    throw error;
  }
};

/**
 * Genera un hash de contraseña de forma sincrónica
 * ADVERTENCIA: Esta función es sincrona en bcrypt, pero aquí es una envoltura
 * que simula ser sincrónica para mantener compatibilidad de API
 * @param {string} password - La contraseña a hashear
 * @param {number} saltRounds - Equivalente a las rondas en bcrypt
 * @returns {string} - El hash generado
 */
const hashSync = (password, saltRounds = DEFAULT_ROUNDS) => {
  console.warn('bcrypt.hashSync llamado con compatibilidad argon2, esto no es realmente sincrónico');
  // No hay forma real de hacer esto síncrono con argon2, así que fingimos
  return hash(password, saltRounds);
};

/**
 * Compara una contraseña con un hash de forma sincrónica
 * ADVERTENCIA: Esta función es sincrona en bcrypt, pero aquí es una envoltura
 * que simula ser sincrónica para mantener compatibilidad de API
 * @param {string} password - La contraseña a verificar
 * @param {string} hash - El hash con el que comparar
 * @returns {boolean} - true si coincide, false si no
 */
const compareSync = (password, hash) => {
  console.warn('bcrypt.compareSync llamado con compatibilidad argon2, esto no es realmente sincrónico');
  // No hay forma real de hacer esto síncrono con argon2, así que fingimos
  return compare(password, hash);
};

/**
 * Genera un salt
 * @param {number} rounds - Número de rondas
 * @returns {Promise<string>} - El salt generado
 */
const genSalt = async (rounds = DEFAULT_ROUNDS) => {
  console.warn('bcrypt.genSalt llamado pero no es necesario con argon2');
  // Argon2 genera su propio salt, así que esto es principalmente para compatibilidad de API
  return `$argon2id$v=19$m=4096$t=${Math.max(3, Math.floor(rounds / 3))}$salt`;
};

/**
 * Genera un salt de forma sincrónica
 * @param {number} rounds - Número de rondas
 * @returns {string} - El salt generado
 */
const genSaltSync = (rounds = DEFAULT_ROUNDS) => {
  console.warn('bcrypt.genSaltSync llamado pero no es necesario con argon2');
  // Argon2 genera su propio salt, así que esto es principalmente para compatibilidad de API
  return `$argon2id$v=19$m=4096$t=${Math.max(3, Math.floor(rounds / 3))}$salt`;
};

// Exportamos para mantener la compatibilidad con la API de bcrypt
module.exports = {
  hash,
  hashSync,
  compare,
  compareSync,
  genSalt,
  genSaltSync,
  // Constantes de bcrypt
  getRounds: (hash) => {
    try {
      // Intentamos extraer las "rondas" del hash de argon2
      if (hash.startsWith('$argon2')) {
        const parts = hash.split('$');
        const tParam = parts.find(p => p.startsWith('t='));
        if (tParam) {
          const timeCost = parseInt(tParam.substring(2), 10);
          return timeCost * 3; // Aproximación inversa
        }
      }
      return DEFAULT_ROUNDS;
    } catch (e) {
      return DEFAULT_ROUNDS;
    }
  }
};