import { createContext, useContext } from 'react';

// Crear un contexto para la reserva
export const ReservationContext = createContext(null);

// Provider para envolver los componentes que necesitan acceso a los datos de reserva
export const ReservationProvider = ({ children, reservation }) => {
  return (
    <ReservationContext.Provider value={reservation}>
      {children}
    </ReservationContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de reserva
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    console.warn('useReservation debe ser usado dentro de un ReservationProvider');
  }
  return context;
};