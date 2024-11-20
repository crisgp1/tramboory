import React from 'react';
import { useWatch } from 'react-hook-form';
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiImage,
  FiList,
  FiInfo
} from 'react-icons/fi';
import SummaryItem from './SummaryItem';
import { formatCurrency } from './reservationform/styles';

const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00'
  }
};

const ReservationSummary = ({
  control,
  packages,
  foodOptions,
  tematicas,
  mamparas,
  extras
}) => {
  const watchedFields = useWatch({ control });

  const formatDate = (date) => {
    console.log('Fecha recibida en formatDate:', date);
  
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Fecha no seleccionada o inválida');
        return 'No seleccionada';
      }
  
      const formattedDate = new Intl.DateTimeFormat('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
  
      console.log('Fecha formateada:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Datos seleccionados
  const selectedPackage = packages.find(pkg => pkg.id === watchedFields.id_paquete);
  const selectedFoodOption = foodOptions.find(food => food.id === watchedFields.id_opcion_alimento);
  const selectedTematica = tematicas.find(tema => tema.id === watchedFields.id_tematica);
  const selectedMampara = mamparas.find(mampara => mampara.id === watchedFields.id_mampara);
  const tuesdayFee = watchedFields.tuesdayFee || 0;

  // Cálculo del precio del paquete según el día
  const calculatePackagePrice = () => {
    if (!selectedPackage || !watchedFields.fecha_reserva || !(watchedFields.fecha_reserva instanceof Date)) return 0;

    const dayOfWeek = watchedFields.fecha_reserva.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4
      ? parseFloat(selectedPackage.precio_lunes_jueves) || 0
      : parseFloat(selectedPackage.precio_viernes_domingo) || 0;
  };

  // Cálculo del precio de los extras
  const calculateExtrasPrice = () => {
    if (!watchedFields.extras || !Array.isArray(watchedFields.extras)) return 0;
    
    return watchedFields.extras.reduce((total, extra) => {
      const extraInfo = extras.find(e => e.id === extra.id);
      if (extraInfo && extra.cantidad && extra.cantidad > 0) {
        return total + (parseFloat(extraInfo.precio) || 0) * parseInt(extra.cantidad);
      }
      return total;
    }, 0);
  };

  // Descripción de extras seleccionados
  const getExtrasDescription = () => {
    if (!watchedFields.extras || !Array.isArray(watchedFields.extras) || watchedFields.extras.length === 0) {
      return 'No seleccionados';
    }

    const selectedExtrasWithInfo = watchedFields.extras
      .map(extra => {
        const extraInfo = extras.find(e => e.id === extra.id);
        if (!extraInfo || !extra.cantidad || extra.cantidad < 1) return null;
        
        const cantidad = parseInt(extra.cantidad);
        const extraPrice = (parseFloat(extraInfo.precio) || 0) * cantidad;
        
        return {
          nombre: extraInfo.nombre,
          cantidad,
          precio: extraPrice
        };
      })
      .filter(Boolean);

    if (selectedExtrasWithInfo.length === 0) {
      return 'No seleccionados';
    }

    return selectedExtrasWithInfo
      .map(extra => `${extra.nombre} (x${extra.cantidad}) - ${formatCurrency(extra.precio)}`)
      .join('\n');
  };

  // Obtener el tipo de día (L-J o V-D)
  const getDayType = () => {
    if (!watchedFields.fecha_reserva || !(watchedFields.fecha_reserva instanceof Date)) return '';
    const dayOfWeek = watchedFields.fecha_reserva.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 4 ? 'L-J' : 'V-D';
  };

  // Cálculo del total
  const calculateTotal = () => {
    let total = calculatePackagePrice();

    if (selectedFoodOption) {
      total += parseFloat(selectedFoodOption.precio_extra) || 0;
    }

    if (selectedMampara) {
      total += parseFloat(selectedMampara.precio) || 0;
    }

    total += parseFloat(tuesdayFee) || 0;
    total += calculateExtrasPrice();

    return total;
  };

  // Información detallada del paquete
  const getPackageInfo = () => {
    if (!selectedPackage) return 'No seleccionado';
    const packagePrice = calculatePackagePrice();
    const dayType = getDayType();
    return `${selectedPackage.nombre}\n${formatCurrency(packagePrice)} (Precio ${dayType})`;
  };

  // Obtener el horario formateado
  const getFormattedTimeSlot = () => {
    if (!watchedFields.hora_inicio) return 'No seleccionada';
    
    const timeSlot = watchedFields.hora_inicio.value === 'mañana' ? TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;
    return timeSlot.label;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-700 flex items-center gap-2">
        <FiInfo className="w-6 h-6" />
        Resumen de tu Reserva
      </h2>

      <div className="space-y-4">
        {/* Información del Paquete */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <SummaryItem
            icon={<FiPackage className="text-blue-600" />}
            label="Paquete"
            value={getPackageInfo()}
            className="font-medium"
          />
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryItem
            icon={<FiCalendar />}
            label="Fecha"
            value={formatDate(watchedFields.fecha_reserva)}
          />
          <SummaryItem
            icon={<FiClock />}
            label="Hora"
            value={getFormattedTimeSlot()}
          />
        </div>

        {/* Información del Festejado */}
        <div className="bg-purple-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiUser className="text-purple-600" />}
            label="Nombre del Festejado"
            value={watchedFields.nombre_festejado || 'No proporcionado'}
          />
          <SummaryItem
            icon={<FiUser className="text-purple-600" />}
            label="Edad del Festejado"
            value={watchedFields.edad_festejado || 'No proporcionada'}
          />
        </div>

        {/* Opciones Seleccionadas */}
        <div className="bg-green-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiDollarSign className="text-green-600" />}
            label="Opción de Alimento"
            value={selectedFoodOption ? 
              `${selectedFoodOption.nombre} - ${formatCurrency(selectedFoodOption.precio_extra)}` : 
              'No seleccionada'}
          />
          <SummaryItem
            icon={<FiImage className="text-green-600" />}
            label="Temática"
            value={selectedTematica?.nombre || 'No seleccionada'}
          />
          {selectedMampara && (
            <SummaryItem
              icon={<FiImage className="text-green-600" />}
              label="Mampara"
              value={`${selectedMampara.piezas} piezas - ${formatCurrency(selectedMampara.precio)}`}
            />
          )}
        </div>

        {/* Extras y Cargos Adicionales */}
        <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
          <SummaryItem
            icon={<FiList className="text-yellow-600" />}
            label="Extras Seleccionados"
            value={getExtrasDescription()}
          />
          {tuesdayFee > 0 && (
            <SummaryItem
              icon={<FiDollarSign className="text-yellow-600" />}
              label="Cargo por Martes"
              value={formatCurrency(tuesdayFee)}
            />
          )}
        </div>

        {/* Total */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <SummaryItem
            icon={<FiDollarSign className="text-indigo-600 w-6 h-6" />}
            label="Total Estimado"
            value={formatCurrency(calculateTotal())}
            className="text-lg font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;