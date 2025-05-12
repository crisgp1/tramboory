/**
 * variables.js
 * Variables y constantes de estilo centralizadas para el módulo de reservación
 */

// ==========================================================================
// VARIABLES DE TEMA
// ==========================================================================

/**
 * Paleta de colores principal
 */
export const COLORS = {
  // Colores de marca
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // indigo-500
    600: '#4f46e5', // indigo-600
    700: '#4338ca', // indigo-700
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  
  success: {
    500: '#22c55e', // green-500
    600: '#16a34a', // green-600
    700: '#15803d',
  },
  
  danger: {
    500: '#ef4444', // red-500
    600: '#dc2626', // red-600
    700: '#b91c1c',
  },
  
  warning: {
    500: '#f59e0b', // amber-500
    600: '#d97706', // amber-600
    700: '#b45309',
  },
  
  info: {
    500: '#3b82f6', // blue-500
    600: '#2563eb', // blue-600
    700: '#1d4ed8',
  },
  
  // Escala de grises
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
};

/**
 * Valores de sombra
 */
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
};

/**
 * Valores de border radius
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

/**
 * Valores de espaciado
 */
export const SPACING = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

/**
 * Valores de tipografía (tamaños de fuente)
 */
export const FONT_SIZES = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
};

/**
 * Valores de font-weight
 */
export const FONT_WEIGHTS = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

/**
 * Valores de line-height
 */
export const LINE_HEIGHTS = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// ==========================================================================
// MEDIA QUERIES
// ==========================================================================

/**
 * Breakpoints para media queries
 */
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Media queries predefinidos
 */
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs})`,
  sm: `(min-width: ${BREAKPOINTS.sm})`,
  md: `(min-width: ${BREAKPOINTS.md})`,
  lg: `(min-width: ${BREAKPOINTS.lg})`,
  xl: `(min-width: ${BREAKPOINTS.xl})`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']})`,
  
  xsDown: `(max-width: ${parseFloat(BREAKPOINTS.sm) - 0.1}px)`,
  smDown: `(max-width: ${parseFloat(BREAKPOINTS.md) - 0.1}px)`,
  mdDown: `(max-width: ${parseFloat(BREAKPOINTS.lg) - 0.1}px)`,
  lgDown: `(max-width: ${parseFloat(BREAKPOINTS.xl) - 0.1}px)`,
  xlDown: `(max-width: ${parseFloat(BREAKPOINTS['2xl']) - 0.1}px)`,
  
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  
  motion: '(prefers-reduced-motion: no-preference)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
};

// ==========================================================================
// ANIMACIONES
// ==========================================================================

/**
 * Duraciones de animación
 */
export const ANIMATION_DURATIONS = {
  fastest: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slowest: '700ms',
};

/**
 * Curvas de tiempo (timing functions)
 */
export const ANIMATION_TIMING_FUNCTIONS = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

/**
 * Valores de z-index
 */
export const Z_INDEX = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
};

// ==========================================================================
// UTILIDADES
// ==========================================================================

/**
 * Función para generar estilos CSS personalizados
 * @param {Object} styles - Objeto de estilos
 * @returns {string} - Cadena de estilos CSS
 */
export const createCSSStyles = (styles) => {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value};`)
    .join(' ');
};

/**
 * Función para generar estilos CSS para media queries
 * @param {string} mediaQuery - Media query a aplicar
 * @param {Object} styles - Objeto de estilos
 * @returns {string} - Cadena de media query con estilos CSS
 */
export const createMediaQuery = (mediaQuery, styles) => {
  const cssStyles = createCSSStyles(styles);
  return `@media ${mediaQuery} { ${cssStyles} }`;
};

/**
 * Variables de tema CSS globales (como referencia)
 * Estas variables están definidas en :root en CSS pero se incluyen aquí como referencia
 */
export const CSS_VARIABLES = {
  // Colores
  '--color-primary': COLORS.primary[600],
  '--color-primary-dark': COLORS.primary[700],
  '--color-primary-light': COLORS.primary[500],
  '--color-primary-lightest': COLORS.primary[50],
  
  '--color-success': COLORS.success[500],
  '--color-success-dark': COLORS.success[600],
  
  '--color-danger': COLORS.danger[500],
  '--color-danger-dark': COLORS.danger[600],
  
  '--color-warning': COLORS.warning[500],
  
  '--color-info': COLORS.info[500],
  
  // Grises
  '--color-gray-50': COLORS.gray[50],
  '--color-gray-100': COLORS.gray[100],
  '--color-gray-200': COLORS.gray[200],
  '--color-gray-300': COLORS.gray[300],
  '--color-gray-500': COLORS.gray[500],
  '--color-gray-600': COLORS.gray[600],
  '--color-gray-700': COLORS.gray[700],
  '--color-gray-800': COLORS.gray[800],
  '--color-gray-900': COLORS.gray[900],
  
  // Sombras
  '--shadow-sm': SHADOWS.sm,
  '--shadow-md': SHADOWS.md,
  '--shadow-lg': SHADOWS.lg,
  
  // Border radius
  '--radius-md': BORDER_RADIUS.md,
  '--radius-lg': BORDER_RADIUS.lg,
  '--radius-xl': BORDER_RADIUS.xl,
  '--radius-2xl': BORDER_RADIUS['2xl'],
  '--radius-full': BORDER_RADIUS.full,
  
  // Transiciones
  '--transition-fast': ANIMATION_DURATIONS.fast,
  '--transition-normal': ANIMATION_DURATIONS.normal,
};

export default {
  COLORS,
  SHADOWS,
  BORDER_RADIUS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  BREAKPOINTS,
  MEDIA_QUERIES,
  ANIMATION_DURATIONS,
  ANIMATION_TIMING_FUNCTIONS,
  Z_INDEX,
  CSS_VARIABLES,
};