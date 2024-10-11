import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPieChart, FiBarChart } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const FinancialSummary = ({ finances, filterDataByMonth }) => {
    const [viewMode, setViewMode] = useState('general'); // 'general' o 'categories'
    const [chartType, setChartType] = useState('bar'); // 'bar' o 'pie'

    const filteredFinances = useMemo(() => filterDataByMonth(finances, 'fecha'), [finances, filterDataByMonth]);

    const chartData = useMemo(() => {
        if (viewMode === 'general') {
            const totalIncome = filteredFinances.reduce((sum, f) => sum + (f.tipo === 'ingreso' ? f.monto : 0), 0);
            const totalExpense = filteredFinances.reduce((sum, f) => sum + (f.tipo === 'gasto' ? f.monto : 0), 0);

            return {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: 'Finanzas',
                    data: [totalIncome, totalExpense],
                    backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                }],
            };
        } else {
            const categories = {};
            filteredFinances.forEach(f => {
                if (!categories[f.categoria]) {
                    categories[f.categoria] = { ingreso: 0, gasto: 0 };
                }
                categories[f.categoria][f.tipo] += f.monto;
            });

            const labels = Object.keys(categories);
            const incomeData = labels.map(cat => categories[cat].ingreso);
            const expenseData = labels.map(cat => categories[cat].gasto);

            if (chartType === 'pie') {
                return {
                    labels: [...labels.map(l => `${l} (Ingresos)`), ...labels.map(l => `${l} (Gastos)`)],
                    datasets: [
                        {
                            data: [...incomeData, ...expenseData],
                            backgroundColor: [
                                ...labels.map(() => `rgba(54, 162, 235, ${Math.random() * 0.5 + 0.3})`),
                                ...labels.map(() => `rgba(255, 99, 132, ${Math.random() * 0.5 + 0.3})`)
                            ],
                        }
                    ],
                };
            }

            return {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: incomeData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    },
                    {
                        label: 'Gastos',
                        data: expenseData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    }
                ],
            };
        }
    }, [filteredFinances, viewMode, chartType]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: viewMode === 'general' ? 'Resumen Financiero' : 'Resumen por Categorías',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed.y || context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        scales: chartType === 'bar' ? {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
                    },
                },
            },
        } : undefined,
    };

    const renderChart = () => {
        const ChartComponent = chartType === 'bar' ? Bar : Pie;
        return <ChartComponent data={chartData} options={chartOptions} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Finanzas</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setViewMode('general')}
                        className={`p-2 rounded ${viewMode === 'general' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                        title="Vista General"
                    >
                        <FiDollarSign />
                    </button>
                    <button
                        onClick={() => setViewMode('categories')}
                        className={`p-2 rounded ${viewMode === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                        title="Vista por Categorías"
                    >
                        <FiPieChart />
                    </button>
                    <button
                        onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                        className={`p-2 rounded ${chartType === 'bar' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}
                        title={`Cambiar a gráfico de ${chartType === 'bar' ? 'pastel' : 'barras'}`}
                    >
                        {chartType === 'bar' ? <FiPieChart /> : <FiBarChart />}
                    </button>
                </div>
            </div>
            {renderChart()}
        </motion.div>
    );
};

export default FinancialSummary;