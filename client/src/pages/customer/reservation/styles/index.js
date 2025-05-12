/**
 * index.js
 * Punto de entrada para todos los estilos del módulo de reservación
 * Centraliza las importaciones y exportaciones de estilos para un uso más fácil en los componentes
 */

// Importar estilos de módulos
import stepperStyles from './StepperReservation.module.css';
import stepComponentStyles from './StepComponents.module.css';
import uiStyles from './UI.module.css';

// Importar animaciones
import './animations.css';

// Importar variables
import variables from './variables';

/**
 * Objeto que contiene todos los estilos para el stepper de reservación
 */
const styles = {
  // Módulos principales
  stepper: stepperStyles,
  steps: stepComponentStyles,
  ui: uiStyles,
  
  // Variables y utilidades
  variables,
  
  // Acceso directo a variables comunes
  colors: variables.COLORS,
  breakpoints: variables.BREAKPOINTS,
  mediaQueries: variables.MEDIA_QUERIES,
  spacing: variables.SPACING,
  fontSizes: variables.FONT_SIZES,
  shadows: variables.SHADOWS,
  radius: variables.BORDER_RADIUS,
  zIndex: variables.Z_INDEX,
  
  // Utilidades
  createMediaQuery: variables.createMediaQuery,
  createCSSStyles: variables.createCSSStyles,
};

/**
 * Función auxiliar para combinar nombres de clase
 * @param  {...string} classes - Nombres de clase a combinar
 * @returns {string} - Clases combinadas
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Función para crear estilos condicionales
 * @param {Object} conditions - Objeto con condiciones como clave y clases como valor
 * @returns {string} - Clases combinadas para condiciones que son verdaderas
 */
export const cond = (conditions) => {
  return Object.entries(conditions)
    .filter(([_, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(' ');
};

/**
 * Función para aplicar estilos responsivos basados en breakpoints
 * @param {Object} stylesObj - Objeto con breakpoints como clave y clases como valor
 * @returns {string} - Clases combinadas
 * 
 * Ejemplo:
 * responsive({
 *   base: 'text-sm',
 *   md: 'text-base',
 *   lg: 'text-lg'
 * })
 */
export const responsive = (stylesObj) => {
  if (!stylesObj || typeof stylesObj !== 'object') return '';
  
  // Crear clases para cada breakpoint
  const classes = [];
  
  // Clase base (sin media query)
  if (stylesObj.base) {
    classes.push(stylesObj.base);
  }
  
  // Clases para breakpoints
  Object.entries(stylesObj)
    .filter(([key]) => key !== 'base')
    .forEach(([key, value]) => {
      // Agregar clase con el prefijo del breakpoint
      classes.push(`${key}:${value}`);
    });
  
  return classes.join(' ');
};

/**
 * Función para generar estilos de variantes
 * @param {string} baseClass - Clase base
 * @param {string} variant - Nombre de la variante
 * @param {Object} variants - Objeto con las variantes disponibles
 * @returns {string} - Clase combinada
 * 
 * Ejemplo:
 * const buttonVariants = {
 *   primary: 'bg-blue-500 text-white',
 *   secondary: 'bg-gray-200 text-gray-800'
 * };
 * 
 * getVariant('button', 'primary', buttonVariants)
 * // Resultado: 'button button-primary bg-blue-500 text-white'
 */
export const getVariant = (baseClass, variant, variants) => {
  if (!variant || !variants || !variants[variant]) {
    return baseClass;
  }
  
  return `${baseClass} ${baseClass}-${variant} ${variants[variant]}`;
};

/**
 * Función para generar estilos de tamaño
 * @param {string} baseClass - Clase base
 * @param {string} size - Nombre del tamaño
 * @param {Object} sizes - Objeto con los tamaños disponibles
 * @returns {string} - Clase combinada
 * 
 * Ejemplo:
 * const buttonSizes = {
 *   sm: 'text-sm px-2 py-1',
 *   md: 'text-base px-4 py-2',
 *   lg: 'text-lg px-6 py-3'
 * };
 * 
 * getSize('button', 'md', buttonSizes)
 * // Resultado: 'button button-md text-base px-4 py-2'
 */
export const getSize = (baseClass, size, sizes) => {
  if (!size || !sizes || !sizes[size]) {
    return baseClass;
  }
  
  return `${baseClass} ${baseClass}-${size} ${sizes[size]}`;
};

// Exportar estilos como default
export default styles;

// Exportar módulos individuales para uso específico
export {
  stepperStyles,
  stepComponentStyles,
  uiStyles,
  variables
};