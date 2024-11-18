import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../components/axiosConfig';
import 'react-datepicker/dist/react-datepicker.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import ReservationForm from './ReservationForm';
import ReservationSummary from './ReservationSummary';
import ConfirmationModal from './ConfirmationModal';
import PaymentModal from './PaymentModal';
import ReservationModal from './ReservationModal';
import TuesdayModal from './TuesdayModal';
import ContractModal from './ContractModal';

gsap.registerPlugin(ScrollTrigger);

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

const isActiveReservation = (reserva) => {
  return reserva.activo &&
    (reserva.estado === 'pendiente' || reserva.estado === 'confirmada');
};

const Reservation = () => {
  const {
    control,
    setValue,
    handleSubmit,
    register,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      packagePrice: 0,
      extrasTotal: 0,
      mamparaPrice: 0,
      tuesdayFee: 0,
      extras: [],
      total: 0,
      fecha_reserva: null,
      hora_inicio: null
    }
  });

  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [tematicas, setTematicas] = useState([]);
  const [extrasData, setExtrasData] = useState([]);
  const [reservationData, setReservationData] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [mamparas, setMamparas] = useState([]);
  const [userData, setUserData] = useState(null);
  const [foodOptions, setFoodOptions] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [hasReservations, setHasReservations] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [isTuesdayModalOpen, setIsTuesdayModalOpen] = useState(false);
  const [existingReservations, setExistingReservations] = useState([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  

  const formRef = useRef(null);
  const summaryRef = useRef(null);

  const handleFieldChange = (fieldName, value) => {
    setValue(fieldName, value, {
      shouldValidate: false,
      shouldDirty: true
    });
  };

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

    fetchUserData();
    fetchPackages();
    fetchFoodOptions();
    fetchTematicas();
    fetchExtras();
    fetchMamparas();
    fetchUnavailableDates();
    

    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        scrollTrigger: { trigger: formRef.current, start: 'top 80%' }
      }
    );
    gsap.fromTo(
      summaryRef.current,
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        scrollTrigger: { trigger: summaryRef.current, start: 'top 80%' }
      }
    );
  }, [navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/api/usuarios/me', getAuthHeader());
      setUserData(response.data);
      const reservationsResponse = await axiosInstance.get('/api/reservas/user', getAuthHeader());
      const userReservs = reservationsResponse.data;
      setUserReservations(userReservs);
      setHasReservations(userReservs.length > 0);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      toast.error('Error al cargar los datos del usuario');
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get('/api/paquetes', getAuthHeader());
      setPackages(response.data);
    } catch (error) {
      console.error('Error al obtener los paquetes:', error);
      toast.error('Error al cargar los paquetes');
    }
  };

  const fetchMamparas = async () => {
    try {
      const response = await axiosInstance.get('/api/mamparas', getAuthHeader());
      setMamparas(response.data);
    } catch (error) {
      console.error('Error al obtener las mamparas:', error);
      toast.error('Error al cargar las mamparas');
    }
  };

  const fetchFoodOptions = async () => {
    try {
      const response = await axiosInstance.get('/api/opciones-alimentos', getAuthHeader());
      setFoodOptions(response.data);
    } catch (error) {
      console.error('Error al obtener las opciones de alimentos:', error);
      toast.error('Error al cargar las opciones de alimentos');
    }
  };

  const fetchTematicas = async () => {
    try {
      const response = await axiosInstance.get('/api/tematicas', getAuthHeader());
      setTematicas(response.data);
    } catch (error) {
      console.error('Error al obtener las temáticas:', error);
      toast.error('Error al cargar las temáticas');
    }
  };

  const fetchExtras = async () => {
    try {
      const response = await axiosInstance.get('/api/extras', getAuthHeader());
      setExtrasData(response.data);
    } catch (error) {
      console.error('Error al obtener los extras:', error);
      toast.error('Error al cargar los extras');
    }
  };

  const fetchUnavailableDates = async () => {
    try {
      const response = await axiosInstance.get('/api/reservas', getAuthHeader());
      const activeReservations = response.data.filter(isActiveReservation);
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
      console.error('Error al obtener las fechas no disponibles:', error);
      toast.error('Error al cargar las fechas no disponibles');
    }
  };

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

  const onSubmit = async (data) => {
    console.log('Datos del formulario:', data);
  
    try {
      // Validar que la fecha sea un objeto Date válido
      if (!(data.fecha_reserva instanceof Date) || isNaN(data.fecha_reserva.getTime())) {
        console.error('Fecha de reserva inválida:', data.fecha_reserva);
        toast.error('La fecha de reserva es inválida');
        return;
      }
  
      // Validar que el horario sea válido
      if (!data.hora_inicio || !['mañana', 'tarde'].includes(data.hora_inicio)) {
        console.error('Horario inválido:', data.hora_inicio);
        toast.error('El horario es inválido');
        return;
      }
  
      // Transformar el horario al formato esperado por el backend
      const timeSlot = data.hora_inicio === 'mañana' ? TIME_SLOTS.MORNING : TIME_SLOTS.AFTERNOON;
  
      // Crear una nueva instancia de Date para evitar problemas de referencia
      const fecha = new Date(data.fecha_reserva.getTime());
      fecha.setHours(0, 0, 0, 0);
  
      console.log('Fecha de reserva:', fecha);
  
      const selectedPackage = packages.find(
        (pkg) => pkg.id.toString() === data.id_paquete?.toString()
      );
      const selectedFoodOption = foodOptions.find(
        (option) => option.id.toString() === data.id_opcion_alimento?.toString()
      );
      const selectedTematica = tematicas.find(
        (t) => t.id.toString() === data.id_tematica?.toString()
      );
      const selectedMampara = mamparas.find(
        (m) => m.id.toString() === data.id_mampara?.toString()
      );
      const selectedExtras = data.extras || [];
  
      console.log('Paquete seleccionado:', selectedPackage);
      console.log('Opción de alimento seleccionada:', selectedFoodOption);
      console.log('Temática seleccionada:', selectedTematica);
      console.log('Mampara seleccionada:', selectedMampara);
      console.log('Extras seleccionados:', selectedExtras);
  
      let packagePrice = calculatePackagePrice(selectedPackage, fecha);
      let total = packagePrice;
  
      if (selectedFoodOption) {
        total += parseFloat(selectedFoodOption.precio_extra) || 0;
      }
  
      total += parseFloat(data.tuesdayFee) || 0;
  
      if (selectedMampara) {
        total += parseFloat(selectedMampara.precio) || 0;
      }
  
      selectedExtras.forEach((extra) => {
        const extraInfo = extrasData.find((e) => e.id.toString() === extra.id.toString());
        if (extraInfo) {
          total += (parseFloat(extraInfo.precio) || 0) * (parseInt(extra.cantidad) || 1);
        }
      });
  
      const formattedTotal = total.toFixed(2);
  
      const reservationData = {
        ...data,
        id_usuario: userData?.id,
        estado: 'pendiente',
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
  
      console.log('Datos de reserva:', reservationData);
  
      setReservationData(reservationData);
      setIsConfirmationModalOpen(true);
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast.error('Ocurrió un error al procesar la reserva. Por favor, intenta de nuevo.');
    }
  };

  const saveReservation = async () => {
    try {
      const { id, ...reservationDataWithoutId } = reservationData;
      const response = await axiosInstance.post(
        '/api/reservas',
        reservationDataWithoutId,
        getAuthHeader()
      );

      if (response.status === 201) {
        const savedReservation = response.data;
        setReservationData(prevData => ({ ...prevData, ...savedReservation }));
        toast.success('Reserva creada exitosamente');
        setShowContractModal(true);
        fetchUnavailableDates();
      } else {
        throw new Error('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${error.response.data.message || error.response.data
          }`
        );
      } else {
        toast.error('Error al guardar la reserva. Por favor, intenta nuevamente.');
      }
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  const handlePaymentConfirm = async paymentData => {
    try {
      const response = await axiosInstance.post(
        '/api/pagos',
        {
          ...paymentData,
          id_reserva: reservationData.id
        },
        getAuthHeader()
      );
      if (response.status === 201) {
        toast.success('Reserva y pago completados con éxito');
        setIsPaymentModalOpen(false);
        setIsReservationModalOpen(true);
        reset();
        fetchUnavailableDates();
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago. Por favor, intenta nuevamente.');
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  const handleContractAccept = () => {
    setContractAccepted(true);
    setShowContractModal(false);
    toast.success('Contrato aceptado exitosamente');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8'>
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
      <div className='max-w-7xl mx-auto'>
        {hasReservations && (
          <div className='mb-8'>
            <button
              onClick={() => {
                const firstReservationId = userReservations[0].id;
                navigate(`/reservation-status/${firstReservationId}`);
              }}
              className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
            >
              Ver Estado de Reservas Anteriores
            </button>
          </div>
        )}
        <h1 className='text-4xl font-bold text-center text-indigo-800 mb-12'>
          Crea tu Reserva Mágica
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <div ref={formRef} className='bg-white rounded-lg shadow-xl p-8'>
            <h2 className='text-2xl font-semibold mb-6 text-indigo-700'>
              Detalles de la Reserva
            </h2>
            <ReservationForm
              onSubmit={onSubmit}
              handleSubmit={handleSubmit}
              packages={packages}
              foodOptions={foodOptions}
              tematicas={tematicas}
              mamparas={mamparas}
              extras={extrasData}
              control={control}
              errors={errors}
              watch={watch}
              setValue={handleFieldChange}
              unavailableDates={unavailableDates}
              existingReservations={existingReservations}
              setIsTuesdayModalOpen={setIsTuesdayModalOpen}
            />
          </div>

          <div ref={summaryRef}>
            <ReservationSummary
              control={control}
              packages={packages}
              foodOptions={foodOptions}
              tematicas={tematicas}
              mamparas={mamparas}
              extras={extrasData}
            />
          </div>
        </div>
      </div>

      {isConfirmationModalOpen && (
        <ConfirmationModal
          reservationData={reservationData}
          packages={packages}
          foodOptions={foodOptions}
          tematicas={tematicas}
          onCancel={() => setIsConfirmationModalOpen(false)}
          onConfirm={() => {
            setIsConfirmationModalOpen(false);
            saveReservation();
          }}
        />
      )}

      {showContractModal && (
        <ContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          onAccept={handleContractAccept}
        />
      )}

      {contractAccepted && isPaymentModalOpen && (
        <PaymentModal
          reservationData={reservationData}
          setReservationData={setReservationData}
          onCancel={() => setIsPaymentModalOpen(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {isReservationModalOpen && (
        <ReservationModal
          reservationData={reservationData}
          packages={packages}
          extrasData={extrasData}
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}

      {isTuesdayModalOpen && (
        <TuesdayModal
          onClose={() => {
            setIsTuesdayModalOpen(false);
            setValue('fecha_reserva', null);
            setValue('tuesdayFee', 0);
          }}
          onConfirm={() => setIsTuesdayModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Reservation;