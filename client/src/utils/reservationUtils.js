// src/utils/reservationUtils.js
import { format, parseISO } from 'date-fns';

export const RESERVATION_STATES = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada',
  CANCELLED: 'cancelada'
};

export const isActiveReservation = (reservation) => {
  return reservation.estado === RESERVATION_STATES.PENDING ||
         reservation.estado === RESERVATION_STATES.CONFIRMED;
};

export const calculatePackagePrice = (selectedPackage, date) => {
  if (!selectedPackage || !date) return 0;
  const dayOfWeek = new Date(date).getDay();
  
  // L-J: 1-4 (Lunes a Jueves)
  // V-D: 5-0 (Viernes a Domingo)
  const isWeekendRate = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  
  return isWeekendRate ? selectedPackage.precio_viernes_domingo : selectedPackage.precio_lunes_jueves;
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
    morning: !reservationsForDate.some(res => res.hora_inicio === 'mañana'),
    afternoon: !reservationsForDate.some(res => res.hora_inicio === 'tarde')
  };
};

export const getTimeSlotOptions = (date, existingReservations) => {
  const slots = checkAvailableTimeSlots(date, existingReservations);
  const options = [];

  if (slots.morning) {
    options.push({
      value: 'mañana',
      label: 'Matutino (9:00 - 14:00)'
    });
  }

  if (slots.afternoon) {
    options.push({
      value: 'tarde',
      label: 'Vespertino (15:00 - 20:00)'
    });
  }

  return options;
};

export const formatTimeSlot = (timeSlot) => {
  return timeSlot === 'mañana'
    ? 'Matutino (9:00 - 14:00)'
    : 'Vespertino (15:00 - 20:00)';
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
      if (reservation.hora_inicio === 'mañana') {
        slots.morning = true;
      } else if (reservation.hora_inicio === 'tarde') {
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