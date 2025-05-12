import React from 'react';
import Home from './Home'; // Importa el componente real de la página de inicio

/**
 * Componente contenedor para la página principal que agrega la clase home-public
 * Esta clase se usa para excluir la página principal de los cambios de tema en modo oscuro
 */
const PublicHomeContainer = (props) => {
  return (
    <div className="home-public">
      <Home {...props} />
    </div>
  );
};

export default PublicHomeContainer; 