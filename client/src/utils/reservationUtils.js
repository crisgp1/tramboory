// src/utils/reservationUtils.js
import { format, parseISO, isTuesday } from 'date-fns';

// Constantes estandarizadas para ambas versiones del formulario
export const TUESDAY_SURCHARGE = 1500;

// Función auxiliar para procesar extras con deduplicación y cantidades
export const processExtras = (selectedExtras) => {
  if (!selectedExtras?.length) return [];
  
  // Deduplicar por ID y preservar cantidades
  return Array.from(new Set(selectedExtras.map(e => e.id))).map(
    (id) => {
      const extra = selectedExtras.find(e => e.id === id);
      return {
        id: Number(id),
        cantidad: Number(extra.cantidad || extra.ReservaExtra?.cantidad || 1),
        nombre: extra.nombre,
        precio: extra.precio,
      };
    }
  );
};

export const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    hora_inicio: '11:00:00', // Estandarizado para ambas versiones
    hora_fin: '16:00:00',    // Estandarizado para ambas versiones
    icon: '🌅'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    hora_inicio: '17:00:00', // Estandarizado para ambas versiones
    hora_fin: '22:00:00',    // Estandarizado para ambas versiones
    icon: '🌇'
  }
};

export const RESERVATION_STATES = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  CANCELLED: 'cancelada'
};

export const isActiveReservation = (reservation) => {
  return reservation.estado === RESERVATION_STATES.PENDING ||
         reservation.estado === RESERVATION_STATES.CONFIRMED;
};

// Función bidireccional 1: Convertir datos del formulario al formato API
export const formatReservationForApi = (formData) => {
  // El objeto fecha puede ser una string o un objeto Date
  const fecha = formData.fecha_reserva instanceof Date
    ? format(formData.fecha_reserva, 'yyyy-MM-dd')
    : formData.fecha_reserva;
  
  // Determinar hora_inicio basado en el valor seleccionado
  let horaInicio = null;
  let horaFin = null;
  
  if (formData.hora_inicio) {
    // Puede ser un objeto complejo (dashboard) o un string simple (cliente)
    const timeSlotValue = typeof formData.hora_inicio === 'object' 
      ? formData.hora_inicio.value 
      : formData.hora_inicio;
    
    if (timeSlotValue === TIME_SLOTS.MORNING.value) {
      horaInicio = TIME_SLOTS.MORNING.hora_inicio;
      horaFin = TIME_SLOTS.MORNING.hora_fin;
    } else if (timeSlotValue === TIME_SLOTS.AFTERNOON.value) {
      horaInicio = TIME_SLOTS.AFTERNOON.hora_inicio;
      horaFin = TIME_SLOTS.AFTERNOON.hora_fin;
    }
  }
  
  // Convertir extras a formato esperado por API utilizando la función auxiliar
  const uniqueExtras = processExtras(formData.extras || []).map(extra => ({
    id: Number(extra.id),
    cantidad: Number(extra.cantidad || 1),
  }));
  
  return {
    // Si existe un ID (edición) lo incluimos
    ...(formData.id && { id: formData.id }),
    
    // Campos básicos convertidos a números
    id_usuario: Number(formData.id_usuario),
    id_paquete: Number(formData.id_paquete),
    
    // Extraer value de objetos complejos o usar directamente si es un ID
    id_opcion_alimento: formData.id_opcion_alimento ? 
      (typeof formData.id_opcion_alimento === 'object' 
        ? Number(formData.id_opcion_alimento.value) 
        : Number(formData.id_opcion_alimento)) 
      : null,
      
    id_tematica: formData.id_tematica ? 
      (typeof formData.id_tematica === 'object' 
        ? Number(formData.id_tematica.value) 
        : Number(formData.id_tematica)) 
      : null,
      
    id_mampara: formData.id_mampara ? 
      (typeof formData.id_mampara === 'object' 
        ? Number(formData.id_mampara.value) 
        : Number(formData.id_mampara)) 
      : null,
    
    // Extras procesados para eliminar duplicados
    extras: uniqueExtras,
    
    // Fecha y horario
    fecha_reserva: fecha,
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    
    // Datos del festejado
    nombre_festejado: formData.nombre_festejado,
    edad_festejado: Number(formData.edad_festejado),
    comentarios: formData.comentarios,
    
    // Campos financieros y estado
    total: parseFloat(formData.total),
    estado: formData.estado || RESERVATION_STATES.PENDING,
    activo: formData.activo !== undefined ? formData.activo : true,
    tuesdayFee: formData.tuesdayFee ? parseFloat(formData.tuesdayFee) : 0,
  };
};

