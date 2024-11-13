// Reservation.js
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../components/axiosConfig'
import 'react-datepicker/dist/react-datepicker.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'
import ReservationForm from './ReservationForm'
import ReservationSummary from './ReservationSummary'
import ConfirmationModal from './ConfirmationModal'
import PaymentModal from './PaymentModal'
import ReservationModal from './ReservationModal'
import TuesdayModal from './TuesdayModal';
import ContractModal from './ContractModal';

gsap.registerPlugin(ScrollTrigger)

const Reservation = () => {
  const {
    control,
    setValue,
    handleSubmit,
    register,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      extras: [],
      tuesdayFee: 0
    },
    mode: 'onChange', // Cambiado a onChange para mejor manejo de validaciones
    reValidateMode: 'onChange', // Asegura revalidación en cambios
    shouldUnregister: false
  })

  const navigate = useNavigate()

  const [packages, setPackages] = useState([])
  const [tematicas, setTematicas] = useState([])
  const [extrasData, setExtrasData] = useState([])
  const [reservationData, setReservationData] = useState(null)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [mamparas, setMamparas] = useState([])
  const [userData, setUserData] = useState(null)
  const [foodOptions, setFoodOptions] = useState([])
  const [unavailableDates, setUnavailableDates] = useState([])
  const [hasReservations, setHasReservations] = useState(false)
  const [userReservations, setUserReservations] = useState([])
  const [isTuesdayModalOpen, setIsTuesdayModalOpen] = useState(false); 
  const [existingReservations, setExistingReservations] = useState([]);
  const [showContractModal, setShowContractModal] = useState(false);
const [contractAccepted, setContractAccepted] = useState(false);

  const formRef = useRef(null)
  const summaryRef = useRef(null)


  const handleFieldChange = (fieldName, value, shouldValidate = true) => {
    setValue(fieldName, value, {
      shouldValidate,
      shouldDirty: true,
      shouldTouch: true
    })
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error(
        'No se ha iniciado sesión. Redirigiendo al inicio de sesión...'
      )
      setTimeout(() => navigate('/signin'), 2000)
      return
    }

    fetchUserData()
    fetchPackages()
    fetchFoodOptions()
    fetchTematicas()
    fetchExtras()
    fetchMamparas()
    fetchUnavailableDates()

    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        scrollTrigger: { trigger: formRef.current, start: 'top 80%' }
      }
    )
    gsap.fromTo(
      summaryRef.current,
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        scrollTrigger: { trigger: summaryRef.current, start: 'top 80%' }
      }
    )
  }, [navigate])

  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me', getAuthHeader())
      setUserData(response.data)
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error)
      toast.error('Error al cargar los datos del usuario')
      if (error.response && error.response.status === 401) {
        navigate('/signin')
      }
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await axiosInstance.get('/api/paquetes', getAuthHeader())
      setPackages(response.data)
    } catch (error) {
      console.error('Error al obtener los paquetes:', error)
      toast.error('Error al cargar los paquetes')
    }
  }

  const fetchMamparas = async () => {
    try {
      const response = await axiosInstance.get('/api/mamparas', getAuthHeader())
      setMamparas(response.data)
    } catch (error) {
      console.error('Error al obtener las mamparas:', error)
      toast.error('Error al cargar las mamparas')
    }
  }

  const fetchFoodOptions = async () => {
    try {
      const response = await axiosInstance.get(
        '/api/opciones-alimentos',
        getAuthHeader()
      )
      setFoodOptions(response.data)
    } catch (error) {
      console.error('Error al obtener las opciones de alimentos:', error)
      toast.error('Error al cargar las opciones de alimentos')
    }
  }

  const fetchTematicas = async () => {
    try {
      const response = await axiosInstance.get(
        '/api/tematicas',
        getAuthHeader()
      )
      setTematicas(response.data)
    } catch (error) {
      console.error('Error al obtener las temáticas:', error)
      toast.error('Error al cargar las temáticas')
    }
  }

  const fetchExtras = async () => {
    try {
      const response = await axiosInstance.get('/api/extras', getAuthHeader())
      setExtrasData(response.data)
    } catch (error) {
      console.error('Error al obtener los extras:', error)
      toast.error('Error al cargar los extras')
    }
  }
// Constantes para estados de reserva
const RESERVATION_STATES = {
  PENDING: 'pendiente',
  CONFIRMED: 'confirmada', 
  CANCELLED: 'cancelada'
};

// Función helper para verificar si una reserva está activa
const isActiveReservation = (reservation) => {
  return reservation.estado === RESERVATION_STATES.CONFIRMED || 
         reservation.estado === RESERVATION_STATES.PENDING;
};

