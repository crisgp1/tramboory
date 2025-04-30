import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { gsap } from 'gsap';
import axiosInstance from '@/components/axiosConfig';
import { toast } from 'react-hot-toast';
import {
  FiDollarSign,
  FiCreditCard,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiLoader
} from 'react-icons/fi';

// Crear un contexto para la reserva
export const ReservationContext = createContext(null);

// Hook personalizado para acceder al contexto de reserva
export const useReservation = () => useContext(ReservationContext);

// Recibimos props como objeto completo en lugar de desestructurarlo incorrectamente
const PaymentModal = (props) => {
  // Desestructuramos las propiedades que necesitamos del objeto props
  const {
    reservationData,
    onCancel,
    onConfirm,
    isOpen,
    onClose,
    onSuccess,
    amount,
    formData,
    reservaId: explicitReservaId // Aceptar ID explícito
  } = props;
  
  // Estado para mensajes de error y carga
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [loadedReservation, setLoadedReservation] = useState(null);
  
  // Intentar acceder al contexto de reserva si está disponible
  const reservationContext = useContext(ReservationContext);
  const modalRef = useRef(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use provided handlers or fallback to expected prop names
  const handleCancel = onClose || onCancel;
  const handleConfirmSuccess = onSuccess || onConfirm;
  const CLABE = '646016206867172653';
  const ADDRESS = 'P.º Solares 1639, Solares Residencial, 45019 Zapopan, Jal.';

  // Código de depuración mejorado
  useEffect(() => {
    console.log('PaymentModal - Datos completos:', {
      propsCompleto: props,
      reservationData: reservationData,
      formData: formData,
      // Mostrar todas las propiedades disponibles
      propiedadesDisponibles: Object.keys(props)
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Add event listener for escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscKey);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleCancel]);

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(CLABE);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2000);
  };

  // Efecto para cargar la reserva si tenemos un ID explícito pero no tenemos los datos completos
  useEffect(() => {
    const fetchReservationIfNeeded = async () => {
      // Si ya tenemos datos de reserva completos, no necesitamos cargar
      if (reservationData && reservationData.id) return;
      
      // Si tenemos un ID explícito, intentamos cargar la reserva
      if (explicitReservaId && !isLoadingReservation && !loadedReservation) {
        setIsLoadingReservation(true);
        try {
          console.log('Cargando datos de reserva con ID:', explicitReservaId);
          const response = await axiosInstance.get(`/api/reservas/${explicitReservaId}`);
          if (response && response.data) {
            console.log('Datos de reserva cargados:', response.data);
            setLoadedReservation(response.data);
          }
        } catch (error) {
          console.error('Error al cargar datos de reserva:', error);
          setErrorMessage('No se pudieron cargar los datos de la reserva');
        } finally {
          setIsLoadingReservation(false);
        }
      }
    };
    
    fetchReservationIfNeeded();
  }, [explicitReservaId, reservationData, isLoadingReservation, loadedReservation]);

  const handleConfirm = async () => {
    if (!paymentMethod || isProcessing) return;
    setIsProcessing(true);

    try {
      // Diagnóstico mejorado del ID de reserva
      console.log('Intentando obtener ID de reserva:', {
        reservationDataCompleto: reservationData,
        loadedReservation: loadedReservation,
        formDataCompleto: formData,
        propsCompletos: props,
        explicitReservaId: explicitReservaId,
        reservationContext: reservationContext,
        urlParams: new URLSearchParams(window.location.search)
      });
      
      // Intenta extraer el ID de todas las fuentes posibles - LÓGICA MEJORADA
      let reservaId;
      
      // 0. Usar ID explícito si está disponible (máxima prioridad)
      if (explicitReservaId) {
        reservaId = explicitReservaId;
        console.log('Usando ID explícito:', reservaId);
      }
      
      // 1. Usar reserva cargada si está disponible
      if (!reservaId && loadedReservation && loadedReservation.id) {
        reservaId = loadedReservation.id;
        console.log('ID extraído de loadedReservation:', reservaId);
      }
      
      // 2. Usar contexto de reserva si está disponible
      if (!reservaId && reservationContext && reservationContext.id) {
        reservaId = reservationContext.id;
        console.log('ID extraído de reservationContext:', reservaId);
      }
      
      // 3. Buscar en reservationData
      if (!reservaId && reservationData && typeof reservationData === 'object') {
        reservaId = reservationData.id;
        console.log('ID extraído de reservationData.id:', reservaId);
      }
      
      // 4. Buscar el ID en formData
      if (!reservaId && formData && formData.id) {
        reservaId = formData.id;
        console.log('ID extraído de formData.id:', reservaId);
      }
      
      // 5. Buscar directamente en props
      if (!reservaId && props.id) {
        reservaId = props.id;
        console.log('ID extraído de props.id:', reservaId);
      }
      
      // 6. Buscar en props.reserva
      if (!reservaId && props.reserva && props.reserva.id) {
        reservaId = props.reserva.id;
        console.log('ID extraído de props.reserva.id:', reservaId);
      }
      
      // 7. Intentar obtener de URL params
      if (!reservaId) {
        const urlParams = new URLSearchParams(window.location.search);
        reservaId = urlParams.get('reservaId') || urlParams.get('id');
        if (reservaId) {
          console.log('ID extraído de URL params:', reservaId);
        }
      }
      
      // 8. Último recurso: buscar en localStorage
      if (!reservaId) {
        const storedReservationData = localStorage.getItem('currentReservation');
        if (storedReservationData) {
          try {
            const parsedData = JSON.parse(storedReservationData);
            reservaId = parsedData.id || parsedData.reservaId || parsedData.id_reserva;
            console.log('ID extraído de localStorage:', reservaId);
          } catch (e) {
            console.log('Error al parsear datos de localStorage:', e);
          }
        }
      }
      
      // Validaciones previas al envío
      if (!reservaId) {
        console.error('No se pudo encontrar el ID de reserva en ninguna fuente');
        setErrorMessage('ID de reserva no disponible - Verifique que los datos de la reserva fueron pasados correctamente');
        throw new Error('ID de reserva no disponible - Verifique que los datos de la reserva fueron pasados correctamente al componente');
      }
      
      // Validar que el ID sea un número o se pueda convertir a número
      if (isNaN(Number(reservaId))) {
        console.error('El ID de reserva no es un número válido:', reservaId);
        setErrorMessage('El ID de reserva debe ser un número válido');
        throw new Error('El ID de reserva debe ser un número válido');
      }
      
      // Validar que el ID no sea un timestamp de fecha (demasiado grande)
      if (reservaId && Number(reservaId) > 1000000000000) {
        console.error('ID sospechosamente grande, posible timestamp de fecha:', reservaId);
        setErrorMessage('ID de reserva inválido (posible confusión con fecha)');
        throw new Error('ID de reserva inválido (posible confusión con fecha)');
      }
      
      // Usar el ID encontrado
      const id_reserva = Number(reservaId); // Convertir explícitamente a número
      
      // Obtener el monto - LÓGICA MEJORADA
      const monto = amount ||
                   (loadedReservation && loadedReservation.total) ||
                   (reservationData && reservationData.total) ||
                   (formData && formData.total) ||
                   (formData && formData.monto) ||
                   (reservationContext && reservationContext.total);
      
      // Validar el monto
      if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        console.error('Monto de pago inválido:', monto);
        setErrorMessage('El monto debe ser un número mayor que cero');
        throw new Error('Monto de pago inválido - Verifique que el monto fue pasado correctamente');
      }
      
      // Validar método de pago
      if (!paymentMethod) {
        console.error('Método de pago no seleccionado');
        setErrorMessage('Por favor seleccione un método de pago');
        throw new Error('Método de pago no seleccionado');
      }
      
      // Crear el payload con conversiones explícitas de tipos
      const payloadData = {
        id_reserva: Number(id_reserva), // Asegurar que sea número
        monto: Number(parseFloat(monto).toFixed(2)), // Asegurar que sea número con 2 decimales
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: paymentMethod === 'transfer' ? 'transferencia' : 'efectivo',
        estado: 'completado', // Crear directamente como completado
      };
      
      // Log detallado para depuración
      console.log('Payload completo enviado al servidor:', JSON.stringify(payloadData, null, 2));
      console.log('Tipos de datos en payload:', {
        id_reserva_type: typeof payloadData.id_reserva,
        id_reserva_value: payloadData.id_reserva,
        monto_type: typeof payloadData.monto,
        monto_value: payloadData.monto,
        metodo_pago_type: typeof payloadData.metodo_pago,
        metodo_pago_value: payloadData.metodo_pago,
        fecha_pago_type: typeof payloadData.fecha_pago,
        fecha_pago_value: payloadData.fecha_pago
      });
      
      // Enviar la petición con manejo de errores mejorado
      try {
        // Verificar la URL correcta para el servicio de pagos
        const response = await axiosInstance.post('/api/pagos', payloadData);
        
        console.log('Respuesta del servidor:', response.data);
        
        if (response && response.data) {
          toast.success('¡Pago registrado exitosamente!');
          setErrorMessage(''); // Limpiar cualquier error previo
          if (handleConfirmSuccess) {
            handleConfirmSuccess(); // Call success handler if provided
          } else {
            handleCancel(); // Cerrar el modal después de completar el pago
          }
        }
      } catch (error) {
        console.error('Error detallado al procesar el pago:', error);
        
        // Extraer y mostrar información detallada del error
        if (error.response) {
          console.error('Datos de la respuesta de error:', error.response.data);
          console.error('Estado HTTP:', error.response.status);
          console.error('Cabeceras:', error.response.headers);
          toast.error(`Error ${error.response.status}: ${error.response.data.error || 'Error al procesar el pago'}`);
          setErrorMessage(error.response.data.error || 'Error al procesar el pago');
        } else if (error.request) {
          console.error('No se recibió respuesta. Request:', error.request);
          toast.error('No se recibió respuesta del servidor');
          setErrorMessage('No se recibió respuesta del servidor. Verifique su conexión.');
        } else {
          console.error('Error al configurar la petición:', error.message);
          toast.error(`Error: ${error.message}`);
          setErrorMessage(error.message || 'Error al procesar el pago');
        }
      }
    } catch (error) {
      console.error('Error en la preparación del pago:', error);
      
      // Mostrar mensaje de error más específico si está disponible
      if (!errorMessage) { // Solo mostrar si no se ha establecido un mensaje de error específico
        if (error.response && error.response.data && error.response.data.error) {
          toast.error(`Error: ${error.response.data.error}`);
        } else if (error.message) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error('Error al procesar el pago');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentOption = ({ value, title, icon: Icon, description }) => (
    <button
      onClick={() => setPaymentMethod(value)}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
        paymentMethod === value
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${
            paymentMethod === value ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h3 className={`font-medium ${paymentMethod === value ? 'text-indigo-600' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className="text-indigo-600 text-2xl" />
            <h2 className="text-2xl font-bold text-indigo-700">Método de Pago</h2>
          </div>
          <p className="text-gray-600">
            Selecciona tu método de pago preferido para completar la reserva.
          </p>
          <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-100">
            <span className="text-gray-700">Total a pagar: </span>
            <span className="font-bold text-indigo-600 text-lg">
              {formatCurrency(amount || (reservationData && reservationData.total) || 0)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Options */}
          <div className="space-y-4">
            <PaymentOption
              value="transfer"
              title="Transferencia Bancaria"
              icon={FiCreditCard}
              description="Realiza una transferencia bancaria desde tu aplicación"
            />
            <PaymentOption
              value="cash"
              title="Pago en Efectivo"
              icon={FiDollarSign}
              description="Paga en efectivo directamente en nuestra sucursal"
            />
          </div>

          {/* Payment Details */}
          {paymentMethod && (
            <div className="mt-6 animate-fadeIn">
              {paymentMethod === 'transfer' ? (
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <FiInfo className="text-indigo-600" />
                    Información para Transferencia
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">CLABE Interbancaria:</p>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                      <span className="font-mono text-lg">{CLABE}</span>
                      <button
                        onClick={handleCopyClabe}
                        className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copiar CLABE"
                      >
                        {copiedClabe ? (
                          <FiCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <FiCopy className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      * Una vez realizada la transferencia, conserva tu comprobante.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <FiMapPin className="text-indigo-600" />
                    Dirección de Pago
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{ADDRESS}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    * Horario de atención: Lunes a Viernes de 9:00 AM a 6:00 PM
                  </p>
                </div>
              )}
            </div>
          )}

          {isLoadingReservation ? (
            <div className="text-indigo-600 flex items-center gap-2 bg-indigo-50 p-4 rounded-lg">
              <FiLoader className="animate-spin" />
              <span>Cargando datos de la reserva...</span>
            </div>
          ) : (
            <>
              {!paymentMethod && (
                <div className="text-amber-600 flex items-center gap-2 bg-amber-50 p-4 rounded-lg">
                  <FiAlertCircle />
                  <span>Por favor, selecciona un método de pago para continuar</span>
                </div>
              )}
              
              {/* Mostrar mensaje de error si existe */}
              {errorMessage && (
                <div className="text-red-600 flex items-center gap-2 bg-red-50 p-4 rounded-lg mt-4">
                  <FiAlertCircle />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {/* Mostrar información de la reserva si está disponible */}
              {(loadedReservation || reservationData) && (
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium text-green-800 mb-2">Detalles de la Reserva:</h3>
                  <p className="text-green-700">
                    ID: {loadedReservation?.id || reservationData?.id || explicitReservaId || 'No disponible'}
                  </p>
                  {(loadedReservation?.nombre_festejado || reservationData?.nombre_festejado) && (
                    <p className="text-green-700">
                      Festejado: {loadedReservation?.nombre_festejado || reservationData?.nombre_festejado}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center gap-2"
          >
            <FiX className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!paymentMethod || isProcessing}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
              paymentMethod && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            } transition duration-300`}
          >
            <FiCheck className="w-5 h-5" />
            {isProcessing ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