// Función bidireccional 2: Convertir datos de API al formato del formulario
export const formatReservationForEditing = (apiData, foodOptions = [], tematicas = [], mamparas = []) => {
  // Si no hay datos de API, retornar null
  if (!apiData) return null;
  
  // Fecha: convertir string a objeto Date
  const fecha = apiData.fecha_reserva 
    ? new Date(apiData.fecha_reserva + 'T00:00:00') 
    : null;
  
  // Horario: convertir string a objeto de horario
  let horaInicio = null;
  if (apiData.hora_inicio) {
    if (apiData.hora_inicio === TIME_SLOTS.MORNING.hora_inicio) {
      horaInicio = {
        value: TIME_SLOTS.MORNING.value,
        label: TIME_SLOTS.MORNING.label,
        hora_inicio: TIME_SLOTS.MORNING.hora_inicio,
        hora_fin: TIME_SLOTS.MORNING.hora_fin,
        icon: TIME_SLOTS.MORNING.icon,
        data: TIME_SLOTS.MORNING
      };
    } else if (apiData.hora_inicio === TIME_SLOTS.AFTERNOON.hora_inicio) {
      horaInicio = {
        value: TIME_SLOTS.AFTERNOON.value,
        label: TIME_SLOTS.AFTERNOON.label,
        hora_inicio: TIME_SLOTS.AFTERNOON.hora_inicio,
        hora_fin: TIME_SLOTS.AFTERNOON.hora_fin,
        icon: TIME_SLOTS.AFTERNOON.icon,
        data: TIME_SLOTS.AFTERNOON
      };
    }
  }
  
  // Convertir ID de opción de alimento a objeto complejo con propiedades adicionales
  let opcionAlimento = null;
  if (apiData.id_opcion_alimento && foodOptions.length > 0) {
    const foodOption = foodOptions.find(opt => Number(opt.id) === Number(apiData.id_opcion_alimento));
    if (foodOption) {
      opcionAlimento = {
        value: foodOption.id,
        label: `${foodOption.nombre} - $${foodOption.precio_extra}`,
        data: foodOption,
        // Propiedades directas para compatibilidad
        precio_extra: foodOption.precio_extra,
        turno: foodOption.turno
      };
    }
  } else if (apiData.opcionAlimento) {
    // Si ya viene un objeto opcionAlimento anidado
    opcionAlimento = {
      value: apiData.opcionAlimento.id,
      label: `${apiData.opcionAlimento.nombre} - $${apiData.opcionAlimento.precio_extra}`,
      data: apiData.opcionAlimento,
      // Propiedades directas para compatibilidad
      precio_extra: apiData.opcionAlimento.precio_extra,
      turno: apiData.opcionAlimento.turno
    };
  }
  
  // Convertir ID de temática a objeto complejo con propiedades adicionales
  let tematica = null;
  if (apiData.id_tematica && tematicas.length > 0) {
    const tematicaObj = tematicas.find(t => Number(t.id) === Number(apiData.id_tematica));
    if (tematicaObj) {
      tematica = {
        value: tematicaObj.id,
        label: tematicaObj.nombre,
        data: tematicaObj,
        // Propiedades directas para compatibilidad
        descripcion: tematicaObj.descripcion,
        foto: tematicaObj.foto
      };
    }
  } else if (apiData.tematicaReserva) {
    // Si ya viene un objeto tematica anidado
    tematica = {
      value: apiData.tematicaReserva.id,
      label: apiData.tematicaReserva.nombre,
      data: apiData.tematicaReserva,
      // Propiedades directas para compatibilidad
      descripcion: apiData.tematicaReserva.descripcion,
      foto: apiData.tematicaReserva.foto
    };
  }
  
  // Convertir ID de mampara a objeto complejo con propiedades adicionales
  let mampara = null;
  if (apiData.id_mampara && mamparas.length > 0) {
    const mamparaObj = mamparas.find(m => Number(m.id) === Number(apiData.id_mampara));
    if (mamparaObj) {
      mampara = {
        value: mamparaObj.id,
        label: `${mamparaObj.piezas} piezas - $${mamparaObj.precio}`,
        data: mamparaObj,
        // Propiedades directas para compatibilidad
        piezas: mamparaObj.piezas,
        precio: mamparaObj.precio
      };
    }
  } else if (apiData.mampara) {
    // Si ya viene un objeto mampara anidado
    mampara = {
      value: apiData.mampara.id,
      label: `${apiData.mampara.piezas} piezas - $${apiData.mampara.precio}`,
      data: apiData.mampara,
      // Propiedades directas para compatibilidad
      piezas: apiData.mampara.piezas,
      precio: apiData.mampara.precio
    };
  }
  
  // Procesar extras utilizando la función auxiliar
  const extras = processExtras(apiData.extras || []);
  
  // Calcular cargo por martes si no está presente
  let tuesdayFee = apiData.tuesdayFee || 0;
  if (fecha && isTuesday(fecha) && !tuesdayFee) {
    tuesdayFee = TUESDAY_SURCHARGE;
  }
  
  return {
    // Mantener campos originales y añadir transformados
    ...apiData,
    
    // Campos transformados
    id_opcion_alimento: opcionAlimento,
    id_tematica: tematica,
    id_mampara: mampara,
    extras: extras,
    fecha_reserva: fecha,
    hora_inicio: horaInicio,
    tuesdayFee: tuesdayFee,
    
    // Mantener references para compatibilidad
    opcionAlimento: apiData.opcionAlimento,
    tematicaReserva: apiData.tematicaReserva,
    mampara: apiData.mampara,
  };
};

