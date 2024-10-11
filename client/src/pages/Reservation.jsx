import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCalendar, FiClock, FiUser, FiPackage, FiDollarSign, FiCheck } from 'react-icons/fi';
import axiosInstance from '../components/axiosConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const schema = yup.object().shape({
  id_paquete: yup.number().required('Paquete es requerido'),
  fecha_reserva: yup.date().required('Fecha de reserva es requerida'),  
  hora_inicio: yup.string().oneOf(['mañana', 'tarde'], 'Hora de inicio inválida').required('Hora de inicio es requerida'),
  nombre_festejado: yup.string().required('Nombre del festejado es requerido'),
  edad_festejado: yup.number().positive('La edad debe ser positiva').integer('La edad debe ser un número entero').required('Edad del festejado es requerida'),
  tematica: yup.string().required('La temática es requerida'),
  cupcake: yup.boolean().required('Debe especificar si incluye cupcake'),
  mampara: yup.boolean().required('Debe especificar si incluye mampara'),
  piñata: yup.boolean().required('Debe especificar si incluye piñata'),
  comentarios: yup.string(),
});

export default function Reservation() {
  const [packages, setPackages] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [reservationData, setReservationData] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userData, setUserData] = useState(null);

  const formRef = useRef(null);
  const summaryRef = useRef(null);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      cupcake: false,
      mampara: false,
      piñata: false,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("No se ha iniciado sesión. Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    fetchUserData();
    fetchPackages();
    fetchFoodOptions();

    gsap.fromTo(formRef.current, 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 1, scrollTrigger: { trigger: formRef.current, start: "top 80%" } }
    );
    gsap.fromTo(summaryRef.current, 
      { opacity: 0, x: 50 }, 
      { opacity: 1, x: 0, duration: 1, scrollTrigger: { trigger: summaryRef.current, start: "top 80%" } }
    );
  }, [navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchUserData = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/me', getAuthHeader());
        setUserData(response.data);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      toast.error('Error al cargar los datos del usuario');
      if (error.response && error.response.status === 401) {
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

  const fetchFoodOptions = async () => {
    try {
      const response = await axiosInstance.get('/api/opciones-alimentos', getAuthHeader());
      setFoodOptions(response.data);
    } catch (error) {
      console.error('Error al obtener las opciones de alimentos:', error);
      toast.error('Error al cargar las opciones de alimentos');
    }
  };

  const onSubmit = async (data) => {
    const selectedPackage = packages.find((pkg) => pkg.id === data.id_paquete);
    const selectedFoodOption = foodOptions.find((option) => option.id === data.id_opcion_alimento);

    let total = selectedPackage ? selectedPackage.precio : 0;
    if (selectedFoodOption) {
      total += selectedFoodOption.precio_extra;
    }

    setReservationData({
      ...data,
      id_usuario: userData.id,
      estado: 'pendiente',
      total: total,
  });
  setIsConfirmationModalOpen(true);
};

  const saveReservation = async () => {
    try {
      const response = await axiosInstance.post('/api/reservas', reservationData, getAuthHeader());
      if (response.status === 201) {
        toast.success('Reserva creada exitosamente');
        setIsReservationModalOpen(true);
      } else {
        throw new Error('Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      toast.error('Error al guardar la reserva');
      if (error.response && error.response.status === 401) {
        navigate('/signin');
      }
    }
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-12">Crea tu Reserva Mágica</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulario de Reserva */}
          <div ref={formRef} className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Detalles de la Reserva</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paquete</label>
                <div className="relative">
                  <FiPackage className="absolute top-3 left-3 text-gray-400" />
                  <select 
                    {...register('id_paquete')}
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccionar paquete</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.nombre} - ${pkg.precio}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.id_paquete && <p className="mt-1 text-sm text-red-600">{errors.id_paquete.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reserva</label>
                <div className="relative">
                  <FiCalendar className="absolute top-3 left-3 text-gray-400" />
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setValue('fecha_reserva', date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={today}
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    placeholderText="Seleccionar fecha"
                  />
                </div>
                {errors.fecha_reserva && <p className="mt-1 text-sm text-red-600">{errors.fecha_reserva.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio</label>
                <div className="relative">
                  <FiClock className="absolute top-3 left-3 text-gray-400" />
                  <select 
                    {...register('hora_inicio')}
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Seleccionar hora</option>
                    <option value="mañana">Tramboory Express (Matutino)</option>
                    <option value="tarde">Tramboory </option>
                  </select>
                </div>
                {errors.hora_inicio && <p className="mt-1 text-sm text-red-600">{errors.hora_inicio.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opción de Alimento</label>
                <div className="relative">
                  <FiDollarSign className="absolute top-3 left-3 text-gray-400" />
                  <select 
                    {...register('id_opcion_alimento')}
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Sin opción de alimento</option>
                    {foodOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nombre} - ${option.precio_extra}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.id_opcion_alimento && <p className="mt-1 text-sm text-red-600">{errors.id_opcion_alimento.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Festejado</label>
                <div className="relative">
                  <FiUser className="absolute top-3 left-3 text-gray-400" />
                  <input
                    {...register('nombre_festejado')}
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    placeholder="Nombre del festejado"
                  />
                </div>
                {errors.nombre_festejado && <p className="mt-1 text-sm text-red-600">{errors.nombre_festejado.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad del Festejado</label>
                <input
                  {...register('edad_festejado')}
                  type="number"
                  className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholder="Edad del festejado"
                />
                {errors.edad_festejado && <p className="mt-1 text-sm text-red-600">{errors.edad_festejado.message}</p>}
              </div>

              <div>
                <label className="block font-bold mb-2">Temática</label>
                <input 
                  {...register('tematica')}
                  type="text"
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Temática del evento"
                />
                {errors.tematica && <span className="text-red-500 text-sm">{errors.tematica.message}</span>}
              </div>

              <div>
                <label className="block font-bold mb-2">¿Incluye Cupcake?</label>
                <input 
                  {...register('cupcake')}
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">¿Incluye Mampara?</label>
                <input
                  {...register('mampara')}
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600" 
                />
              </div>

              <div>  
                <label className="block font-bold mb-2">¿Incluye Piñata?</label>
                <input
                  {...register('piñata')} 
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
              </div>
                
              <div>
                <label className="block font-bold mb-2">Comentarios Adicionales</label>
                <textarea
                  {...register('comentarios')}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ingresa comentarios adicionales sobre la reserva"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Crear Reserva
              </button>
            </form>
          </div>

          {/* Resumen de la Reserva */}
          <div ref={summaryRef} className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Resumen de tu Reserva</h2>
            <div className="space-y-4">
              <SummaryItem icon={<FiPackage />} label="Paquete" value={packages.find(p => p.id === watch('id_paquete'))?.nombre || 'No seleccionado'} />
              <SummaryItem icon={<FiCalendar />} label="Fecha" value={selectedDate ? selectedDate.toLocaleDateString() : 'No seleccionada'} />
              <SummaryItem icon={<FiClock />} label="Hora" value={watch('hora_inicio') || 'No seleccionada'} />
              <SummaryItem icon={<FiDollarSign />} label="Opción de Alimento" value={foodOptions.find(f => f.id === watch('id_opcion_alimento'))?.nombre || 'No seleccionada'} />
              <SummaryItem icon={<FiUser />} label="Festejado" value={watch('nombre_festejado') || 'No especificado'} />
              <SummaryItem icon={<FiUser />} label="Edad" value={watch('edad_festejado') || 'No especificada'} />
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {isConfirmationModalOpen && (
        <ConfirmationModal
          reservationData={reservationData}
          onCancel={() => setIsConfirmationModalOpen(false)}
          onConfirm={() => {
            setIsConfirmationModalOpen(false);
            setIsPaymentModalOpen(true);
          }}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          reservationData={reservationData}
          setReservationData={setReservationData}
          onCancel={() => setIsPaymentModalOpen(false)}
          onConfirm={() => {
            setIsPaymentModalOpen(false);
            saveReservation();
          }}
        />
      )}

      {isReservationModalOpen && (
        <ReservationModal
          reservationData={reservationData}
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}
    </div>
  );
}

const SummaryItem = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <div className="text-indigo-500">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ConfirmationModal = ({ reservationData, onCancel, onConfirm }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Confirmar Reserva</h2>
        <p className="mb-4 text-gray-600">Por favor, verifica los datos de tu reserva:</p>

        <div className="mb-6 space-y-2">
          <SummaryItem icon={<FiPackage />} label="Paquete" value={reservationData.id_paquete} />
          <SummaryItem icon={<FiCalendar />} label="Fecha" value={new Date(reservationData.fecha_reserva).toLocaleDateString()} />
          <SummaryItem icon={<FiClock />} label="Hora" value={reservationData.hora_inicio} />
          <SummaryItem icon={<FiDollarSign />} label="Opción de Alimento" value={reservationData.id_opcion_alimento || 'Ninguna'} />
          <SummaryItem icon={<FiUser />} label="Festejado" value={reservationData.nombre_festejado} />
          <SummaryItem icon={<FiUser />} label="Edad" value={reservationData.edad_festejado} />
          <SummaryItem icon={<FiDollarSign />} label="Total" value={`$${reservationData.total}`} />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300 transition duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ reservationData, setReservationData, onCancel, onConfirm }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Seleccionar Método de Pago</h2>

        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Método de Pago</label>
          <select
            value={reservationData.metodo_pago || ''}
            onChange={(e) => setReservationData({...reservationData, metodo_pago: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Seleccionar método de pago</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Pago en Efectivo</option>
          </select>
        </div>

        <div className="mb-6">
          {reservationData.metodo_pago === 'transferencia' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-bold">Instrucciones para Transferencia:</p>
              <p>Banco: Mi Banco</p>
              <p>Número de Cuenta: 1234567890</p>
              <p>Titular: Empresa de Eventos</p>
            </div>
          )}
          {reservationData.metodo_pago === 'efectivo' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <p className="font-bold">Pago en Efectivo:</p>
              <p>Dirección: Calle Principal 123, Ciudad</p>
              <p>Horario: Lunes a Viernes, 9:00 AM - 5:00 PM</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300 transition duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
            disabled={!reservationData.metodo_pago}
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

const ReservationModal = ({ reservationData, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.75)" }
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <FiCheck className="mx-auto text-green-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-indigo-700">¡Reserva Exitosa!</h2>
          <p className="text-gray-600 mt-2">Gracias por tu reserva. Aquí están los detalles:</p>
        </div>

        <div className="mb-6 space-y-2">
          <SummaryItem icon={<FiPackage />} label="Paquete" value={reservationData.id_paquete} />
          <SummaryItem icon={<FiCalendar />} label="Fecha" value={new Date(reservationData.fecha_reserva).toLocaleDateString()} />
          <SummaryItem icon={<FiClock />} label="Hora" value={reservationData.hora_inicio} />
          <SummaryItem icon={<FiDollarSign />} label="Opción de Alimento" value={reservationData.id_opcion_alimento || 'Ninguna'} />
          <SummaryItem icon={<FiUser />} label="Festejado" value={reservationData.nombre_festejado} />
          <SummaryItem icon={<FiUser />} label="Edad" value={reservationData.edad_festejado} />
          <SummaryItem icon={<FiDollarSign />} label="Total" value={`$${reservationData.total}`} />
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
