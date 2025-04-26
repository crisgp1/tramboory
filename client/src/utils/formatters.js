export const formatNumber = (number) => {
    // Convertir a número y manejar posibles errores
    const num = Number(number);
    if (isNaN(num)) {
      console.warn('formatNumber recibió un valor no numérico:', number);
      return '0';
    }
  
    // Redondear al entero más cercano
    const roundedNum = Math.round(num);
  
    // Convertir a string y agregar comas
    return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  export const formatDate = (date) => {
    if (!date) {
      // Si es null o undefined, retornamos un mensaje genérico sin advertencia en consola
      return 'Fecha no seleccionada';
    }

    let dateObj;
    
    if (date instanceof Date) {
      // Si ya es un objeto Date, lo usamos directamente
      dateObj = date;
    } else if (typeof date === 'string') {
      // Si es un string, intentamos convertirlo
      // Asumimos que podría venir en formato YYYY-MM-DD
      if (date.includes('-')) {
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(year, month - 1, day, 12); // Agregamos hora 12 para evitar problemas con cambios de día
      } else {
        // Si no tiene formato esperado, intentamos crear fecha directamente
        dateObj = new Date(date);
      }
    } else {
      // Si no es Date ni string, es un tipo no soportado
      console.warn('formatDate recibió un tipo de dato no soportado:', typeof date);
      return 'Fecha inválida';
    }
    
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate recibió una fecha inválida:', date);
      return 'Fecha inválida';
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return dateObj.toLocaleDateString('es-ES', options);
  };

  export const formatTime = (timeString) => {
    if (!timeString) {
      console.warn('formatTime recibió una hora vacía');
      return 'Hora inválida';
    }

    // Asumimos que timeString viene en formato HH:MM:SS
    const [hours, minutes] = timeString.split(':');
    
    // Validamos el formato
    if (!hours || !minutes) {
      console.warn('formatTime recibió un formato de hora inválido:', timeString);
      return 'Hora inválida';
    }

    // Determinamos el turno basado en la hora
    const hour = parseInt(hours, 10);
    const turno = hour === 11 ? 'Matutino' : hour === 17 ? 'Vespertino' : '';
    
    // Formateamos la hora en formato 12 horas
    const hour12 = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minutes} ${ampm} (Turno ${turno})`;
  };

// Exportar también un objeto formatters que contenga todas las funciones
export const formatters = {
  formatNumber,
  formatDate,
  formatTime,
  // Añadir un alias formatCurrency para formatNumber para mantener compatibilidad
  formatCurrency: formatNumber
};