import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiCheck, FiAlertTriangle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const ReservationSummary = ({ reservations, filterDataByMonth }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const filteredReservations = filterDataByMonth(reservations, 'fecha_reserva');
    const reservationsCount = filteredReservations.length;
    
    // Calcular estadísticas
    const confirmedReservations = filteredReservations.filter(r => r.estado === 'confirmada').length;
    const pendingReservations = filteredReservations.filter(r => r.estado === 'pendiente').length;
    const cancelledReservations = filteredReservations.filter(r => r.estado === 'cancelada').length;
    
    // Calcular porcentajes
    const confirmedPercentage = reservationsCount > 0 ? Math.round((confirmedReservations / reservationsCount) * 100) : 0;
    const pendingPercentage = reservationsCount > 0 ? Math.round((pendingReservations / reservationsCount) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
        >
            {/* Header */}
            <div className={`p-6 ${
                isDark 
                    ? "bg-gradient-to-r from-green-800 to-emerald-900" 
                    : "bg-gradient-to-r from-green-500 to-emerald-600"
            }`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Reservas</h2>
                    <div className="p-3 rounded-full bg-white/20 text-white shadow-lg">
                        <FiCalendar className="w-6 h-6" />
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 md:p-6" style={{ 
                backgroundColor: isDark ? 'var(--panel-bg)' : 'white',
                color: isDark ? 'var(--color-text-primary)' : 'inherit'
            }}>
                {/* Summary Stats */}
                <div className="flex flex-col items-center text-center mb-6">
                    <span className={`text-xs md:text-sm font-medium px-4 py-2 rounded-full mb-3 ${
                        isDark 
                            ? 'bg-gray-800 text-gray-100 border border-gray-700' 
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {capitalizedMonth}
                    </span>
                    <p className={`text-4xl md:text-5xl font-bold ${
                        isDark ? 'text-green-400' : 'text-green-600'
                    }`} style={{ 
                        background: isDark ? 'linear-gradient(135deg, #10b981, #06d6a0)' : 'linear-gradient(135deg, #059669, #10b981)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {reservationsCount}
                    </p>
                    <p className={`text-sm md:text-base font-medium mt-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        {reservationsCount === 1 ? 'reserva' : 'reservas'} este mes
                    </p>
                </div>
                
                {/* Quick Overview */}
                {reservationsCount > 0 && (
                    <div className={`p-4 rounded-lg mb-6 border ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Tasa de confirmación
                            </span>
                            <span className={`text-lg font-bold ${
                                isDark ? 'text-green-400' : 'text-green-600'
                            }`}>
                                {confirmedPercentage}%
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Detailed Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Confirmed Reservations */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-lg p-4 shadow-sm border text-center transition-all duration-300 ${
                            isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:shadow-md'
                        }`}
                    >
                        <div className={`mx-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 ${
                            isDark ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600'
                        }`}>
                            <FiCheck className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className={`text-xl md:text-2xl font-bold ${
                                isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                                {confirmedReservations}
                            </p>
                            <p className={`text-xs md:text-sm font-medium text-center ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Confirmadas
                            </p>
                            {reservationsCount > 0 && (
                                <p className={`text-xs mt-1 ${
                                    isDark ? 'text-green-400' : 'text-green-600'
                                }`}>
                                    {confirmedPercentage}%
                                </p>
                            )}
                        </div>
                    </motion.div>
                    
                    {/* Pending Reservations */}
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-lg p-4 shadow-sm border text-center transition-all duration-300 ${
                            isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:shadow-md'
                        }`}
                    >
                        <div className={`mx-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-3 ${
                            isDark ? 'bg-amber-900 text-amber-400' : 'bg-amber-100 text-amber-600'
                        }`}>
                            <FiClock className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className={`text-xl md:text-2xl font-bold ${
                                isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                                {pendingReservations}
                            </p>
                            <p className={`text-xs md:text-sm font-medium text-center ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Pendientes
                            </p>
                            {reservationsCount > 0 && (
                                <p className={`text-xs mt-1 ${
                                    isDark ? 'text-amber-400' : 'text-amber-600'
                                }`}>
                                    {pendingPercentage}%
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
                
                {/* Additional Stats */}
                {(cancelledReservations > 0 || reservationsCount === 0) && (
                    <div className="mt-6">
                        <div className={`rounded-lg p-4 border ${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}>
                            {cancelledReservations > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${
                                        isDark ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        Canceladas
                                    </span>
                                    <span className={`text-lg font-bold ${
                                        isDark ? 'text-red-400' : 'text-red-600'
                                    }`}>
                                        {cancelledReservations}
                                    </span>
                                </div>
                            )}
                            {reservationsCount === 0 && (
                                <div className="text-center">
                                    <FiCalendar className={`mx-auto w-8 h-8 mb-2 ${
                                        isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`} />
                                    <p className={`text-sm ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                        No hay reservas este mes
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ReservationSummary;