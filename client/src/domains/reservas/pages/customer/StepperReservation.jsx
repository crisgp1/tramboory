import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiArrowRight, 
  FiCheck, 
  FiX, 
  FiAlertTriangle, 
  FiInfo, 
  FiShoppingCart, 
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize,
  FiMinimize
} from 'react-icons/fi';

// Componentes de cada paso
import PackageStep from './reservationsteps/PackageStep';
import DateTimeStep from './reservationsteps/DateTimeStep';
import ThemeStep from './reservationsteps/ThemeStep';
import MamparaStep from './reservationsteps/MamparaStep';
import FoodOptionsStep from './reservationsteps/FoodOptionsStep';
import ExtrasStep from './reservationsteps/ExtrasStep';
import CelebrantStep from './reservationsteps/CelebrantStep';
import ReviewStep from './reservationsteps/ReviewStep';

// Componentes auxiliares
import StepIndicator from './reservationcomponents/StepIndicator';
import SummarySidebar from './reservationcomponents/SummarySidebar';
import TuesdayModal from './TuesdayModal';
import PaymentModal from './PaymentModalCustomer';
import ConfirmationModal from './ConfirmationModal';

// Servicios y utilidades
import { useReservationData } from '@shared/hooks/useReservationData';
import { formatters } from '@shared/utils/formatters';

// Definición de los pasos
const STEPS = [
  { id: 'package', label: 'Paquete', component: PackageStep, required: ['id_paquete'], icon: FiShoppingCart },
  { id: 'datetime', label: 'Fecha y Hora', component: DateTimeStep, required: ['fecha_reserva', 'hora_inicio'], icon: FiArrowRight },
  { id: 'theme', label: 'Temática', component: ThemeStep, required: ['id_tematica'], icon: FiArrowRight },
  { id: 'mampara', label: 'Mampara', component: MamparaStep, required: [], icon: FiArrowRight },
  { id: 'food', label: 'Alimentos', component: FoodOptionsStep, required: [], icon: FiArrowRight },
  { id: 'extras', label: 'Extras', component: ExtrasStep, required: [], icon: FiArrowRight },
  { id: 'celebrant', label: 'Festejado', component: CelebrantStep, required: ['nombre_festejado', 'edad_festejado'], icon: FiArrowRight },
  { id: 'review', label: 'Revisar', component: ReviewStep, required: [], icon: FiCheck }
];

