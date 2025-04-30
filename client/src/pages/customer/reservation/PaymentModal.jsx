import { useEffect, useRef, useState, useContext } from 'react';
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

// Importar el contexto de reserva
import { ReservationContext } from '@/context/reservationContext.jsx';
// Importar servicios de reserva
import { initiateReservation, processPayment, confirmReservation } from '@/services/reservationService';

// Componente PaymentModal simplificado para recibir directamente la reserva
const PaymentModal = (props) => {
  // Desestructuramos las propiedades que necesitamos del objeto props
  const {
    reservation, // Prop principal: objeto de reserva completo
    onCancel,
    onConfirm,
    isOpen,
    onClose,
    onSuccess,
    amount
  } = props;
  
  // Estado para mensajes de error
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  
  // Intentar acceder al contexto de reserva como respaldo
  const reservationContext = useContext(ReservationContext);
  
  // Obtener el objeto de reserva de la prop directa o del contexto
  const reservationData = reservation || reservationContext;
  
  // Extraer el ID de reserva directamente
  const reservationId = reservationData?.id;
  
  // Log de depuración para verificar si tenemos el ID
  useEffect(() => {
    console.log('PaymentModal montado con datos:', {
      reservationDirecto: reservation,
      reservationContext: reservationContext,
      reservationId: reservationId
    });
    
    if (!reservationId) {
      console.error('PaymentModal montado sin ID de reserva válido');
    }
  }, [reservation, reservationContext, reservationId]);
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
    
    // Iniciar el proceso de reserva para obtener un ID provisional
    const initReservation = async () => {
      try {
        if (!reservationId) {
          setIsLoadingReservation(true);
          const response = await initiateReservation();
          console.log('ID de reserva provisional obtenido:', response.reservationId);
          // No podemos modificar props, pero guardamos el ID para usarlo después
          reservationData.id = response.reservationId;
        }
      } catch (error) {
        console.error('Error al iniciar la reserva:', error);
        setErrorMessage('No se pudo iniciar el proceso de reserva');
      } finally {
        setIsLoadingReservation(false);
      }
    };
    
    initReservation();
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

  // Si no tenemos ID de reserva, intentar cargar la reserva desde la URL
  useEffect(() => {
    const fetchReservationIfNeeded = async () => {
      // Si ya tenemos datos de reserva con ID, no necesitamos cargar
      if (reservationId) return;
      
      // Intentar obtener ID de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlReservationId = urlParams.get('reservaId') || urlParams.get('id');
      
      if (urlReservationId && !isLoadingReservation) {
        setIsLoadingReservation(true);
        try {
          console.log('Cargando datos de reserva con ID desde URL:', urlReservationId);
          const response = await axiosInstance.get(`/api/reservas/${urlReservationId}`);
          if (response && response.data) {
            console.log('Datos de reserva cargados:', response.data);
            // No podemos modificar props, pero podemos mostrar un mensaje
            console.log('IMPORTANTE: Usar estos datos en el componente padre');
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
  }, [reservationId, isLoadingReservation]);

  const handleConfirm = async () => {
    if (!paymentMethod || isProcessing) return;
    setIsProcessing(true);

    try {
      // Obtener el ID de reserva (provisional o existente)
      const id_reserva = reservationData?.id || reservationId;
      
      // Verificar que tenemos un ID de reserva válido
      if (!id_reserva) {
        console.error('No se encontró ID de reserva válido');
        setErrorMessage('ID de reserva no disponible - Verifique que los datos de la reserva fueron pasados correctamente');
        throw new Error('ID de reserva no disponible - Verifique que los datos de la reserva fueron pasados correctamente al componente');
      }
      
      console.log('Procesando pago con ID de reserva:', id_reserva);
      
      // Validar que el ID sea un número o se pueda convertir a número
      if (isNaN(Number(id_reserva))) {
        console.error('El ID de reserva no es un número válido:', id_reserva);
        setErrorMessage('El ID de reserva debe ser un número válido');
        throw new Error('El ID de reserva debe ser un número válido');
      }
      
      // Validar que el ID no sea un timestamp de fecha (demasiado grande)
      if (Number(id_reserva) > 1000000000000) {
        console.error('ID sospechosamente grande, posible timestamp de fecha:', id_reserva);
        setErrorMessage('ID de reserva inválido (posible confusión con fecha)');
        throw new Error('ID de reserva inválido (posible confusión con fecha)');
      }
      
      // Obtener el monto - LÓGICA SIMPLIFICADA
      const monto = amount || (reservationData && reservationData.total) || 0;
      
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
      
      // 1. Procesar el pago
      console.log('Procesando pago...');
      const paymentResponse = await processPayment({
        reservationId: Number(id_reserva),
        amount: Number(parseFloat(monto).toFixed(2)),
        paymentMethod: paymentMethod
      });
      
      console.log('Respuesta del procesamiento de pago:', paymentResponse);
      
      // 2. Confirmar la reserva
      console.log('Confirmando reserva...');
      
      // Preparar los datos de la reserva para confirmar
      const reservationDataToConfirm = {
        ...reservationData,
        reservationId: Number(id_reserva)
      };
      
      const confirmResponse = await confirmReservation(reservationDataToConfirm);
      console.log('Respuesta de confirmación de reserva:', confirmResponse);
      
      // Mostrar mensaje de éxito
      toast.success('¡Reserva confirmada exitosamente!');
      setErrorMessage(''); // Limpiar cualquier error previo
      
      // Llamar al manejador de éxito o cerrar el modal
      if (handleConfirmSuccess) {
        handleConfirmSuccess(); // Call success handler if provided
      } else {
        handleCancel(); // Cerrar el modal después de completar el pago
      }
    } catch (error) {
      console.error('Error en el proceso de pago y confirmación:', error);
      
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
              {reservationData && (
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium text-green-800 mb-2">Detalles de la Reserva:</h3>
                  <p className="text-green-700">
                    ID: {reservationId || 'No disponible'}
                  </p>
                  {reservationData.nombre_festejado && (
                    <p className="text-green-700">
                      Festejado: {reservationData.nombre_festejado}
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
