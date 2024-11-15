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
      const userResponse = await axiosInstance.get('/api/auth/me');
      const userData = userResponse.data;

      // Hacemos todas las demás peticiones en paralelo
      const [
        packagesRes,
        tematicasRes,
        extrasRes,
        mamparasRes,
        foodOptionsRes,
        reservationsRes
      ] = await Promise.all([
        axiosInstance.get('/api/paquetes'),
        axiosInstance.get('/api/tematicas'),
        axiosInstance.get('/api/extras'),
        axiosInstance.get('/api/mamparas'),
        axiosInstance.get('/api/opcion-alimentos'),
        axiosInstance.get('/api/reservas')
      ]);

      setData({
        packages: packagesRes.data,
        tematicas: tematicasRes.data,
        extrasData: extrasRes.data,
        mamparas: mamparasRes.data,
        userData: userData,
        foodOptions: foodOptionsRes.data,
        existingReservations: reservationsRes.data,
        userReservations: reservationsRes.data,
        hasReservations: reservationsRes.data.length > 0
      });
    } catch (error) {
      console.error('Error fetching reservation data:', error);
      setError(error);
      
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
    refreshData
  };
};

// Also export a context provider for reservation data
export const setReservationData = (data) => {
  // This is a temporary function that will be replaced by the context provider
  console.log('Setting reservation data:', data);
  return data;
};