import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPieChart, FiBarChart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Función para formatear moneda de manera compacta en dispositivos móviles
const formatCompactCurrency = (value) => {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'k';
    }
    return '$' + value.toFixed(2);
};

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
            const categoryName = f.categoria ? f.categoria.nombre : 'Sin categoría';
            if (!cats[categoryName]) {
                cats[categoryName] = { ingreso: 0, gasto: 0 };
            }
            cats[categoryName][f.tipo] += f.monto;
        });
        return cats;
    }, [filteredFinances]);

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
        maintainAspectRatio: false, // Permite que el gráfico se ajuste al contenedor
        plugins: {
            legend: {
                position: window.innerWidth < 768 ? 'bottom' : 'top', // Leyenda abajo en móviles
                labels: {
                    boxWidth: window.innerWidth < 768 ? 12 : 40, // Cajas más pequeñas en móviles
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12 // Fuente más pequeña en móviles
                    }
                }
            },
            title: {
                display: false, // Ocultar el título del gráfico ya que lo mostramos fuera
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
                    autoSkip: true, // Permitir saltar etiquetas si no hay espacio
                    maxRotation: window.innerWidth < 768 ? 45 : 90, // Menor rotación en móviles
                    minRotation: 0,
                    font: {
                        size: window.innerWidth < 768 ? 8 : 11 // Fuente más pequeña en móviles
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        // Formato abreviado para móviles
                        if (window.innerWidth < 768) {
                            if (value >= 1000) {
                                return '$' + (value / 1000).toFixed(1) + 'k';
                            }
                            return '$' + value;
                        }
                        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
                    },
                    font: {
                        size: window.innerWidth < 768 ? 8 : 11 // Fuente más pequeña en móviles
                    }
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
            className="h-full"
        >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Finanzas</h2>
                    <div className="p-2 rounded-full bg-white/20 text-white">
                        <button
                            onClick={() => setChartType(chartType === 'bar' ? 'pie' : 'bar')}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-300"
                            title={`Cambiar a gráfico de ${chartType === 'bar' ? 'pastel' : 'barras'}`}
                        >
                            {chartType === 'bar' ? <FiPieChart className="w-5 h-5" /> : <FiBarChart className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Contenido */}
            <div className="p-4 md:p-6 bg-white">
                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-2 md:mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">
                                {window.innerWidth < 768
                                    ? formatCompactCurrency(filteredFinances.reduce((sum, f) => f.tipo === 'ingreso' ? sum + f.monto : sum, 0))
                                    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                                        filteredFinances.reduce((sum, f) => f.tipo === 'ingreso' ? sum + f.monto : sum, 0)
                                    )
                                }
                            </p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Ingresos</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 text-center">
                        <div className="mx-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-2 md:mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                <polyline points="16 17 22 17 22 11"></polyline>
                            </svg>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-base md:text-xl font-bold text-gray-800">
                                {window.innerWidth < 768
                                    ? formatCompactCurrency(filteredFinances.reduce((sum, f) => f.tipo === 'gasto' ? sum + f.monto : sum, 0))
                                    : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                                        filteredFinances.reduce((sum, f) => f.tipo === 'gasto' ? sum + f.monto : sum, 0)
                                    )
                                }
                            </p>
                            <p className="text-xs md:text-sm font-medium text-gray-600 text-center">Gastos</p>
                        </div>
                    </div>
                </div>

                {/* Selector de categorías */}
                <div className="mb-4 md:mb-6">
                    <button
                        onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        className="flex items-center justify-between w-full p-2 md:p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex items-center">
                            <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-2 md:mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M3 12h18"></path>
                                    <path d="M3 18h18"></path>
                                </svg>
                            </div>
                            <span className="text-sm md:text-base font-medium text-gray-700">Seleccionar Categorías</span>
                        </div>
                        <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            {showCategoryMenu ? <FiChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <FiChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                        </div>
                    </button>
                    
                    {showCategoryMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="mt-2 md:mt-3 p-3 md:p-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-1 md:gap-2">
                                {Object.keys(categoryData).map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={`px-2 py-1 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                                            selectedCategories.includes(category)
                                                ? 'bg-purple-100 text-purple-700 shadow-sm'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
                
                {/* Gráfico */}
                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-4 text-center">Resumen por Categorías</h3>
                    <div className="h-[250px] md:h-[300px] lg:h-[350px]">
                        {renderChart()}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FinancialSummary;