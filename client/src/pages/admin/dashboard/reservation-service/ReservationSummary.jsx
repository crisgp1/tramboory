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
            <div className="p-4 md:p-6">
                <div className="flex flex-col items-center text-center mb-4 md:mb-6">
                    <span className="text-xs md:text-sm font-medium text-gray-600 bg-gray-100 px-3 md:px-4 py-1 rounded-full mb-2 md:mb-3">
                        {capitalizedMonth}
                    </span>
                    <p className="text-3xl md:text-4xl font-bold text-green-600">
                        {reservationsCount}
                    </p>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">
                        {reservationsCount === 1 ? 'reserva' : 'reservas'} este mes
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-2 md:mb-3">
                            <FiCheck className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">{confirmedReservations}</p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Confirmadas</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2 md:mb-3">
                            <FiClock className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">{pendingReservations}</p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Pendientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReservationSummary;