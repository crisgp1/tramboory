import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

const ReservationSummary = ({ reservations, filterDataByMonth }) => {
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    const reservationsCount = filterDataByMonth(reservations, 'fecha_reserva').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Reservas</h2>
                <FiCalendar className="text-3xl text-green-500" />
            </div>
            <p className="text-lg text-gray-600 mb-2">
                Mes actual: <span className="font-semibold">{capitalizedMonth}</span>
            </p>
            <p className="text-4xl font-bold text-green-600">
                {reservationsCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">
                {reservationsCount === 1 ? 'reserva' : 'reservas'} este mes
            </p>
        </motion.div>
    );
};

export default ReservationSummary;