const StepperReservation = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'tuesday', 'payment', 'confirmation'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false); // Para toggle del resumen en móvil
  const [isFullscreen, setIsFullscreen] = useState(false); // Para modo pantalla completa

  // Obtener datos para el formulario de reserva
  const { 
    packages, 
    tematicas, 
    mamparas, 
    foodOptions,
    extras,
    loading, 
    error, 
    unavailableDates,
    existingReservations,
    createReservation,
  } = useReservationData();
  
  // Configurar el formulario con react-hook-form
  const methods = useForm({
    defaultValues: {
      id_paquete: null,
      fecha_reserva: null,
      hora_inicio: null,
      id_tematica: null,
      id_mampara: null,
      id_opcion_alimento: null,
      extras: [],
      nombre_festejado: '',
      edad_festejado: '',
      sexo_festejado: '',
      color_favorito: '',
      detalles_especiales: '',
      tuesdayFee: 0,
      packagePrice: 0
    }
  });
  
  const { watch, setValue, handleSubmit, formState } = methods;
  
  // Valores actuales del formulario
  const formValues = watch();
  
  // Efecto para manejar el cálculo de precios del paquete
  useEffect(() => {
    if (formValues.id_paquete && formValues.fecha_reserva) {
      const selectedPackage = packages.find(pkg => pkg.id === formValues.id_paquete);
      if (selectedPackage) {
        // Determinar si es fin de semana
        const day = formValues.fecha_reserva.getDay();
        const isWeekend = day === 0 || day === 5 || day === 6; // Domingo(0), Viernes(5), Sábado(6)
        
        // Establecer precio según el día
        const packagePrice = isWeekend 
          ? parseFloat(selectedPackage.precio_viernes_domingo)
          : parseFloat(selectedPackage.precio_lunes_jueves);
          
        setValue('packagePrice', packagePrice);
      }
    }
  }, [formValues.id_paquete, formValues.fecha_reserva, packages, setValue]);
  
  // Obtener el paso actual
  const currentStep = STEPS[currentStepIndex];
  
  // Verificar si los datos del paso actual son válidos
  const isCurrentStepValid = () => {
    if (!currentStep.required.length) return true;
    
    return currentStep.required.every(field => {
      const value = formValues[field];
      return value !== null && value !== undefined && value !== '';
    });
  };
  
  // Verificar si todos los datos requeridos están completos
  const isFormValid = () => {
    const allRequiredFields = STEPS.flatMap(step => step.required);
    return allRequiredFields.every(field => {
      const value = formValues[field];
      return value !== null && value !== undefined && value !== '';
    });
  };
  
  // Avanzar al siguiente paso
  const nextStep = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      // Si es el último paso, ir al pago
      if (currentStepIndex === STEPS.length - 2) {
        if (isFormValid()) {
          setModalType('payment');
          setIsModalOpen(true);
        } else {
          // Destacar campos requeridos faltantes
          setCurrentStepIndex(STEPS.length - 1); // Ir a la revisión para mostrar errores
        }
      } else {
        // Animación al cambiar de paso
        setCurrentStepIndex(currentStepIndex + 1);
        
        // Auto scroll al inicio del contenido en dispositivos móviles
        if (window.innerWidth < 768) {
          const contentElement = document.getElementById('step-content');
          if (contentElement) {
            contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  };
  
  // Retroceder al paso anterior
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      
      // Auto scroll al inicio del contenido en dispositivos móviles
      if (window.innerWidth < 768) {
        const contentElement = document.getElementById('step-content');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };
  
  // Ir a un paso específico
  const goToStep = (index) => {
    if (index >= 0 && index < STEPS.length) {
      setCurrentStepIndex(index);
      
      // Auto scroll al inicio del contenido en dispositivos móviles
      if (window.innerWidth < 768) {
        const contentElement = document.getElementById('step-content');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };
  
  // Manejar martes con recargo
  const handleTuesdayConfirm = () => {
    setIsModalOpen(false);
    setModalType(null);
    // El valor de tuesdayFee ya se establece en DateTimeStep
  };
  
  // Manejar selección de método de pago
  const handleSelectPaymentMethod = async (paymentMethod) => {
    try {
      // Guardar el método de pago seleccionado
      console.log('Método de pago seleccionado:', paymentMethod);
      
      // Normalizar el método de pago para asegurar compatibilidad
      const normalizedPaymentMethod = paymentMethod === 'transfer' ? 'transferencia' : paymentMethod;
      
      // Guardar el método de pago en el formulario si es necesario
      setValue('payment_method', normalizedPaymentMethod);
      
      // Continuar con el proceso de reserva - convertir a Promise para poder usar await
      return new Promise((resolve, reject) => {
        // Usar el callback de onSubmit para detectar éxito o error
        const onSubmitSuccess = async (data) => {
          try {
            await submitReservation(data);
            resolve(true);
          } catch (error) {
            console.error('Error en el proceso de reserva:', error);
            reject(error);
          }
        };
        
        // Ejecutar handleSubmit con nuestro callback personalizado
        const submitResult = handleSubmit(onSubmitSuccess)();
        
        // Si handleSubmit devuelve una promesa (por validación), manejarla
        if (submitResult && typeof submitResult.catch === 'function') {
          submitResult.catch(reject);
        }
      });
    } catch (error) {
      console.error('Error al seleccionar método de pago:', error);
      throw error; // Re-lanzar para que PaymentModal pueda manejarlo
    }
  };
  
  // Manejar confirmación
  const handleConfirmation = () => {
    setIsModalOpen(false);
    setModalType(null);
    navigate('/customer/reservationstatus', { replace: true });
  };
  
  // Enviar reserva
  // Función para generar un código de seguimiento de exactamente 10 caracteres
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

  const submitReservation = async (data) => {
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // Generar código de seguimiento
      const codigoSeguimiento = generateTrackingCode();
      
      // Preparar comentarios combinando campos adicionales
      let comentarios = '';
      if (data.sexo_festejado) {
        comentarios += `Sexo: ${data.sexo_festejado}. `;
      }
      if (data.color_favorito) {
        comentarios += `Color favorito: ${data.color_favorito}. `;
      }
      if (data.detalles_especiales) {
        comentarios += `Detalles especiales: ${data.detalles_especiales}`;
      }
      
      // Normalizar el método de pago
      let metodoPagoNormalizado;
      switch(data.payment_method) {
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
          metodoPagoNormalizado = 'transferencia';
      }
      
      // Convertir hora_inicio a formato correcto si es "tarde" o "mañana"
      let horaInicio = typeof data.hora_inicio === 'object' ? data.hora_inicio.value : data.hora_inicio;
      if (horaInicio === 'tarde') {
        horaInicio = '14:00:00';
      } else if (horaInicio === 'mañana' || horaInicio === 'manana') {
        horaInicio = '10:00:00';
      }
      
      // Calcular hora_fin (3 horas después de hora_inicio)
      const [horas, minutos, segundos] = horaInicio.split(':').map(Number);
      const horaFin = `${String(horas + 3).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
      
      // Formatear la fecha en formato YYYY-MM-DD
      let fechaReserva = data.fecha_reserva;
      if (fechaReserva instanceof Date) {
        fechaReserva = fechaReserva.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      }
      
      // Adaptar datos para la API
      const reservationData = {
        id_paquete: data.id_paquete,
        fecha_reserva: fechaReserva,
        hora_inicio: horaInicio,
        hora_fin: horaFin, // Añadir hora_fin obligatoria
        id_tematica: data.id_tematica,
        id_mampara: data.id_mampara || null,
        id_opcion_alimento: data.id_opcion_alimento || null,
        nombre_festejado: data.nombre_festejado,
        edad_festejado: parseInt(data.edad_festejado, 10), // Convertir a número
        comentarios: comentarios.trim() || null, // Usar el campo comentarios para datos adicionales
        extras: data.extras || [],
        total: calculateTotal(), // Cambiado de precio_total a total para coincidir con el backend
        estado: 'pendiente', // Campo requerido por el backend
        metodo_pago: metodoPagoNormalizado, // Usar el método de pago normalizado
        codigo_seguimiento: codigoSeguimiento // Añadir código de seguimiento
      };
      
      // Asegurarse de que el código de seguimiento esté presente y tenga el formato correcto
      if (!reservationData.codigo_seguimiento || reservationData.codigo_seguimiento.length !== 10) {
        console.error('Código de seguimiento inválido, generando uno nuevo');
        reservationData.codigo_seguimiento = generateTrackingCode();
      }
      
      console.log('Enviando datos de reserva:', reservationData);
      
      // Validar datos antes de enviar
      if (!reservationData.hora_inicio || !reservationData.hora_fin) {
        throw new Error('Las horas de inicio y fin son obligatorias');
      }
      
      if (!reservationData.fecha_reserva || !/^\d{4}-\d{2}-\d{2}$/.test(reservationData.fecha_reserva)) {
        throw new Error('La fecha de reserva debe estar en formato YYYY-MM-DD');
      }
      
      if (isNaN(reservationData.edad_festejado)) {
        throw new Error('La edad del festejado debe ser un número');
      }
      
      // Enviar a la API
      const result = await createReservation(reservationData);
      
      if (result.success) {
        // Mostrar modal de confirmación
        setModalType('confirmation');
        setIsModalOpen(true);
      } else {
        setApiError(result.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al enviar la reserva:', error);
      setApiError('Ocurrió un error al procesar tu reserva. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calcular el total
  const calculateTotal = () => {
    let total = 0;
    
    // Precio del paquete
    total += parseFloat(formValues.packagePrice || 0);
    
    // Precio de la temática (si tiene)
    const selectedTematica = tematicas.find(tema => tema.id === formValues.id_tematica);
    if (selectedTematica && selectedTematica.precio) {
      total += parseFloat(selectedTematica.precio);
    }
    
    // Precio de la mampara (si seleccionada)
    if (formValues.id_mampara) {
      const selectedMampara = mamparas.find(mampara => mampara.id === formValues.id_mampara);
      if (selectedMampara && selectedMampara.precio) {
        total += parseFloat(selectedMampara.precio);
      }
    }
    
    // Precio de la opción de alimento (si seleccionada)
    if (formValues.id_opcion_alimento) {
      const selectedFoodOption = foodOptions.find(food => food.id === formValues.id_opcion_alimento);
      if (selectedFoodOption && selectedFoodOption.precio_extra) {
        total += parseFloat(selectedFoodOption.precio_extra);
      }
    }
    
    // Precio de extras (si hay)
    if (formValues.extras && formValues.extras.length > 0) {
      formValues.extras.forEach(extra => {
        const extraInfo = extras.find(e => e.id === extra.id);
        if (extraInfo && extraInfo.precio && extra.cantidad) {
          total += parseFloat(extraInfo.precio) * parseInt(extra.cantidad);
        }
      });
    }
    
    // Recargo por martes
    total += parseFloat(formValues.tuesdayFee || 0);
    
    return total;
  };
  
  // Manejar teclado para navegación
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Solo si no hay modales abiertos
      if (!isModalOpen) {
        // Avanzar con Alt+Derecha o Alt+Enter
        if (e.altKey && (e.key === 'ArrowRight' || e.key === 'Enter')) {
          if (isCurrentStepValid()) {
            e.preventDefault();
            nextStep();
          }
        }
        // Retroceder con Alt+Izquierda
        else if (e.altKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          prevStep();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, currentStepIndex, formValues, isCurrentStepValid]);
  
  // Manejar intento de salir con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formState.isDirty]);

  // Escuchar cambios de tamaño de pantalla para ajustes de UI
  useEffect(() => {
    const handleResize = () => {
      // En desktop, asegurar que el resumen siempre esté visible
      if (window.innerWidth >= 1024) {
        setIsSummaryOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle modo pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen) {
      // Si el navegador soporta pantalla completa
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };
  
  // Renderizar el componente actual
  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Error al cargar datos</h3>
              <p className="text-red-700 mt-1">
                {typeof error === 'string' ? error : 'Error desconocido al cargar los datos. Por favor intenta nuevamente.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-200"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    const CurrentStepComponent = currentStep.component;
    
    return (
      <CurrentStepComponent
        packages={packages || []}
        tematicas={tematicas || []}
        mamparas={mamparas || []}
        foodOptions={foodOptions || []}
        extras={extras || []}
        unavailableDates={unavailableDates || []}
        existingReservations={existingReservations || []}
        nextStep={nextStep}
        setIsTuesdayModalOpen={(open) => {
          setModalType('tuesday');
          setIsModalOpen(open);
        }}
        goToStep={goToStep}
        methods={methods}
      />
    );
  };
  
  // Renderizar el progreso en formato de barra para móviles
  const renderMobileProgress = () => {
    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Paso {currentStepIndex + 1} de {STEPS.length}</span>
          <span>{Math.round(progress)}% completado</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Manejar los controles de navegación
  const renderControls = () => {
    const isLastStep = currentStepIndex === STEPS.length - 1;
    const isFirstStep = currentStepIndex === 0;
    
    return (
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
            isFirstStep
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline dark:text-white">Anterior</span>
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsExitWarningOpen(true)}
            className="text-gray-500 hover:text-gray-700 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline dark:text-white">Cancelar</span>
            <FiX className="w-5 h-5 inline sm:hidden" />
          </button>
          
          <button
            type="button"
            onClick={nextStep}
            disabled={!isCurrentStepValid() || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              !isCurrentStepValid() || isSubmitting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isLastStep
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLastStep ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiChevronRight className="w-5 h-5" />
            )}
            <span className="hidden sm:inline dark:text-white">{isLastStep ? 'Confirmar y Pagar' : 'Siguiente'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className={`bg-gradient-to-b from-indigo-50 to-gray-50 dark:from-gray-900 dark:to-black min-h-screen transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <div className="container mx-auto px-0 sm:px-4 max-w-7xl">
          {/* Header con título y controles */}
          <div className="bg-white dark:bg-gray-800 shadow-sm p-4 md:rounded-lg md:mt-4 sticky top-0 z-30 border-b md:border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reserva tu Evento</h1>
              
              <div className="flex items-center gap-2">
                {/* Toggle del resumen en móvil */}
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors lg:hidden"
                  aria-label={isSummaryOpen ? "Ocultar resumen" : "Mostrar resumen"}
                >
                  <FiMenu className="w-5 h-5" />
                </button>
                
                {/* Botón de pantalla completa */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors hidden sm:flex"
                  aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {isFullscreen ? (
                    <FiMinimize className="w-5 h-5" />
                  ) : (
                    <FiMaximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Indicador de pasos para desktop */}
          <div className="hidden md:block my-6 px-4">
            <StepIndicator
              steps={STEPS.map(step => step.label)}
              currentStep={currentStepIndex}
              goToStep={goToStep}
            />
          </div>
          
          {/* Contenedor principal con layout adaptativo */}
          <div className="md:mt-8 md:px-4 relative md:grid md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {/* Sidebar de resumen (fijo en desktop, desplegable en móvil) */}
            <div className={`
              ${isSummaryOpen 
                ? 'fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm' 
                : 'hidden lg:block lg:col-span-1'
              } 
              transition-all duration-300 ease-in-out
            `}>
              <div className={`
                bg-white shadow-lg h-full overflow-y-auto w-full max-w-md ${
                  isSummaryOpen 
                    ? 'animate-slide-in-right ml-auto' 
                    : 'lg:h-auto lg:sticky lg:top-24 lg:rounded-xl lg:shadow-sm'
                }
              `}>
                {/* Cabecera del resumen en móvil */}
                {isSummaryOpen && (
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Resumen de tu Reserva</h2>
                    <button
                      type="button"
                      onClick={() => setIsSummaryOpen(false)}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {/* Contenido del resumen */}
                <div className="p-4">
                  <SummarySidebar
                    formValues={formValues}
                    packages={packages}
                    tematicas={tematicas}
                    mamparas={mamparas}
                    foodOptions={foodOptions}
                    extras={extras}
                    currentStepIndex={currentStepIndex}
                    formatters={formatters}
                    calculateTotal={calculateTotal}
                  />
                </div>
              </div>
            </div>
            
            {/* Área principal de contenido */}
            <div id="step-content" className="md:col-span-3 bg-white dark:bg-gray-800 md:rounded-xl shadow-sm">
              {/* Indicador de progreso para móviles */}
              <div className="p-4 md:hidden">
                {renderMobileProgress()}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paso {currentStepIndex + 1}: <span className="dark:text-white">{STEPS[currentStepIndex].label}</span>
                </h2>
              </div>
              
              {/* Contenido del paso actual */}
              <div className="p-4 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[50vh] sm:min-h-[60vh] flex flex-col"
                  >
                    {renderCurrentStep()}
                  </motion.div>
                </AnimatePresence>
                
                {/* Controles de navegación */}
                {renderControls()}
              </div>
            </div>
          </div>
          
          {/* Información contextual */}
          <div className="p-4 md:mt-8 md:mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex gap-3">
                <FiInfo className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">¿Necesitas ayuda?</h4>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                    Puedes <motion.button
                      onClick={() => {
                        window.open("https://wa.me/523332300243?text=Hola%2C%20necesito%20ayuda%20con%20mi%20reservaci%C3%B3n%20en%20Tramboory.", '_blank', 'noopener,noreferrer');
                      }}
                      className="text-blue-800 dark:text-blue-300 font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300 inline cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      contactarnos por WhatsApp
                    </motion.button> para asistencia personal o navegar entre los pasos usando los botones de navegación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón flotante de resumen en dispositivos móviles */}
      <button
        type="button"
        onClick={() => setIsSummaryOpen(true)}
        className={`fixed bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-indigo-600 dark:bg-indigo-700 text-white lg:hidden ${isSummaryOpen ? 'hidden' : 'flex animate-bounce-subtle'}`}
      >
        <FiShoppingCart className="w-5 h-5" />
        <span className="font-medium dark:text-white">Ver resumen (<span className="dark:text-white">{formatters.formatCurrency(calculateTotal())}</span>)</span>
      </button>
      
      {/* Modales */}
      {isModalOpen && modalType === 'tuesday' && (
        <TuesdayModal
          isOpen={isModalOpen && modalType === 'tuesday'}
          onClose={() => {
            setIsModalOpen(false);
            setModalType(null);
          }}
          onConfirm={handleTuesdayConfirm}
        />
      )}
      
      {isModalOpen && modalType === 'payment' && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => {
            setIsModalOpen(false);
            setModalType(null);
          }}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          loading={isSubmitting}
        />
      )}
      
      {isModalOpen && modalType === 'confirmation' && (
        <ConfirmationModal
          isOpen={isModalOpen && modalType === 'confirmation'}
          onClose={handleConfirmation}
        />
      )}
      
      {/* Modal de advertencia de salida */}
      {isExitWarningOpen && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <FiAlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">¿Seguro que deseas salir?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Si sales ahora, perderás toda la información que has ingresado.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setIsExitWarningOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors sm:order-2"
              >
                Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error API */}
      {apiError && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 p-4 rounded-xl shadow-lg max-w-sm w-full animate-slide-up">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-300">Error</h3>
              <p className="text-red-700 dark:text-red-400 text-sm mt-1">{apiError}</p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        @keyframes zoom-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-zoom-in {
          animation: zoom-in 0.3s ease-out forwards;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </FormProvider>
  );
};

export default StepperReservation;