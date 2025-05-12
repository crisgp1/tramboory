/**
 * index.js
 * Punto de entrada para los componentes de pasos de reservación
 * Centraliza las importaciones y exportaciones de componentes para un uso más limpio
 */

// Importar todos los componentes de pasos
import PackageStep from './PackageStep';
import DateTimeStep from './DateTimeStep';
import ThemeStep from './ThemeStep';
import MamparaStep from './MamparaStep';
import FoodOptionsStep from './FoodOptionsStep';
import ExtrasStep from './ExtrasStep';
import CelebrantStep from './CelebrantStep';
import ReviewStep from './ReviewStep';

// Exportar todos los componentes individualmente
export {
  PackageStep,
  DateTimeStep,
  ThemeStep,
  MamparaStep,
  FoodOptionsStep,
  ExtrasStep,
  CelebrantStep,
  ReviewStep
};

/**
 * Definición de los pasos con sus respectivos componentes y metadatos
 * Esto proporciona una estructura centralizada para gestionar los pasos
 * @typedef {Object} Step
 * @property {string} id - Identificador único del paso
 * @property {string} label - Etiqueta visible para el paso
 * @property {React.Component} component - Componente a renderizar para este paso
 * @property {string[]} required - Campos requeridos para completar este paso
 * @property {React.Component} icon - Componente de icono para este paso
 */

/**
 * Configuración de pasos disponibles para importar
 * @type {Step[]}
 */
const STEPS = [
  {
    id: 'package',
    label: 'Paquete',
    component: PackageStep,
    required: ['id_paquete'],
    description: 'Selecciona el paquete base para tu evento'
  },
  {
    id: 'datetime',
    label: 'Fecha y Hora',
    component: DateTimeStep,
    required: ['fecha_reserva', 'hora_inicio'],
    description: 'Elige el día y horario para tu celebración'
  },
  {
    id: 'theme',
    label: 'Temática',
    component: ThemeStep,
    required: ['id_tematica'],
    description: 'Personaliza la temática de tu evento'
  },
  {
    id: 'mampara',
    label: 'Mampara',
    component: MamparaStep,
    required: [],
    description: 'Selecciona la mampara decorativa (opcional)'
  },
  {
    id: 'food',
    label: 'Alimentos',
    component: FoodOptionsStep,
    required: [],
    description: 'Elige opciones de alimentos para tus invitados'
  },
  {
    id: 'extras',
    label: 'Extras',
    component: ExtrasStep,
    required: [],
    description: 'Agrega elementos adicionales a tu evento'
  },
  {
    id: 'celebrant',
    label: 'Festejado',
    component: CelebrantStep,
    required: ['nombre_festejado', 'edad_festejado'],
    description: 'Información sobre el/la festejado/a'
  },
  {
    id: 'review',
    label: 'Revisar',
    component: ReviewStep,
    required: [],
    description: 'Revisa los detalles de tu reservación'
  }
];

// Exportar la configuración de pasos como default
export default STEPS;

/**
 * Función para obtener un paso específico por su ID
 * @param {string} stepId - ID del paso a buscar
 * @returns {Step|undefined} - El paso encontrado o undefined
 */
export const getStepById = (stepId) => {
  return STEPS.find(step => step.id === stepId);
};

/**
 * Función para verificar si un paso es válido basado en los valores del formulario
 * @param {Step} step - El paso a validar
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {boolean} - true si todos los campos requeridos tienen valor
 */
export const isStepValid = (step, formValues) => {
  if (!step.required || step.required.length === 0) return true;
  
  return step.required.every(field => {
    const value = formValues[field];
    return value !== null && value !== undefined && value !== '';
  });
};

/**
 * Función para verificar si todos los pasos requeridos están completos
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {boolean} - true si todos los pasos requeridos están completos
 */
export const areAllRequiredStepsValid = (formValues) => {
  const allRequiredFields = STEPS.flatMap(step => step.required);
  
  return allRequiredFields.every(field => {
    const value = formValues[field];
    return value !== null && value !== undefined && value !== '';
  });
};

/**
 * Función para obtener el índice del próximo paso inválido
 * @param {number} currentIndex - Índice actual
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {number} - Índice del próximo paso inválido o -1 si no hay
 */
export const getNextInvalidStepIndex = (currentIndex, formValues) => {
  for (let i = currentIndex + 1; i < STEPS.length; i++) {
    if (!isStepValid(STEPS[i], formValues)) {
      return i;
    }
  }
  return -1;
};