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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('formatDate recibió una fecha inválida:', dateString);
      return 'Fecha inválida';
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };