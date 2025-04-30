import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const ReservationSummary = ({ reservations, filterDataByMonth }) => {
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const filteredReservations = filterDataByMonth(reservations, 'fecha_reserva');
    const reservationsCount = filteredReservations.length;
    
    // Calcular estadísticas adicionales
    const confirmedReservations = filteredReservations.filter(r => r.estado === 'confirmada').length;
    const pendingReservations = filteredReservations.filter(r => r.estado === 'pendiente').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
        >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Reservas</h2>
                    <div className="p-2 rounded-full bg-white/20 text-white">
                        <FiCalendar className="w-5 h-5" />
                    </div>
                </div>
            </div>
            
            {/* Contenido */}
            <div className="p-6">
                <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {capitalizedMonth}
                    </span>
                </div>
                
                <p className="text-4xl font-bold text-green-600 mb-1">
                    {reservationsCount}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    {reservationsCount === 1 ? 'reserva' : 'reservas'} este mes
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                            <FiCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{confirmedReservations}</p>
                            <p className="text-xs text-gray-500">Confirmadas</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                            <FiClock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{pendingReservations}</p>
                            <p className="text-xs text-gray-500">Pendientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReservationSummary;