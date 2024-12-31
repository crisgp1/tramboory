import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiCreditCard, 
  FiMapPin, 
  FiCheckCircle, 
  FiSearch 
} from 'react-icons/fi';

// Componente para mostrar un campo de información
const InfoField = ({ icon: Icon, label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-500 mb-1">
      <div className="flex items-center">
        <Icon className="mr-2 text-gray-400" />
        {label}
      </div>
    </label>
    <div className="mt-1 p-2 bg-gray-50 rounded-md">
      <span className="text-gray-900">{value}</span>
    </div>
  </div>
);

// Componente principal del formulario de pago
export const PaymentForm = ({
  payment,
  onUpdateStatus,
  reservations = [],
  onSave
}) => {
  const isEditing = !!payment;

  const [formData, setFormData] = useState({
    id_reserva: payment ? payment.id_reserva : '',
    monto: payment ? payment.monto : '',
    fecha_pago: payment ? payment.fecha_pago : new Date().toISOString().split('T')[0],
    metodo_pago: payment ? payment.metodo_pago : '',
    estado: payment ? payment.estado : 'pendiente',
  });

  // Estado para manejar la búsqueda y las reservas filtradas
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReservations, setFilteredReservations] = useState(reservations);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Cuando cambie el término de búsqueda, filtramos las reservas
    if (!searchTerm.trim()) {
      setFilteredReservations(reservations);
    } else {
      // Filtra por nombre del festejado o nombre del usuario
      const filtered = reservations.filter((res) => {
        const nombreFestejado = res.nombre_festejado?.toLowerCase() || '';
        const nombreUsuario = res.usuario?.nombre?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return (
          nombreFestejado.includes(term) ||
          nombreUsuario.includes(term) ||
          res.id.toString() === term
        );
      });
      setFilteredReservations(filtered);
    }
  }, [searchTerm, reservations]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'fallido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationInfo = (id) => {
    const reservation = reservations.find(r => r.id === id);
    return reservation 
      ? `#${reservation.id} - ${reservation.nombre_festejado || reservation.usuario?.nombre || 'Sin nombre'}`
      : 'No encontrada';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejador para seleccionar una reserva del "autocompletado"
  const handleSelectReservation = (res) => {
    setFormData({ ...formData, id_reserva: res.id });
    // Mostramos en el campo de búsqueda el nombre elegido para mayor claridad
    setSearchTerm(res.nombre_festejado || res.usuario?.nombre || `Reserva #${res.id}`);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  if (!isEditing) {
    // Formulario para crear un nuevo pago
    return (
      <form onSubmit={handleSubmit} id="paymentsForm">
        <div className="space-y-6 p-6 bg-white rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo de Reserva (Ahora con buscador) */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiMapPin className="mr-2 text-gray-400" />
                  Buscar Reserva
                </div>
              </label>

              <div className="flex items-center bg-gray-50 rounded-md p-2">
                <FiSearch className="mr-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, festejado o ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="bg-transparent w-full focus:outline-none"
                />
              </div>

              {/* Lista desplegable de sugerencias */}
              {showSuggestions && filteredReservations.length > 0 && (
                <ul className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md w-full max-h-60 overflow-auto shadow-lg">
                  {filteredReservations.map((res) => {
                    const displayName =
                      res.nombre_festejado ||
                      res.usuario?.nombre ||
                      `Reserva #${res.id}`;
                    return (
                      <li
                        key={res.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectReservation(res)}
                      >
                        #{res.id} - {displayName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Campo de Monto */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiDollarSign className="mr-2 text-gray-400" />
                  Monto
                </div>
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                className="mt-1 p-2 bg-gray-50 rounded-md w-full"
                required
              />
            </div>

            {/* Campo de Fecha de Pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  Fecha de Pago
                </div>
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                className="mt-1 p-2 bg-gray-50 rounded-md w-full"
                required
              />
            </div>

            {/* Campo de Método de Pago */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiCreditCard className="mr-2 text-gray-400" />
                  Método de Pago
                </div>
              </label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                className="mt-1 p-2 bg-gray-50 rounded-md w-full"
                required
              >
                <option value="">Seleccionar método de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta_debito" disabled>Tarjeta de débito</option>
                <option value="tarjeta_credito" disabled>Tarjeta de crédito</option>
              </select>
            </div>
          </div>

          {/* Sección de Estado del Pago */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiCheckCircle className="mr-2" />
              Estado del Pago
            </h3>
            <div className="flex flex-wrap gap-3">
              {['pendiente', 'completado', 'fallido'].map((status) => (
                <motion.button
                  key={status}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, estado: status })}
                  className={`px-4 py-2 rounded-full capitalize font-medium ${
                    formData.estado === status 
                      ? `${getStatusColor(status)} ring-2 ring-offset-2 ring-indigo-500` 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Si estamos editando o viendo un pago existente
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg">
      {/* Sección de Información del Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoField
          icon={FiMapPin}
          label="Reserva"
          value={getReservationInfo(payment.id_reserva)}
        />
        <InfoField
          icon={FiDollarSign}
          label="Monto"
          value={`$${parseFloat(payment.monto).toFixed(2)}`}
        />
        <InfoField
          icon={FiCalendar}
          label="Fecha de Pago"
          value={new Date(payment.fecha_pago).toLocaleDateString()}
        />
        <InfoField
          icon={FiCreditCard}
          label="Método de Pago"
          value={payment.metodo_pago}
        />
      </div>

      {/* Sección de Estado del Pago */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FiCheckCircle className="mr-2" />
          Estado del Pago
        </h3>

        <div className="flex flex-wrap gap-3">
          {['pendiente', 'completado', 'fallido'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdateStatus(payment.id, status)}
              className={`px-4 py-2 rounded-full capitalize font-medium ${
                payment.estado === status 
                  ? `${getStatusColor(status)} ring-2 ring-offset-2 ring-indigo-500` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mensaje de Ayuda */}
      <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
        <p>
          Solo se puede modificar el estado del pago. Para realizar otros cambios, 
          contacta con el administrador del sistema.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;