export const calculatePackagePrice = (selectedPackage, date) => {
  if (!selectedPackage || !date) return 0;
  const dayOfWeek = new Date(date).getDay();
  
  // L-J: 1-4 (Lunes a Jueves)
  // V-D: 5-0 (Viernes a Domingo)
  const isWeekendRate = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  
  const basePrice = isWeekendRate ? 
    parseFloat(selectedPackage.precio_viernes_domingo) : 
    parseFloat(selectedPackage.precio_lunes_jueves);
  
  // Añadir cargo por martes si aplica
  return basePrice + (isTuesday(date) ? TUESDAY_SURCHARGE : 0);
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const checkAvailableTimeSlots = (date, existingReservations) => {
  if (!date) return { morning: true, afternoon: true };
  const dateStr = format(date, 'yyyy-MM-dd');
  const reservationsForDate = existingReservations.filter(reservation => {
    const reservationDate = format(parseISO(reservation.fecha_reserva), 'yyyy-MM-dd');
    return reservationDate === dateStr && isActiveReservation(reservation);
  });

  return {
    morning: !reservationsForDate.some(res => 
      res.hora_inicio === TIME_SLOTS.MORNING.hora_inicio),
    afternoon: !reservationsForDate.some(res => 
      res.hora_inicio === TIME_SLOTS.AFTERNOON.hora_inicio)
  };
};

export const getTimeSlotOptions = (date, existingReservations) => {
  const slots = checkAvailableTimeSlots(date, existingReservations);
  const options = [];

  if (slots.morning) {
    options.push({
      value: TIME_SLOTS.MORNING.value,
      label: TIME_SLOTS.MORNING.label,
      hora_inicio: TIME_SLOTS.MORNING.hora_inicio,
      hora_fin: TIME_SLOTS.MORNING.hora_fin,
      icon: TIME_SLOTS.MORNING.icon
    });
  }

  if (slots.afternoon) {
    options.push({
      value: TIME_SLOTS.AFTERNOON.value,
      label: TIME_SLOTS.AFTERNOON.label,
      hora_inicio: TIME_SLOTS.AFTERNOON.hora_inicio,
      hora_fin: TIME_SLOTS.AFTERNOON.hora_fin,
      icon: TIME_SLOTS.AFTERNOON.icon
    });
  }

  return options;
};

export const formatTimeSlot = (timeSlot) => {
  if (!timeSlot) return '';
  
  // Puede ser un string o un objeto
  const value = typeof timeSlot === 'object' ? timeSlot.value : timeSlot;
  
  return value === TIME_SLOTS.MORNING.value
    ? TIME_SLOTS.MORNING.label
    : TIME_SLOTS.AFTERNOON.label;
};

export const getUnavailableDates = (existingReservations) => {
  const dateMap = new Map();
  
  existingReservations.forEach(reservation => {
    if (isActiveReservation(reservation)) {
      const dateStr = format(parseISO(reservation.fecha_reserva), 'yyyy-MM-dd');
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { morning: false, afternoon: false });
      }
      const slots = dateMap.get(dateStr);
      if (reservation.hora_inicio === TIME_SLOTS.MORNING.hora_inicio) {
        slots.morning = true;
      } else if (reservation.hora_inicio === TIME_SLOTS.AFTERNOON.hora_inicio) {
        slots.afternoon = true;
      }
    }
  });

  const fullyBookedDates = [];
  dateMap.forEach((slots, dateStr) => {
    if (slots.morning && slots.afternoon) {
      fullyBookedDates.push(parseISO(dateStr));
    }
  });

  return fullyBookedDates;
};