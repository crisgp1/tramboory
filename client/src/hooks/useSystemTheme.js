import { useState, useEffect } from 'react';

/**
 * Hook personalizado que detecta la preferencia de tema del sistema operativo
 * @returns {boolean} - true si el sistema prefiere el tema oscuro, false si prefiere el tema claro
 */
function useSystemTheme() {
  // Verifica si la API matchMedia está disponible (solo en navegadores)
  const browserHasMatchMedia = typeof window !== 'undefined' && window.matchMedia;
  
  // Inicializa el estado con la preferencia actual del sistema si está disponible
  const [prefersDarkMode, setPrefersDarkMode] = useState(() => {
    if (browserHasMatchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false; // Por defecto, asume tema claro si no puede detectarse
  });

  useEffect(() => {
    if (!browserHasMatchMedia) return;
    
    // Crea el objeto mediaQuery para la preferencia de color
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Función que actualiza el estado cuando cambia la preferencia
    const handleChange = (event) => {
      setPrefersDarkMode(event.matches);
    };

    // Añade el listener para detectar cambios
    mediaQuery.addEventListener('change', handleChange);
    
    // Limpia el listener cuando el componente se desmonta
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [browserHasMatchMedia]);

  return prefersDarkMode;
}

export default useSystemTheme;
