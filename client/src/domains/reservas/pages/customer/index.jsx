import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import axiosInstance from '@/components/axiosConfig';
import { FiArrowLeft, FiCalendar, FiPackage, FiImage, FiClock, FiUsers } from 'react-icons/fi';
import ParticlesBackground from '../../public/home-components/decorative/ParticlesBackground';
import AnimatedBalloons from '../../public/home-components/decorative/AnimatedBalloons';

// Componente principal de flujo paso a paso
import StepperReservation from './StepperReservation';

// Modales
import ContractModal from './ContractModal';
import PaymentModal from './PaymentModal';
import TuesdayModal from './TuesdayModal';
import ConfirmationModal from './ConfirmationModal';
import QuotationConfirmationModal from './QuotationConfirmationModal';

// Stores
import usePreReservasStore from '@/store/preReservasStore';
import useCotizacionesStore from '@/store/cotizacionesStore';

// Constantes para slots de tiempo
const TIME_SLOTS = {
  MORNING: {
    label: 'Mañana (11:00 - 16:00)',
    value: 'mañana',
    start: '11:00:00',
    end: '16:00:00'
  },
  AFTERNOON: {
    label: 'Tarde (17:00 - 22:00)',
    value: 'tarde',
    start: '17:00:00',
    end: '22:00:00'
  }
};

// Función para verificar si una reserva está activa
const isActiveReservation = (reserva) => {
  return reserva.activo &&
    (reserva.estado === 'pendiente' || reserva.estado === 'confirmada');
};

// Tiempo máximo para completar la pre-reserva (en minutos)
const PRE_RESERVA_TIMEOUT = 30;

// Componente de tarjeta de información
const InfoCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="bg-white/85 dark:bg-gray-800/85 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300"
  >
    <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-3 mb-4">
      <Icon className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
  </motion.div>
);

