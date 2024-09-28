import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';

import { filterDataByMonth } from '../services/dashboardService';

const StatCards = ({ data, selectedMonth }) => {
    const { users, reservations, finances } = data;

    const chartData = {
        labels: ['Ingresos', 'Gastos'],
        datasets: [
            {
                label: 'Finanzas',
                data: [
                    filterDataByMonth(finances, 'fecha', selectedMonth).reduce((sum, f) => sum + (f.tipo === 'ingreso' ? f.monto : 0), 0),
                    -filterDataByMonth(finances, 'fecha', selectedMonth).reduce((sum, f) => sum + (f.tipo === 'gasto' ? f.monto : 0), 0),
                ],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Resumen Financiero' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${Math.abs(value)}`,
                },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Usuarios</h2>
                    <FiUsers className="text-3xl text-indigo-500" />
                </div>
                <p className="text-4xl font-bold text-indigo-600">{users.length}</p>
            </motion.div>

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
                    {filterDataByMonth(reservations, 'fecha_reserva', selectedMonth).length}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Finanzas</h2>
                    <FiDollarSign className="text-3xl text-yellow-500" />
                </div>
                <Bar data={chartData} options={chartOptions} />
            </motion.div>
        </div>
    );
};

export default StatCards;