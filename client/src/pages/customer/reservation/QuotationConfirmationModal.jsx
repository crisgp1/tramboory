import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import {
  FiCreditCard,
  FiCalendar,
  FiUser,
  FiPackage,
  FiCheck,
  FiX,
  FiClock,
  FiImage,
  FiMapPin
} from 'react-icons/fi';

const QuotationConfirmationModal = ({ 
  reservationData, 
  packages, 
  foodOptions, 
  tematicas, 
  extras, 
  mamparas, 
  onCancel, 
  onConfirm 
}) => {
  const modalRef = useRef(null);

  // Animation on mount
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
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onCancel]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert "11:00:00" to "11:00"
    return timeString.substring(0, 5);
  };

  // Get package details
  const selectedPackage = packages?.find(pkg => pkg.id === reservationData?.id_paquete);
  const selectedFoodOption = foodOptions?.find(option => option.id === reservationData?.id_opcion_alimento);
  const selectedTematica = tematicas?.find(t => t.id === reservationData?.id_tematica);
  const selectedMampara = mamparas?.find(m => m.id === reservationData?.id_mampara);

  // Calculate expiration date (48 hours from now)
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 48);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">Confirmar Cotización</h2>
          <p className="text-gray-600">
            Revisa los detalles de tu cotización. Esta cotización estará disponible por 48 horas.
          </p>
          
          <div className="mt-4 bg-indigo-100 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiClock className="text-indigo-600" />
              <span className="font-medium text-indigo-700">Expira:</span>
            </div>
            <span className="font-medium text-indigo-800">
              {formatDate(expirationDate)} a las {expirationDate.getHours()}:{expirationDate.getMinutes() < 10 ? '0' : ''}{expirationDate.getMinutes()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reservation info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Detalles del Evento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservationData?.nombre_festejado && (
                <div className="flex items-start gap-2">
                  <FiUser className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Festejado</p>
                    <p className="font-medium">{reservationData.nombre_festejado}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <FiCalendar className="mt-1 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {formatDate(reservationData?.fecha_reserva)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FiClock className="mt-1 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">
                    {formatTime(reservationData?.hora_inicio)} - {formatTime(reservationData?.hora_fin)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FiPackage className="mt-1 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Paquete</p>
                  <p className="font-medium">{selectedPackage?.nombre || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Extras and options */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Opciones y Extras</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTematica && (
                <div className="flex items-start gap-2">
                  <FiImage className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Temática</p>
                    <p className="font-medium">{selectedTematica.nombre}</p>
                  </div>
                </div>
              )}
              
              {selectedMampara && (
                <div className="flex items-start gap-2">
                  <FiMapPin className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Mampara</p>
                    <p className="font-medium">{selectedMampara.nombre}</p>
                  </div>
                </div>
              )}
              
              {selectedFoodOption && (
                <div className="flex items-start gap-2">
                  <FiPackage className="mt-1 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Opción de Alimento</p>
                    <p className="font-medium">{selectedFoodOption.nombre}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Extras list */}
            {reservationData?.extras && reservationData.extras.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Extras Seleccionados</h4>
                <ul className="space-y-2">
                  {reservationData.extras.map((extra, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{extra.nombre} x{extra.cantidad}</span>
                      <span className="font-medium">${parseFloat(extra.precio * extra.cantidad).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Price summary */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Resumen de Precios</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Paquete Base</span>
                <span className="font-medium">${parseFloat(reservationData?.packagePrice || 0).toFixed(2)}</span>
              </div>
              
              {selectedTematica && (
                <div className="flex justify-between">
                  <span>Temática: {selectedTematica.nombre}</span>
                  <span className="font-medium">${parseFloat(selectedTematica.precio || 0).toFixed(2)}</span>
                </div>
              )}
              
              {selectedMampara && (
                <div className="flex justify-between">
                  <span>Mampara: {selectedMampara.nombre}</span>
                  <span className="font-medium">${parseFloat(selectedMampara.precio || 0).toFixed(2)}</span>
                </div>
              )}
              
              {selectedFoodOption && (
                <div className="flex justify-between">
                  <span>Opción de Alimento: {selectedFoodOption.nombre}</span>
                  <span className="font-medium">${parseFloat(selectedFoodOption.precio_extra || 0).toFixed(2)}</span>
                </div>
              )}
              
              {reservationData?.martes_fee > 0 && (
                <div className="flex justify-between">
                  <span>Cargo por Martes</span>
                  <span className="font-medium">${parseFloat(reservationData.martes_fee).toFixed(2)}</span>
                </div>
              )}
              
              {/* Extras total */}
              {reservationData?.extras && reservationData.extras.length > 0 && (
                <div className="flex justify-between">
                  <span>Extras</span>
                  <span className="font-medium">
                    ${reservationData.extras.reduce((sum, extra) => sum + parseFloat(extra.precio * extra.cantidad), 0).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="border-t border-indigo-200 pt-2 mt-2 flex justify-between font-bold text-indigo-800">
                <span>Total</span>
                <span>${parseFloat(reservationData?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="text-sm text-gray-500 italic">
            <p>Esta cotización es válida por 48 horas. Los precios y disponibilidad están sujetos a cambios después de este período.</p>
            <p className="mt-1">Al crear esta cotización, no se realiza ningún cargo ni se confirma la reserva.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center gap-2"
          >
            <FiX className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 flex items-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            Crear Cotización
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QuotationConfirmationModal;