import React, { useEffect } from 'react';

/**
 * Component that updates header text dynamically using DOM manipulation
 * This allows for consistent header text across the application
 */
const HeaderUpdater = () => {
  useEffect(() => {
    // Find header elements and update their text
    const headerElement = document.querySelector('.opciones-header h3');
    const subHeaderElement = document.querySelector('.opciones-header p');
    
    if (headerElement) {
      headerElement.textContent = 'Agregar opciones.';
    }
    
    if (subHeaderElement) {
      subHeaderElement.textContent = 'Alimentos';
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default HeaderUpdater;