const ReservationPage = () => {
  const navigate = useNavigate();
  
  // Estados para datos de API
  const [packages, setPackages] = useState([]);
  const [tematicas, setTematicas] = useState([]);
  const [extrasData, setExtrasData] = useState([]);
  const [mamparas, setMamparas] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [existingReservations, setExistingReservations] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  
  // Estados para modales
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTuesdayModalOpen, setIsTuesdayModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  
  // Estados para flujo de reserva
  const [reservationData, setReservationData] = useState(null);
  const [hasReservations, setHasReservations] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCotizacion, setIsCotizacion] = useState(true); // Por defecto, crear cotización

  // Obtener cabecera de autenticación
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Efecto para simular la carga progresiva
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Efecto para cargar datos al iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No se ha iniciado sesión. Redirigiendo al inicio de sesión...', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    const loadAllData = async () => {
      try {
        // Cargar datos en paralelo para optimizar
        const [
          userResponse,
          packagesResponse,
          tematicasResponse,
          foodOptionsResponse,
          mamparasResponse,
          extrasResponse,
          reservationsResponse
        ] = await Promise.all([
          axiosInstance.get('/usuarios/me', getAuthHeader()),
          axiosInstance.get('/paquetes', getAuthHeader()),
          axiosInstance.get('/tematicas', getAuthHeader()),
          axiosInstance.get('/opciones-alimentos', getAuthHeader()),
          axiosInstance.get('/mamparas', getAuthHeader()),
          axiosInstance.get('/extras', getAuthHeader()),
          axiosInstance.get('/reservas', getAuthHeader())
        ]);

        // Inicializar datos
        setUserData(userResponse.data);
        setPackages(packagesResponse.data);
        setTematicas(tematicasResponse.data);
        setFoodOptions(foodOptionsResponse.data);
        setMamparas(mamparasResponse.data);
        setExtrasData(extrasResponse.data);

        // Procesar reservas
        const allReservations = reservationsResponse.data;
        const userReservs = await axiosInstance.get('/reservas/user', getAuthHeader());
        setUserReservations(userReservs.data);
        setHasReservations(userReservs.data.length > 0);

        // Procesar fechas no disponibles
        const activeReservations = allReservations.filter(isActiveReservation);
        setExistingReservations(activeReservations);

        const reservationsByDate = activeReservations.reduce((acc, reserva) => {
          const dateStr = reserva.fecha_reserva.split('T')[0];
          if (!acc[dateStr]) {
            acc[dateStr] = {
              morning: false,
              afternoon: false
            };
          }

          if (reserva.hora_inicio === TIME_SLOTS.MORNING.start) {
            acc[dateStr].morning = true;
          }
          if (reserva.hora_inicio === TIME_SLOTS.AFTERNOON.start) {
            acc[dateStr].afternoon = true;
          }

          return acc;
        }, {});

        const fullyBookedDates = Object.entries(reservationsByDate)
          .filter(([_, slots]) => slots.morning && slots.afternoon)
          .map(([dateStr]) => new Date(dateStr));

        setUnavailableDates(fullyBookedDates);
      } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        toast.error('Error al cargar los datos. Por favor, recarga la página.');
        if (error.response?.status === 401) {
          navigate('/signin');
        }
      }
    };

    loadAllData();
  }, [navigate]);

  // Calcular precio del paquete según día de la semana
  const calculatePackagePrice = (selectedPackage, fecha) => {
    if (!selectedPackage || !fecha) return 0;

    const reservationDate = new Date(fecha);
    const dayOfWeek = reservationDate.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return parseFloat(selectedPackage.precio_lunes_jueves) || 0;
    } else {
      return parseFloat(selectedPackage.precio_viernes_domingo) || 0;
    }
  };

  // Obtener las funciones y estados de los stores
  const {
    iniciarProcesoPago,
    confirmarPago,
    loading: preReservaLoading,
    error: preReservaError,
    pagoEnProceso,
    preReserva,
    limpiarPreReserva
  } = usePreReservasStore();
  
  const {
    crearCotizacion,
    loading: cotizacionLoading,
    error: cotizacionError,
    cotizacionActual,
    limpiarCotizacionActual
  } = useCotizacionesStore();

  // Manejar envío de formulario (puede ser cotización o reserva)
  const handleReservationSubmit = async (data) => {
    try {
      // Validar fecha y hora
      if (!(data.fecha_reserva instanceof Date) || isNaN(data.fecha_reserva.getTime())) {
        toast.error('La fecha de reserva es inválida');
        return;
      }

      if (!data.hora_inicio) {
        toast.error('El horario es inválido');
        return;
      }

      // Transformar hora al formato del backend
      const timeSlotValue = typeof data.hora_inicio === 'object' ?
        data.hora_inicio.value : data.hora_inicio;
      
      const timeSlot = timeSlotValue === 'mañana' ?
        TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;

      // Crear fecha sin hora para backend
      const fecha = new Date(data.fecha_reserva.getTime());
      fecha.setHours(0, 0, 0, 0);

      // Obtener elementos seleccionados
      const selectedPackage = packages.find(pkg => pkg.id === data.id_paquete);
      const selectedFoodOption = foodOptions.find(option => option.id === data.id_opcion_alimento);
      const selectedTematica = tematicas.find(t => t.id === data.id_tematica);
      const selectedMampara = mamparas.find(m => m.id === data.id_mampara);

      // Procesar extras seleccionados
      const selectedExtras = (data.extras || []).map(extra => {
        const extraInfo = extrasData.find(e => e.id === extra.id);
        return {
          ...extra,
          nombre: extraInfo?.nombre,
          precio: extraInfo?.precio,
          descripcion: extraInfo?.descripcion
        };
      });

      // Calcular precio total
      let packagePrice = calculatePackagePrice(selectedPackage, fecha);
      let total = packagePrice;

      if (selectedFoodOption) {
        total += parseFloat(selectedFoodOption.precio_extra) || 0;
      }

      total += parseFloat(data.tuesdayFee) || 0;

      if (selectedMampara) {
        total += parseFloat(selectedMampara.precio) || 0;
      }

      if (selectedTematica) {
        total += parseFloat(selectedTematica.precio) || 0;
      }

      selectedExtras.forEach((extra) => {
        if (extra.precio && extra.cantidad) {
          total += (parseFloat(extra.precio) || 0) * (parseInt(extra.cantidad) || 1);
        }
      });

      const formattedTotal = total.toFixed(2);

      // Crear objeto de datos para cotización o reserva
      const formData = {
        ...data,
        id_usuario: userData?.id,
        packagePrice: packagePrice,
        total: parseFloat(formattedTotal),
        extras: selectedExtras,
        paquete_nombre: selectedPackage?.nombre,
        opcion_alimento_nombre: selectedFoodOption?.nombre,
        tematica_nombre: selectedTematica?.nombre,
        mampara_nombre: selectedMampara?.nombre,
        fecha_reserva: fecha.toISOString().split('T')[0],
        hora_inicio: timeSlot.start,
        hora_fin: timeSlot.end,
        martes_fee: data.tuesdayFee || 0,
      };

      setReservationData(formData);
      
      // Mostrar el modal correspondiente según el flujo seleccionado
      if (isCotizacion) {
        setIsQuotationModalOpen(true);
      } else {
        setIsConfirmationModalOpen(true);
      }
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      toast.error('Ocurrió un error al procesar la reserva. Por favor, intenta nuevamente.');
    }
  };

  // Iniciar el proceso de pago para reserva directa
  const iniciarPago = async () => {
    try {
      setIsConfirmationModalOpen(false);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error('Error al iniciar el proceso de pago:', error);
      toast.error('Error al iniciar el proceso de pago. Por favor, intenta nuevamente.');
    }
  };
  
  // Crear cotización
  const iniciarCotizacion = async () => {
    try {
      setIsQuotationModalOpen(false);
      
      // Crear cotización en el backend
      const resultado = await crearCotizacion(reservationData);
      
      // Mostrar mensaje de éxito
      toast.success('¡Cotización creada con éxito! Puedes revisarla en tu perfil.');
      
      // Navegar a la página de cotizaciones
      navigate('/customer/cotizaciones');
    } catch (error) {
      console.error('Error al crear cotización:', error);
      toast.error('Error al crear la cotización. Por favor, intenta nuevamente.');
    }
  };

  // Función para manejar la selección del método de pago
  const handleSelectPaymentMethod = async (metodoPago) => {
    try {
      // Iniciar proceso de pago con pre-reserva
      await iniciarProcesoPago(reservationData, metodoPago);
      
      // Cerrar modal de pago y mostrar modal de confirmación
      setIsPaymentModalOpen(false);
      setIsConfirmationModalOpen(true);
    } catch (error) {
      console.error('Error al iniciar proceso de pago:', error);
      // El error se maneja en el store y se muestra en el modal
    }
  };

  // Manejar confirmación de pago
  const handlePaymentConfirm = async () => {
    try {
      const result = await confirmarPago();
      toast.success('¡Reserva confirmada con éxito!');
      
      // Limpiar datos de pre-reserva
      limpiarPreReserva();
      
      // Navegar a la página de estado de reserva
      navigate(`/customer/reservationstatus/${result.reserva.id}`);
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      // El error se maneja en el store y se muestra en el modal
    }
  };

  // Manejar aceptación de contrato
  const handleContractAccept = () => {
    setContractAccepted(true);
    setIsContractModalOpen(false);
    toast.success('Contrato aceptado exitosamente');
    setIsPaymentModalOpen(true);
  };

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="w-64 h-64 relative">
          <div className="w-full h-full rounded-full border-8 border-indigo-200 dark:border-indigo-900"></div>
          <div 
            className="absolute top-0 left-0 w-full h-full rounded-full border-t-8 border-l-8 border-indigo-600 dark:border-indigo-400"
            style={{ 
              transform: 'rotate(0deg)',
              animation: 'spin 1.5s linear infinite'
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-indigo-700 dark:text-indigo-300">
            {loadingProgress}%
          </div>
        </div>
        <h2 className="mt-8 text-xl font-semibold text-indigo-800 dark:text-indigo-300">Preparando tu experiencia mágica...</h2>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-950 overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ParticlesBackground color="#4f46e5" />
      </div>
      
      <div className="absolute top-0 right-0 -z-10 opacity-20">
        <AnimatedBalloons count={15} />
      </div>
      
      {/* Decoración con imágenes */}
      <div className="absolute top-10 left-10 -rotate-6 w-32 h-32 opacity-20">
        <img src="/client/src/img/balloons.png" alt="" className="w-full h-full object-contain" />
      </div>
      
      <div className="absolute bottom-10 right-10 rotate-12 w-32 h-32 opacity-20">
        <img src="/client/src/img/confetti.png" alt="" className="w-full h-full object-contain" />
      </div>
      
      {/* Contenedor principal */}
      <div className="relative z-10 py-12 px-4 sm:px-6">
        {/* Notificaciones Toast */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
        
        <div className="max-w-7xl mx-auto">
          {/* Cabecera */}
          <div className="mb-12 flex flex-col items-center">
            <button
              onClick={() => navigate('/')}
              className="self-start mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Regresar al Inicio</span>
            </button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-800 dark:text-indigo-300 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {isCotizacion ? 'Crea tu Cotización' : 'Crea tu Reserva Mágica'}
              </span>
            </h1>
            
            <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl">
              {isCotizacion
                ? 'Personaliza tu evento y obtén una cotización sin compromiso'
                : 'Sigue los pasos para personalizar tu evento y crear una experiencia inolvidable'}
            </p>
            
            <div className="mt-6 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 inline-flex">
                <button
                  onClick={() => setIsCotizacion(true)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isCotizacion
                      ? 'bg-indigo-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Cotización
                </button>
                <button
                  onClick={() => setIsCotizacion(false)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    !isCotizacion
                      ? 'bg-indigo-600 text-white'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Reserva Directa
                </button>
              </div>
            </div>
            
            {hasReservations && (
              <button
                onClick={() => navigate('/customer/reservationstatus')}
                className="mt-6 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Ver mis reservas actuales
              </button>
            )}
          </div>
          
          {/* Información destacada */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <InfoCard
              icon={FiPackage}
              title="Personalización Total"
              description="Elige el paquete perfecto para tu evento y personalízalo con extras únicos"
            />
            <InfoCard
              icon={FiCalendar}
              title="Fecha Flexible"
              description="Selecciona la fecha ideal para tu celebración con nuestro calendario interactivo"
            />
            <InfoCard
              icon={FiImage}
              title="Temáticas Únicas"
              description="Explora nuestras temáticas especiales para hacer de tu evento algo inolvidable"
            />
            <InfoCard
              icon={FiUsers}
              title="Atención Personalizada"
              description="Estamos para ayudarte en cada paso del proceso de reservación"
            />
          </div>
          
          {/* StepperReservation componente principal */}
          <StepperReservation
            packages={packages}
            tematicas={tematicas}
            mamparas={mamparas}
            foodOptions={foodOptions}
            extras={extrasData}
            unavailableDates={unavailableDates}
            existingReservations={existingReservations}
            onSubmit={handleReservationSubmit}
            setIsTuesdayModalOpen={setIsTuesdayModalOpen}
          />
        </div>
      </div>
      
      {/* Modales */}
          {/* Modal de cotización */}
          {isQuotationModalOpen && (
            <QuotationConfirmationModal
              reservationData={reservationData}
              packages={packages}
              foodOptions={foodOptions}
              tematicas={tematicas}
              extras={extrasData}
              mamparas={mamparas}
              onCancel={() => setIsQuotationModalOpen(false)}
              onConfirm={iniciarCotizacion}
            />
          )}
          
          {/* Modal de confirmación de pago */}
          {isConfirmationModalOpen && pagoEnProceso ? (
            // Modal de confirmación para pago ya iniciado
            <ConfirmationModal
              onClose={() => setIsConfirmationModalOpen(false)}
              onConfirm={handlePaymentConfirm}
            />
          ) : isConfirmationModalOpen && !pagoEnProceso && (
            // Modal de confirmación de datos antes de pago
            <ConfirmationModal
              reservationData={reservationData}
              packages={packages}
              foodOptions={foodOptions}
              tematicas={tematicas}
              extras={extrasData}
              mamparas={mamparas}
              onCancel={() => setIsConfirmationModalOpen(false)}
              onConfirm={iniciarPago}
            />
          )}

          {isPaymentModalOpen && (
            <PaymentModal
              total={reservationData?.total || 0}
              onClose={() => setIsPaymentModalOpen(false)}
              onSelectPaymentMethod={handleSelectPaymentMethod}
              loading={preReservaLoading}
            />
          )}

          {isContractModalOpen && (
            <ContractModal
              isOpen={isContractModalOpen}
              onClose={() => setIsContractModalOpen(false)}
              onAccept={handleContractAccept}
            />
          )}

          {isTuesdayModalOpen && (
            <TuesdayModal
              onClose={() => setIsTuesdayModalOpen(false)}
              onConfirm={() => setIsTuesdayModalOpen(false)}
            />
          )}

          {/* Mostrar mensajes de error */}
          {preReservaError && (
            <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded shadow-lg z-50">
              <p className="font-bold">Error</p>
              <p>{preReservaError}</p>
            </div>
          )}
          
          {cotizacionError && (
            <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded shadow-lg z-50">
              <p className="font-bold">Error</p>
              <p>{cotizacionError}</p>
            </div>
          )}
    </div>
  );
};

export default ReservationPage;