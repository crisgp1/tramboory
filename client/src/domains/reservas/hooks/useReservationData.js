import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../components/axiosConfig';

export const useReservationData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    packages: [],
    tematicas: [],
    extrasData: [],
    mamparas: [],
    userData: null,
    foodOptions: [],
    existingReservations: [],
    userReservations: [],
    hasReservations: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Primero obtenemos los datos del usuario ya que lo necesitamos para las reservaciones
      const userResponse = await axiosInstance.get('/usuarios/me'); // Cambiado de '/auth/me' a '/usuarios/me' para mantener consistencia
      const userData = userResponse.data;

      // Hacemos todas las demás peticiones en paralelo
      const [
        packagesRes,
        tematicasRes,
        extrasRes,
        mamparasRes,
        foodOptionsRes,
        reservationsRes,
        userReservationsRes
      ] = await Promise.all([
        axiosInstance.get('/paquetes'),
        axiosInstance.get('/tematicas'),
        axiosInstance.get('/extras'),
        axiosInstance.get('/mamparas'),
        axiosInstance.get('/opciones-alimentos'),
        axiosInstance.get('/reservas'),
        axiosInstance.get('/reservas/user')
      ]);

      setData({
        packages: packagesRes.data,
        tematicas: tematicasRes.data,
        extrasData: extrasRes.data,
        mamparas: mamparasRes.data,
        userData: userData,
        foodOptions: foodOptionsRes.data,
        existingReservations: reservationsRes.data,
        userReservations: userReservationsRes.data,
        hasReservations: userReservationsRes.data.length > 0
      });
    } catch (error) {
      console.error('Error fetching reservation data:', error);
      
      // Convertimos el error a un mensaje de texto para evitar errores de renderizado
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Error desconocido al cargar datos';
      
      setError(errorMessage); // Guardamos solo el mensaje de error, no el objeto completo
      
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigate('/signin');
        return;
      }
      
      toast.error('Error al cargar los datos necesarios. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear una reserva de manera segura
  const createReservation = async (reservationData) => {
    try {
      const response = await axiosInstance.post('/reservas', reservationData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating reservation:', error);
      
      // Convertimos el error a un mensaje de texto
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Error desconocido al crear la reserva';
      
      return { success: false, message: errorMessage };
    }
  };

  // Función para recargar los datos
  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...data,
    isLoading,
    error,
    refreshData,
    createReservation // Añadimos la función para crear reservas
  };
};

// Also export a context provider for reservation data
export const setReservationData = (data) => {
  // This is a temporary function that will be replaced by the context provider
  console.log('Setting reservation data:', data);
  return data;
};