const fetchUnavailableDates = async () => {
  try {
    const response = await axiosInstance.get('/api/reservas', getAuthHeader());
    setExistingReservations(response.data);

    // Filtramos solo reservas activas (pendientes o confirmadas)
    const activeReservations = response.data.filter(isActiveReservation);

    const fullyBookedDates = activeReservations.reduce((acc, reserva) => {
      const dateStr = reserva.fecha_reserva.split('T')[0];
      const reservationsForDate = activeReservations.filter(
        r => r.fecha_reserva.split('T')[0] === dateStr
      );

      // Verificamos horarios ocupados por reservas activas
      const morningBooked = reservationsForDate.some(
        r => r.hora_inicio === 'mañana' && isActiveReservation(r)
      );
      const afternoonBooked = reservationsForDate.some(
        r => r.hora_inicio === 'tarde' && isActiveReservation(r)
      );

      // Si ambos horarios están ocupados, la fecha no está disponible
      if (morningBooked && afternoonBooked) {
        acc.push(new Date(dateStr));
      }
      
      return acc;
    }, []);

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
  
    // Si es de lunes a jueves (1-4)
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return parseFloat(selectedPackage.precio_lunes_jueves) || 0;
    } 
    // Si es viernes a domingo (5, 6, 0)
    else {
      return parseFloat(selectedPackage.precio_viernes_domingo) || 0;
    }
  };

  
  const onSubmit = async data => {
    try {
      const selectedPackage = packages.find(
        pkg => pkg.id.toString() === data.id_paquete?.toString()
      )
      const selectedFoodOption = foodOptions.find(
        option => option.id.toString() === data.id_opcion_alimento?.toString()
      )
      const selectedTematica = tematicas.find(
        t => t.id.toString() === data.id_tematica?.toString()
      )
      const selectedMampara = mamparas.find(
        m => m.id.toString() === data.id_mampara?.toString()
      )
      const selectedExtras = data.extras || []

      // Calcular el precio del paquete según el día
      let packagePrice = calculatePackagePrice(selectedPackage, data.fecha_reserva);
      let total = packagePrice;

      // Agregar precio de opción de alimento
      if (selectedFoodOption) {
        total += parseFloat(selectedFoodOption.precio_extra) || 0;
      }

      // Agregar cargo por martes si aplica
      total += parseFloat(data.tuesdayFee) || 0;

      // Agregar precio de mampara si se seleccionó
      if (selectedMampara) {
        total += parseFloat(selectedMampara.precio) || 0;
      }

      // Calcular total de extras
      selectedExtras.forEach(extra => {
        const extraInfo = extrasData.find(e => e.id.toString() === extra.id.toString());
        if (extraInfo) {
          total += (parseFloat(extraInfo.precio) || 0) * (parseInt(extra.cantidad) || 1);
        }
      });

      const formattedTotal = total.toFixed(2);

      // Actualizar los datos de la reserva con el precio calculado
      setReservationData({
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
        fecha_reserva: data.fecha_reserva.toISOString()
      });

      setIsConfirmationModalOpen(true);
    } catch (error) {
      console.error('Error en onSubmit:', error);
      toast.error('Ocurrió un error al procesar la reserva. Por favor, intenta de nuevo.');
    }
  }


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
        // En lugar de mostrar directamente el PaymentModal, mostrar primero el ContractModal
        setShowContractModal(true);
      } else {
        throw new Error('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error)
      if (error.response) { 
        console.error('Respuesta del servidor:', error.response.data)
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data.message || error.response.data
          }`
        )
      } else {
        toast.error(
          'Error al guardar la reserva. Por favor, intenta nuevamente.'
        )
      }
      if (error.response && error.response.status === 401) {
        navigate('/signin')
      }
    }
  }

  const handlePaymentConfirm = async paymentData => {
    try {
      const response = await axiosInstance.post(
        '/api/pagos',
        {
          ...paymentData,
          id_reserva: reservationData.id
        },
        getAuthHeader()
      )
      if (response.status === 201) {
        toast.success('Reserva y pago completados con éxito')
        setIsPaymentModalOpen(false)
        setIsReservationModalOpen(true)
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      toast.error('Error al procesar el pago. Por favor, intenta nuevamente.')
      if (error.response && error.response.status === 401) {
        navigate('/signin')
      }
    }
  }

  const handleContractAccept = () => {
    setContractAccepted(true);
    setShowContractModal(false);
    toast.success('Contrato aceptado exitosamente');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8'>
      <ToastContainer />
      <div className='max-w-7xl mx-auto'>
        {hasReservations && (
          <div className='mb-8'>
            <button
              onClick={() => {
                const firstReservationId = userReservations[0].id
                navigate(`/reservation-status/${firstReservationId}`)
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
          {/* Formulario de Reserva */}
          <div ref={formRef} className='bg-white rounded-lg shadow-xl p-8'>
            <h2 className='text-2xl font-semibold mb-6 text-indigo-700'>
              Detalles de la Reserva
            </h2>
            <ReservationForm
              onSubmit={handleSubmit(onSubmit)}
              packages={packages}
              foodOptions={foodOptions}
              tematicas={tematicas}
              mamparas={mamparas}
              extras={extrasData}
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={handleFieldChange}
              unavailableDates={unavailableDates}
              existingReservations={existingReservations}
              isTuesdayModalOpen={isTuesdayModalOpen}     
              setIsTuesdayModalOpen={setIsTuesdayModalOpen} 
            />
          </div>

          {/* Resumen de Reserva */}
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

      {/* Modales */}
      {isConfirmationModalOpen && (
        <ConfirmationModal
          reservationData={reservationData}
          packages={packages}
          foodOptions={foodOptions}
          tematicas={tematicas}
          onCancel={() => setIsConfirmationModalOpen(false)}
          onConfirm={() => {
            setIsConfirmationModalOpen(false)
            saveReservation()
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
          extrasData={extrasData} // Agrega esta línea
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}

{isTuesdayModalOpen && (
  <TuesdayModal
    onClose={() => {
      setIsTuesdayModalOpen(false);
      setValue('fecha_reserva', null); // Opcional: Reinicia la fecha si el usuario cancela
      setValue('tuesdayFee', 0);
    }}
    onConfirm={() => setIsTuesdayModalOpen(false)}
  />
)}

    </div>
  )
}

export default Reservation
