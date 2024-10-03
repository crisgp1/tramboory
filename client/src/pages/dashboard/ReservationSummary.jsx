import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

const ReservationSummary = ({ reservations, filterDataByMonth }) => (
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
        <p className="text-4xl font-bold text-green-600">
            {filterDataByMonth(reservations, 'fecha_reserva').length}
        </p>
    </motion.div>
);

export default ReservationSummary;