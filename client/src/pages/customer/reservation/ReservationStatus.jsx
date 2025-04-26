// ReservationStatus.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/components/axiosConfig';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {jwtDecode} from 'jwt-decode'; // Corrected import

import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiImage,
  FiInfo,
  FiPlus,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCreditCard,
  FiMessageCircle,
  FiStar,
  FiActivity,
  FiRefreshCw,
  FiList,
  FiMaximize,
  FiZoomIn,
} from 'react-icons/fi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return format(date, 'PPP', { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

// Componente para mostrar imágenes a pantalla completa
const ImageLightbox = ({ isOpen, onClose, imageUrl, alt }) => {
  if (!isOpen) return null;

  // Handler para detectar clics en el fondo
  const handleBackdropClick = (e) => {
    // Cerrar el lightbox al hacer clic en cualquier parte
    onClose();
  };

  // Handler para evitar que los clics en la imagen cierren el lightbox
  const handleImageClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague al fondo
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300"
      onClick={handleBackdropClick} // Cerrar al hacer clic en cualquier parte
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Barra superior con botón de cierre */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Contenedor de la imagen */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img 
            src={imageUrl}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={handleImageClick}
          />
        </div>
      </div>
    </div>
  );
};

// Components
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pendiente: {
      icon: FiClock,
      class: 'bg-yellow-100 text-yellow-800',
      text: 'Pendiente',
    },
    confirmada: {
      icon: FiCheck,
      class: 'bg-green-100 text-green-800',
      text: 'Confirmada',
    },
    cancelada: {
      icon: FiX,
      class: 'bg-red-100 text-red-800',
      text: 'Cancelada',
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {config.text}
    </span>
  );
};

const ReservationCard = ({ reservation, isActive, onClick }) => {
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-full ${
              isActive ? 'bg-indigo-100' : 'bg-gray-100'
            }`}
          >
            <FiUser
              className={`w-5 h-5 ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`}
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {reservation.nombre_festejado}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <FiCalendar className="w-4 h-4 mr-1" />
              {formatDate(reservation.fecha_reserva)}
            </div>
          </div>
        </div>
        <StatusBadge status={reservation.estado} />
      </div>
    </motion.div>
  );
};

// Componente estándar para detalles sin imágenes
const DetailSection = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start space-x-3 ${className}`}>
    <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

