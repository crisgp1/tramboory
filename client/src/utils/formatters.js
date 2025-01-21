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
  
  export const formatDate = (dateString) => {
    if (!dateString) {
      console.warn('formatDate recibió una fecha vacía');
      return 'Fecha inválida';
    }

    // Asumimos que dateString viene en formato YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Creamos la fecha en la zona horaria local usando los componentes
    const date = new Date(year, month - 1, day, 12); // Agregamos hora 12 para evitar problemas con cambios de día
    
    if (isNaN(date.getTime())) {
      console.warn('formatDate recibió una fecha inválida:', dateString);
      return 'Fecha inválida';
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
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