import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { toast } from 'react-toastify';
import usePreReservasStore from '@/store/preReservasStore';
import {
  FiCreditCard,
  FiCalendar,
  FiUser,
  FiPackage,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';

const ConfirmationModal = ({ onClose, onConfirm }) => {
  const modalRef = useRef(null);
  const [transactionData, setTransactionData] = useState({
    token_transaccion: '',
    comprobante: '',
  });
  const [isValid, setIsValid] = useState(false);

  const { 
    pagoEnProceso, 
    error, 
    loading, 
    confirmarPago, 
    preReserva 
  } = usePreReservasStore();

  // Animation on mount
  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  // Calculate time remaining for pre-reservation expiration
  const calculateTimeRemaining = () => {
    if (!pagoEnProceso?.expiracion_pre_reserva) return null;
    
    const expiration = new Date(pagoEnProceso.expiracion_pre_reserva);
    const now = new Date();
    const diffMs = expiration - now;
    
    if (diffMs <= 0) return 'Expirado';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}:${diffSecs < 10 ? '0' : ''}${diffSecs}`;
  };
  
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
  
  // Update time remaining every second
  useEffect(() => {
    if (!pagoEnProceso?.expiracion_pre_reserva) return;
    
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === 'Expirado') {
        clearInterval(timer);
        toast.error('La pre-reserva ha expirado. Por favor, inicie el proceso nuevamente.');
        onClose();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [pagoEnProceso, onClose]);

  // Add event listener for escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Validate form input
  useEffect(() => {
    setIsValid(!!transactionData.token_transaccion);
  }, [transactionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setTransactionData(prev => ({
          ...prev,
          comprobante: reader.result
        }));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    
    try {
      await confirmarPago({
        token_transaccion: transactionData.token_transaccion,
        datos_transaccion: {
          comprobante: transactionData.comprobante
        }
      });
      
      if (onConfirm) {
        onConfirm();
      }
    } catch (err) {
      console.error('Error al confirmar pago:', err);
      // Error is handled by the store
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">Confirmar Pago</h2>
          <p className="text-gray-600">
            Tu pre-reserva está pendiente de confirmación. Por favor, ingresa los datos del pago realizado.
          </p>
          
          {pagoEnProceso && (
            <div className="mt-4 bg-indigo-100 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock className="text-indigo-600" />
                <span className="font-medium text-indigo-700">Tiempo restante:</span>
              </div>
              <span className="font-mono text-lg font-bold text-indigo-800">
                {timeRemaining || 'Calculando...'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pre-reserva info */}
          {preReserva && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Detalles de Pre-reserva</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <FiUser className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Festejado</p>
                    <p className="font-medium">{preReserva.nombre_festejado || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FiCalendar className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-medium">
                      {preReserva.fecha_reserva ? formatDate(preReserva.fecha_reserva) : 'No especificado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FiPackage className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Paquete</p>
                    <p className="font-medium">{preReserva.paquete_nombre || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <FiCreditCard className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total a Pagar</p>
                    <p className="font-medium text-indigo-700">
                      ${pagoEnProceso?.monto?.toFixed(2) || 'N/A'} MXN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg flex items-start gap-2 text-red-600">
              <FiAlertCircle className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Payment confirmation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token_transaccion" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Referencia / Confirmación
              </label>
              <input
                type="text"
                id="token_transaccion"
                name="token_transaccion"
                value={transactionData.token_transaccion}
                onChange={handleChange}
                placeholder="Ej. 123456789"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Ingresa el número de referencia o confirmación de tu pago
              </p>
            </div>

            <div>
              <label htmlFor="comprobante" className="block text-sm font-medium text-gray-700 mb-1">
                Comprobante de Pago (opcional)
              </label>
              <input
                type="file"
                id="comprobante"
                name="comprobante"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Puedes adjuntar una imagen o PDF de tu comprobante de pago
              </p>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center gap-2"
            disabled={loading}
          >
            <FiX className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
              isValid && !loading
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            } transition duration-300`}
          >
            {loading ? (
              <>
                <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Procesando...
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                Confirmar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;