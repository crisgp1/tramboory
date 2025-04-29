import { useEffect, useRef, useState } from 'react';
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
  FiInfo
} from 'react-icons/fi';

const PaymentModal = ({ reservationData, onCancel, onConfirm, isOpen, onClose, onSuccess, amount, formData }) => {
  const modalRef = useRef(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use provided handlers or fallback to expected prop names
  const handleCancel = onClose || onCancel;
  const handleConfirmSuccess = onSuccess || onConfirm;
  const CLABE = '646016206867172653';
  const ADDRESS = 'P.º Solares 1639, Solares Residencial, 45019 Zapopan, Jal.';

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

  const handleConfirm = async () => {
    if (!paymentMethod || isProcessing) return;
    setIsProcessing(true);

    try {
      // Validar que tengamos los datos necesarios
      const id_reserva = formData?.id || (reservationData && reservationData.id);
      const monto = amount || (reservationData && reservationData.total);

      if (!id_reserva) {
        throw new Error('ID de reserva no disponible');
      }

      if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
        throw new Error('Monto de pago inválido');
      }

      // Crear el pago directamente como completado
      const pagoData = {
        id_reserva,
        monto: parseFloat(monto),
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: paymentMethod === 'transfer' ? 'transferencia' : 'efectivo',
        estado: 'completado', // Crear directamente como completado
      };

      console.log('Enviando datos de pago:', pagoData);
      const response = await axiosInstance.post('/pagos', pagoData);

      if (response && response.data) {
        toast.success('¡Pago registrado exitosamente!');
        if (handleConfirmSuccess) {
          handleConfirmSuccess(); // Call success handler if provided
        } else {
          handleCancel(); // Cerrar el modal después de completar el pago
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      
      // Mostrar mensaje de error más específico si está disponible
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al procesar el pago');
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

          {!paymentMethod && (
            <div className="text-amber-600 flex items-center gap-2 bg-amber-50 p-4 rounded-lg">
              <FiAlertCircle />
              <span>Por favor, selecciona un método de pago para continuar</span>
            </div>
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
