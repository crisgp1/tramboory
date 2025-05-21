/**
 * index.js
 * Punto de entrada para los componentes auxiliares de reservación
 * Centraliza las importaciones y exportaciones de componentes auxiliares del stepper
 */

// Importar todos los componentes auxiliares
import StepIndicator from './StepIndicator';
import SummarySidebar from './SummarySidebar';

// Exportar componentes individualmente
export {
  StepIndicator,
  SummarySidebar
};

/**
 * Componentes de modales relacionados con la reservación
 * Estos se importan directamente desde el directorio principal de reservación
 * ya que son componentes más específicos
 */
export const getModals = () => {
  const modalImports = Promise.all([
    import('../TuesdayModal'),
    import('../PaymentModal'),
    import('../ConfirmationModal'),
    import('../ContractModal'),
    import('../QuotationConfirmationModal')
  ]);
  
  return modalImports.then(([
    TuesdayModal,
    PaymentModal,
    ConfirmationModal,
    ContractModal,
    QuotationConfirmationModal
  ]) => ({
    TuesdayModal: TuesdayModal.default,
    PaymentModal: PaymentModal.default,
    ConfirmationModal: ConfirmationModal.default,
    ContractModal: ContractModal.default,
    QuotationConfirmationModal: QuotationConfirmationModal.default
  }));
};

/**
 * Función para generar un conjunto de elementos para el indicador de pasos
 * @param {Array} steps - Array de objetos de pasos con al menos una propiedad 'label'
 * @param {number} currentStepIndex - Índice del paso actual (base 0)
 * @returns {Array} - Array de elementos de paso formateados para el indicador
 */
export const generateStepItems = (steps, currentStepIndex) => {
  if (!Array.isArray(steps)) return [];
  
  return steps.map((step, index) => ({
    label: step.label || `Paso ${index + 1}`,
    isCompleted: index < currentStepIndex,
    isCurrent: index === currentStepIndex,
    isPending: index > currentStepIndex
  }));
};

/**
 * Función para calcular el progreso total de la reservación
 * @param {number} currentStepIndex - Índice del paso actual (base 0)
 * @param {number} totalSteps - Número total de pasos
 * @returns {number} - Porcentaje de progreso (0-100)
 */
export const calculateProgress = (currentStepIndex, totalSteps) => {
  if (totalSteps <= 0) return 0;
  return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
};

/**
 * Función para determinar si un paso es navegable (puede ser accedido directamente)
 * @param {number} targetStepIndex - Índice del paso objetivo
 * @param {number} currentStepIndex - Índice del paso actual 
 * @param {Array} validSteps - Array de índices de pasos que son válidos para navegar
 * @returns {boolean} - true si el paso puede ser accedido
 */
export const isStepNavigable = (targetStepIndex, currentStepIndex, validSteps = []) => {
  // Siempre se puede navegar hacia atrás
  if (targetStepIndex < currentStepIndex) return true;
  
  // Si es el paso actual, ya estamos ahí
  if (targetStepIndex === currentStepIndex) return true;
  
  // Si el paso objetivo está en la lista de pasos válidos
  if (validSteps.includes(targetStepIndex)) return true;
  
  // Por defecto, no permitir navegación hacia adelante
  return false;
};

/**
 * Función para agrupar elementos de resumen por categoría
 * @param {Object} formValues - Valores del formulario de reservación
 * @param {Object} options - Objetos con opciones disponibles (paquetes, temáticas, etc.)
 * @returns {Object} - Objeto con elementos agrupados por categoría
 */
export const groupSummaryItems = (formValues, options) => {
  const { packages, tematicas, mamparas, foodOptions, extras } = options;
  
  return {
    package: {
      title: 'Paquete',
      item: packages?.find(pkg => pkg.id === formValues.id_paquete),
      price: formValues.packagePrice || 0,
      formatter: 'package'
    },
    datetime: {
      title: 'Fecha y Hora',
      date: formValues.fecha_reserva,
      time: formValues.hora_inicio,
      tuesdayFee: formValues.tuesdayFee || 0,
      formatter: 'datetime'
    },
    theme: {
      title: 'Temática',
      item: tematicas?.find(tema => tema.id === formValues.id_tematica),
      formatter: 'theme'
    },
    mampara: {
      title: 'Mampara',
      item: mamparas?.find(mampara => mampara.id === formValues.id_mampara),
      formatter: 'mampara'
    },
    food: {
      title: 'Alimentos',
      item: foodOptions?.find(food => food.id === formValues.id_opcion_alimento),
      formatter: 'food'
    },
    extras: {
      title: 'Extras',
      items: formValues.extras?.map(extra => {
        const extraInfo = extras?.find(e => e.id === extra.id);
        return {
          ...extraInfo,
          cantidad: extra.cantidad
        };
      }).filter(Boolean) || [],
      formatter: 'extras'
    },
    celebrant: {
      title: 'Festejado',
      nombre: formValues.nombre_festejado,
      edad: formValues.edad_festejado,
      sexo: formValues.sexo_festejado,
      color: formValues.color_favorito,
      detalles: formValues.detalles_especiales,
      formatter: 'celebrant'
    }
  };
};

// Exportar un objeto con todas las utilidades como default
export default {
  StepIndicator,
  SummarySidebar,
  getModals,
  generateStepItems,
  calculateProgress,
  isStepNavigable,
  groupSummaryItems
};