// Componente para detalles con imágenes (temáticas, mamparas)
const DetailSectionWithImage = ({ icon: Icon, label, value, imageUrl, alt, onImageClick, imageError = false, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-lg font-medium text-gray-900">{value}</p>
      </div>
    </div>
    
    {imageUrl && !imageError ? (
      <div className="mt-3 ml-10 relative">
        <div className="relative overflow-hidden rounded-lg group">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full max-w-xs rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-cover"
            style={{ maxHeight: '160px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={onImageClick}
          >
            <div className="p-2 bg-white bg-opacity-80 rounded-full">
              <FiZoomIn size={20} className="text-indigo-600" />
            </div>
          </div>
        </div>
        <button
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-indigo-50 transition-colors"
          onClick={onImageClick}
          aria-label="Ver imagen ampliada"
        >
          <FiMaximize size={16} className="text-indigo-600" />
        </button>
      </div>
    ) : null}
  </div>
);

const TimelineEvent = ({ title, description, icon: Icon, isCompleted }) => (
  <div className="flex items-start space-x-4">
    <div
      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
        isCompleted ? 'bg-green-100' : 'bg-gray-100'
      }`}
    >
      <Icon
        className={`w-4 h-4 ${
          isCompleted ? 'text-green-600' : 'text-gray-400'
        }`}
      />
    </div>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
    <motion.div
      className="relative w-20 h-20"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <FiRefreshCw className="w-8 h-8 text-indigo-600" />
      </motion.div>
    </motion.div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"
    >
      <div className="mb-6">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{ duration: 0.5 }}
        >
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        </motion.div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ¡Ups! Algo salió mal
      </h2>
      <p className="text-gray-600 mb-8">{message}</p>
      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          <FiRefreshCw className="w-5 h-5 mr-2" />
          Intentar de nuevo
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </motion.div>
  </div>
);

const EmptyState = ({ onCreateNew }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <FiCalendar className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ¡Comienza tu aventura!
      </h2>
      <p className="text-gray-600 mb-8">
        Aún no tienes reservas. ¿Qué tal si creas tu primera experiencia mágica?
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateNew}
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
      >
        <FiPlus className="w-5 h-5 mr-2" />
        Crear Nueva Reserva
      </motion.button>
    </motion.div>
  </div>
);

const ReservationStatus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [userId, setUserId] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  
  // Estados para los lightboxes
  const [tematicaLightboxOpen, setTematicaLightboxOpen] = useState(false);
  const [mamparaLightboxOpen, setMamparaLightboxOpen] = useState(false);
  const [tematicaImageError, setTematicaImageError] = useState(false);
  const [mamparaImageError, setMamparaImageError] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // Resetear los errores de imagen cuando cambia la reserva activa
  useEffect(() => {
    if (activeReservation) {
      setTematicaImageError(false);
      setMamparaImageError(false);
    }
  }, [activeReservation]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);
      setUserId(decodedToken.id);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      navigate('/signin');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        const response = await axiosInstance.get(`/api/reservas/${id}`);
        setReservationData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos de la reserva:', error);
        // Redirigir a una página de error o a la página de reservas
        navigate('/reservations');
      }
    };

    fetchReservationData();
  }, [id, navigate]);

  useEffect(() => {
    if (userId) {
      fetchUserReservations();
    }
  }, [userId]);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/reservas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data) {
        // Filter reservations by userId
        const userReservationsData = response.data.filter(
          (reserva) => reserva.id_usuario === userId
        );

        const sortedReservations = userReservationsData.sort(
          (a, b) => new Date(b.fecha_reserva) - new Date(a.fecha_reserva)
        );

        setUserReservations(sortedReservations);

        // Select the active reservation
        if (id) {
          const selectedReservation = sortedReservations.find(
            (r) => r.id === parseInt(id)
          );
          setActiveReservation(selectedReservation || sortedReservations[0]);
        } else {
          setActiveReservation(sortedReservations[0]);
        }
      }
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      if (error.response?.status === 401) {
        navigate('/signin');
      } else {
        setError(
          'No se pudieron cargar tus reservas. Por favor, intenta más tarde.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      if (!activeReservation?.id || activeReservation.id_usuario !== userId) {
        toast.error('No tienes permiso para cancelar esta reserva');
        return;
      }

      await axiosInstance.put(
        `/api/reservas/${activeReservation.id}`,
        {
          estado: 'cancelada',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      await fetchUserReservations();
      setShowConfirmCancel(false);
      toast.success('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      toast.error('No se pudo cancelar la reserva. Por favor, intenta más tarde.');
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  };

  // Render conditional based on state
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchUserReservations} />;
  if (!userReservations || userReservations.length === 0) {
    return <EmptyState onCreateNew={() => navigate('/reservations')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y visualiza todas tus reservas en un solo lugar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar with reservations */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="flex items-center">
                    <FiList className="w-5 h-5 mr-2" />
                    Reservas Activas
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/reservations')}
                    className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </motion.button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence>
                  <div className="space-y-4">
                    {userReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        isActive={activeReservation?.id === reservation.id}
                        onClick={() => setActiveReservation(reservation)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Reservation details */}
          <div className="lg:col-span-8">
            {activeReservation && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReservation.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <FiStar className="w-6 h-6 mr-2 text-indigo-500" />
                          Detalles de la Reserva
                        </CardTitle>
                        <StatusBadge status={activeReservation.estado} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Main info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <DetailSection
                          icon={FiPackage}
                          label="Paquete"
                          value={
                            activeReservation.paquete?.nombre || 'No especificado'
                          }
                        />
                        <DetailSection
                          icon={FiCalendar}
                          label="Fecha"
                          value={formatDate(activeReservation.fecha_reserva)}
                        />
                        <DetailSection
                          icon={FiClock}
                          label="Horario"
                          value={
                            activeReservation.hora_inicio === 'mañana'
                              ? 'Matutino'
                              : 'Vespertino'
                          }
                        />
                        <DetailSection
                          icon={FiUser}
                          label="Festejado"
                          value={`${activeReservation.nombre_festejado} (${activeReservation.edad_festejado} años)`}
                        />
                        
                        {/* Temática con imagen */}
                        <DetailSectionWithImage
                          icon={FiImage}
                          label="Temática"
                          value={activeReservation.tematicaReserva?.nombre || 'No especificada'}
                          imageUrl={activeReservation.tematicaReserva?.foto}
                          alt={`Temática ${activeReservation.tematicaReserva?.nombre}`}
                          onImageClick={() => setTematicaLightboxOpen(true)}
                          imageError={tematicaImageError}
                        />
                        
                        {/* Mampara con imagen */}
                        {activeReservation.mampara && (
                          <DetailSectionWithImage
                            icon={FiImage}
                            label="Mampara"
                            value={`${activeReservation.mampara.piezas} piezas`}
                            imageUrl={activeReservation.mampara?.foto}
                            alt={`Mampara de ${activeReservation.mampara.piezas} piezas`}
                            onImageClick={() => setMamparaLightboxOpen(true)}
                            imageError={mamparaImageError}
                          />
                        )}
                        <DetailSection
                          icon={FiDollarSign}
                          label="Total"
                          value={formatCurrency(activeReservation.total)}
                        />
                      </div>

                      {/* Timeline */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FiActivity className="w-5 h-5 mr-2 text-indigo-500" />
                          Progreso de la Reserva
                        </h3>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          <div className="space-y-6">
                            <TimelineEvent
                              title="Reserva Creada"
                              description="Tu reserva ha sido registrada en el sistema"
                              icon={FiCalendar}
                              isCompleted={true}
                            />
                            <TimelineEvent
                              title="Pago Confirmado"
                              description="El pago ha sido procesado exitosamente"
                              icon={FiCreditCard}
                              isCompleted={
                                activeReservation.estado === 'confirmada'
                              }
                            />
                            <TimelineEvent
                              title="Evento Completado"
                              description="¡Gracias por celebrar con nosotros!"
                              icon={FiCheck}
                              isCompleted={
                                activeReservation.estado === 'completada'
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Extras */}
                      {activeReservation.extras?.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiPlus className="w-5 h-5 mr-2 text-indigo-500" />
                            Extras Contratados
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {activeReservation.extras.map((extra) => (
                              <motion.div
                                key={extra.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="p-2 bg-indigo-100 rounded-lg">
                                    <FiStar className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {extra.nombre}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {formatCurrency(extra.precio)}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      {activeReservation.comentarios && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiMessageCircle className="w-5 h-5 mr-2 text-indigo-500" />
                            Comentarios
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700">
                              {activeReservation.comentarios}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-4">
                        {activeReservation.estado === 'pendiente' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowConfirmCancel(true)}
                            className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors flex items-center"
                          >
                            <FiX className="w-5 h-5 mr-2" />
                            Cancelar Reserva
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/reservations')}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                        >
                          <FiPlus className="w-5 h-5 mr-2" />
                          Nueva Reserva
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox para imagen de temática - fuera de la card */}
      <ImageLightbox 
        isOpen={tematicaLightboxOpen}
        onClose={() => setTematicaLightboxOpen(false)}
        imageUrl={activeReservation?.tematicaReserva?.foto || ''}
        alt={activeReservation?.tematicaReserva?.nombre || 'Imagen de temática'}
      />
      
      {/* Lightbox para imagen de mampara - fuera de la card */}
      <ImageLightbox 
        isOpen={mamparaLightboxOpen}
        onClose={() => setMamparaLightboxOpen(false)}
        imageUrl={activeReservation?.mampara?.foto || ''}
        alt={`Mampara de ${activeReservation?.mampara?.piezas || 0} piezas`}
      />

      {/* Cancel Confirmation Modal */}
      <Dialog open={showConfirmCancel} onClose={() => setShowConfirmCancel(false)}>
        <DialogContent className="sm:max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogTitle className="flex items-center text-red-600">
              <FiAlertCircle className="w-6 h-6 mr-2" />
              Confirmar Cancelación
            </DialogTitle>
            <div className="mt-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Importante: Esta acción no se puede deshacer
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>
                          La fecha quedará disponible para otros clientes
                        </li>
                        <li>
                          Deberás crear una nueva reserva si deseas reagendar
                        </li>
                        <li>
                          El reembolso puede tomar hasta 15 días hábiles
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                >
                  <FiX className="w-5 h-5 mr-2" />
                  Mantener Reserva
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelReservation}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FiCheck className="w-5 h-5 mr-2" />
                  Confirmar Cancelación
                </motion.button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationStatus;