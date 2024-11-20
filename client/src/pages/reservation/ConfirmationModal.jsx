import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiImage,
  FiUser,
  FiAlertCircle,
  FiList,
  FiCheck,
  FiX,
  FiGift
} from 'react-icons/fi';
import SummaryItem from './SummaryItem';

const ConfirmationModal = ({
  reservationData,
  packages = [],
  foodOptions = [],
  tematicas = [],
  extras = [],
  mamparas = [],
  onCancel,
  onConfirm,
}) => {
  const modalRef = useRef(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getDayType = (fecha) => {
    if (!fecha) return '';
    const reservationDate = new Date(fecha);
    const dayOfWeek = reservationDate.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4 ? 'L-J' : 'V-D';
  };

  useEffect(() => {
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const Section = ({ title, children, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 border-b pb-2">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        {title}
      </h3>
      {children}
    </div>
  );

  const selectedFoodOption = foodOptions?.find(f => f?.id === reservationData?.id_opcion_alimento);
  const selectedPackage = packages?.find(pkg => pkg?.id === reservationData?.id_paquete);
  const selectedTematica = tematicas?.find(t => t?.id === reservationData?.id_tematica);
  const selectedMampara = mamparas?.find(m => m?.id === reservationData?.id_mampara);
  const mamparaPrice = parseFloat(selectedMampara?.precio) || 0;
  const tematicaPrice = parseFloat(selectedTematica?.precio) || 0;

  // Get complete extra information
  const getExtraInfo = (extraId) => {
    return extras.find(e => e.id === extraId);
  };

  // Calculate extras total
  const calculateExtrasTotal = () => {
    if (!reservationData?.extras?.length) return 0;
    
    return reservationData.extras.reduce((total, extra) => {
      const extraInfo = getExtraInfo(extra.id);
      if (!extraInfo) return total;
      
      const precio = parseFloat(extraInfo.precio) || 0;
      const cantidad = parseInt(extra.cantidad) || 0;
      return total + (precio * cantidad);
    }, 0);
  };

  const renderFoodOptionDetails = () => {
    if (!selectedFoodOption) return null;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Menú para Adultos</span>
          <span className="font-medium">
            {selectedFoodOption.menu_adulto || selectedFoodOption.nombre || 'No especificado'}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-700">Menú para Niños</span>
          <span className="font-medium">
            {selectedFoodOption.menu_nino || selectedFoodOption.nombre || 'No especificado'}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
          <span className="text-gray-700">Total Alimentos</span>
          <span className="font-medium">
            {formatCurrency(parseFloat(selectedFoodOption.precio_extra) || 0)}
          </span>
        </div>
      </div>
    );
  };

  // Calculate total
  const calculateTotal = () => {
    let total = 0;
    
    // Add package price
    total += parseFloat(reservationData?.packagePrice) || 0;
    
    // Add food option price
    if (selectedFoodOption) {
      total += parseFloat(selectedFoodOption.precio_extra) || 0;
    }
    
    // Add mampara price
    total += mamparaPrice;
    
    // Add tematica price
    total += tematicaPrice;
    
    // Add tuesday fee
    total += parseFloat(reservationData?.tuesdayFee) || 0;
    
    // Add extras
    total += calculateExtrasTotal();
    
    return total;
  };

  if (!reservationData) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Encabezado */}
        <div className="bg-indigo-50 p-6 border-b border-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            <FiAlertCircle className="text-indigo-600 text-2xl" />
            <h2 className="text-2xl font-bold text-indigo-700">
              Confirmar Reserva
            </h2>
          </div>
          <p className="text-gray-600">
            Por favor, verifica que todos los detalles de tu reserva sean correctos antes de continuar.
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Detalles del Paquete */}
          <Section title="Detalles del Paquete" icon={FiPackage}>
            <div className="bg-indigo-50 p-4 rounded-lg space-y-3">
              <SummaryItem
                icon={<FiPackage className="text-indigo-600" />}
                label="Paquete Seleccionado"
                value={selectedPackage?.nombre || 'No seleccionado'}
                className="font-medium"
              />
              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                <span className="text-gray-700">Tarifa {getDayType(reservationData.fecha_reserva)}</span>
                <span className="font-medium text-indigo-600">{formatCurrency(parseFloat(reservationData.packagePrice) || 0)}</span>
              </div>
            </div>
          </Section>

          {/* Fecha y Horario */}
          <Section title="Fecha y Horario" icon={FiCalendar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryItem
                icon={<FiCalendar className="text-indigo-600" />}
                label="Fecha"
                value={formatDate(reservationData.fecha_reserva)}
              />
              <SummaryItem
                icon={<FiClock className="text-indigo-600" />}
                label="Horario"
                value={reservationData.hora_inicio === 'mañana' ? 'Matutino (9:00 - 14:00)' : 'Vespertino (15:00 - 20:00)'}
              />
            </div>
          </Section>

          {/* Servicios Seleccionados */}
          <Section title="Servicios Seleccionados" icon={FiList}>
            <div className="space-y-4">
              {selectedFoodOption && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Opciones de Alimento</h4>
                  {renderFoodOptionDetails()}
                </div>
              )}
              
              {selectedTematica && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Temática: {selectedTematica.nombre}</span>
                  
                </div>
              )}

              {selectedMampara && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Mampara: {selectedMampara.nombre}</span>
                  <span className="font-medium">{formatCurrency(mamparaPrice)}</span>
                </div>
              )}
            </div>
          </Section>

          {/* Extras Seleccionados */}
          {reservationData?.extras?.length > 0 && (
            <Section title="Extras Seleccionados" icon={FiGift}>
              <div className="space-y-2">
                {reservationData.extras.map((extra) => {
                  const extraInfo = getExtraInfo(extra.id);
                  if (!extraInfo) return null;
                  
                  const extraTotal = (parseFloat(extraInfo.precio) || 0) * (parseInt(extra.cantidad) || 0);
                  
                  return (
                    <div key={extra.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {extraInfo.nombre}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(parseFloat(extraInfo.precio))} x {extra.cantidad} = {formatCurrency(extraTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700">Total Extras</span>
                  <span className="font-medium">{formatCurrency(calculateExtrasTotal())}</span>
                </div>
              </div>
            </Section>
          )}

          {/* Información del Festejado */}
          <Section title="Información del Festejado" icon={FiUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryItem
                icon={<FiUser className="text-indigo-600" />}
                label="Nombre"
                value={reservationData.nombre_festejado || 'No especificado'}
              />
              <SummaryItem
                icon={<FiUser className="text-indigo-600" />}
                label="Edad"
                value={reservationData.edad_festejado ? `${reservationData.edad_festejado} años` : 'No especificada'}
              />
            </div>
          </Section>

          {/* Desglose de Costos */}
          <Section title="Desglose de Costos" icon={FiDollarSign}>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Tarifa {getDayType(reservationData.fecha_reserva)}</span>
                <span className="font-medium">{formatCurrency(parseFloat(reservationData.packagePrice) || 0)}</span>
              </div>
              
              {selectedFoodOption && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Alimentos</span>
                  <span className="font-medium">{formatCurrency(parseFloat(selectedFoodOption.precio_extra) || 0)}</span>
                </div>
              )}

              {selectedTematica && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Temática: {selectedTematica.nombre}</span>
                  
                </div>
              )}

              {selectedMampara && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Mampara: {selectedMampara.nombre}</span>
                  <span className="font-medium">{formatCurrency(mamparaPrice)}</span>
                </div>
              )}

              {reservationData.tuesdayFee > 0 && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Cargo por Martes</span>
                  <span className="font-medium">{formatCurrency(parseFloat(reservationData.tuesdayFee) || 0)}</span>
                </div>
              )}

              {reservationData?.extras?.length > 0 && (
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Extras</span>
                  <span className="font-medium">
                    {formatCurrency(calculateExtrasTotal())}
                  </span>
                </div>
              )}
            </div>
          </Section>

          {/* Total */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Total a Pagar:</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-300 flex items-center gap-2 shadow-sm"
          >
            <FiX className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 flex items-center gap-2 shadow-sm"
          >
            <FiCheck className="w-5 h-5" />
            Confirmar Reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;