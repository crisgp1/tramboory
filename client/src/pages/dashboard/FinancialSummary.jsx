import {motion} from 'framer-motion';
import {FiDollarSign} from 'react-icons/fi';
import {Bar} from 'react-chartjs-2';
import {CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {Chart as ChartJS} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FinancialSummary = ({finances, filterDataByMonth}) => {
    const chartData = {
        labels: ['Ingresos', 'Gastos'], datasets: [{
            label: 'Finanzas',
            data: [filterDataByMonth(finances, 'fecha').reduce((sum, f) => sum + (f.tipo === 'ingreso' ? f.monto : 0), 0), -filterDataByMonth(finances, 'fecha').reduce((sum, f) => sum + (f.tipo === 'gasto' ? f.monto : 0), 0),],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        },],
    };

    const chartOptions = {
        responsive: true, plugins: {
            legend: {
                position: 'top',
            }, title: {
                display: true, text: 'Resumen Financiero',
            },
        }, scales: {
            y: {
                beginAtZero: true, ticks: {
                    callback: function (value, index, values) {
                        return '$' + Math.abs(value);
                    },
                },
            },
        },
    };

    return (<motion.div
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.2}}
            className="bg-white rounded-lg shadow-lg p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Finanzas</h2>
                <FiDollarSign className="text-3xl text-yellow-500"/>
            </div>
            <Bar data={chartData} options={chartOptions}/>
        </motion.div>);
};

export default FinancialSummary;