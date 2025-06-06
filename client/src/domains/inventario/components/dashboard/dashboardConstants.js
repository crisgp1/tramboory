/**
 * Archivo de constantes para el dashboard de inventario
 * Centraliza colores, gradientes y otros valores compartidos
 */

// Paleta de colores para gráficos y elementos visuales
export const COLORS = {
  primary: '#6366F1', // Indigo
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#EF4444',  // Red
  info: '#3B82F6',    // Blue
  purple: '#8B5CF6',  // Violet
  pink: '#EC4899',    // Pink
};

// Array de colores para gráficos
export const CHART_COLORS = [
  COLORS.primary,
  COLORS.success, 
  COLORS.warning,
  COLORS.pink,
  COLORS.purple
];

// Gradientes para gráficos
export const CHART_GRADIENTS = {
  entrada: ['rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.1)'],
  salida: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'],
  warning: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.1)'],
  danger: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)'],
};

// Colores de borde para tarjetas
export const BORDER_COLORS = {
  primary: 'border-indigo-500',
  success: 'border-emerald-500',
  warning: 'border-amber-500',
  danger: 'border-rose-500',
  purple: 'border-violet-500',
  pink: 'border-pink-500',
};

// Mapeo de colores para fondos
export const BG_COLORS = {
  primary: 'bg-indigo-50 dark:bg-indigo-900/40',
  success: 'bg-emerald-50 dark:bg-emerald-900/40',
  warning: 'bg-amber-50 dark:bg-amber-900/40',
  danger: 'bg-rose-50 dark:bg-rose-900/40',
  purple: 'bg-violet-50 dark:bg-violet-900/40',
  pink: 'bg-pink-50 dark:bg-pink-900/40',
};

// Mapeo de colores para texto
export const TEXT_COLORS = {
  primary: 'text-indigo-500 dark:text-indigo-300',
  success: 'text-emerald-500 dark:text-emerald-300',
  warning: 'text-amber-500 dark:text-amber-300',
  danger: 'text-rose-500 dark:text-rose-300',
  purple: 'text-violet-500 dark:text-violet-300',
  pink: 'text-pink-500 dark:text-pink-300',
};