import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPieChart, FiBarChart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const FinancialSummary = ({ finances, filterDataByMonth, categories }) => {
    const [chartType, setChartType] = useState('bar');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    const filteredFinances = useMemo(() => filterDataByMonth(finances, 'fecha'), [finances, filterDataByMonth]);

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat.nombre;
            return acc;
        }, {});
    }, [categories]);

    const categoryData = useMemo(() => {
        const cats = {};
        filteredFinances.forEach(f => {
            const categoryName = categoryMap[f.categoria] || 'Sin categoría';
            if (!cats[categoryName]) {
                cats[categoryName] = { ingreso: 0, gasto: 0 };
            }
            cats[categoryName][f.tipo] += f.monto;
        });
        return cats;
    }, [filteredFinances, categoryMap]);

    useEffect(() => {
        setSelectedCategories(Object.keys(categoryData));
    }, [categoryData]);

    const chartData = useMemo(() => {
        const labels = Object.keys(categoryData).filter(cat => selectedCategories.includes(cat));
        const incomeData = labels.map(cat => categoryData[cat].ingreso);
        const expenseData = labels.map(cat => categoryData[cat].gasto);

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
    }, [categoryData, selectedCategories, chartType]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Resumen por Categorías',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
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
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 0
                }
            },
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

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
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
                        onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                        className={`p-2 rounded ${chartType === 'bar' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}
                        title={`Cambiar a gráfico de ${chartType === 'bar' ? 'pastel' : 'barras'}`}
                    >
                        {chartType === 'bar' ? <FiPieChart /> : <FiBarChart />}
                    </button>
                </div>
            </div>
            <div className="mb-4">
                <button
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="flex items-center justify-between w-full p-2 bg-blue-500 text-white rounded"
                >
                    <span>Seleccionar Categorías</span>
                    {showCategoryMenu ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {showCategoryMenu && (
                    <div className="mt-2 p-2 border rounded">
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(categoryData).map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-3 py-1 rounded ${
                                        selectedCategories.includes(category)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {renderChart()}
        </motion.div>
    );
};

export default FinancialSummary;