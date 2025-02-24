import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { FiTrendingUp, FiTrendingDown, FiPrinter, FiDownload, FiX } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MonthlyReportModal = ({ isOpen, onClose, finances, categories, selectedMonth, selectedYear }) => {
    const reportRef = useRef(null);

    if (!isOpen) return null;

    // Filtrar finanzas del mes actual
    const currentMonthFinances = finances.filter(finance => {
        const financeDate = new Date(finance.fecha);
        return financeDate.getMonth() === selectedMonth && 
               financeDate.getFullYear() === selectedYear;
    });

    // Calcular mes anterior
    const previousMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const previousYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    // Filtrar finanzas del mes anterior
    const previousMonthFinances = finances.filter(finance => {
        const financeDate = new Date(finance.fecha);
        return financeDate.getMonth() === previousMonth && 
               financeDate.getFullYear() === previousYear;
    });

    const categoryTotals = currentMonthFinances.reduce((acc, finance) => {
        const categoryName = finance.categoria?.nombre || 'Sin categoría';
        if (!acc[categoryName]) {
            acc[categoryName] = { ingreso: 0, gasto: 0 };
        }
        acc[categoryName][finance.tipo] += finance.monto;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(categoryTotals),
        datasets: [
            {
                label: 'Ingresos',
                data: Object.values(categoryTotals).map(cat => cat.ingreso),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Gastos',
                data: Object.values(categoryTotals).map(cat => cat.gasto),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatNumber(value);
                    },
                },
            },
        },
    };

    // Calcular totales del mes anterior
    const previousMonthIngresos = previousMonthFinances.reduce((sum, f) => f.tipo === 'ingreso' ? sum + f.monto : sum, 0);
    const previousMonthGastos = previousMonthFinances.reduce((sum, f) => f.tipo === 'gasto' ? sum + f.monto : sum, 0);
    const previousMonthBalance = previousMonthIngresos - previousMonthGastos;

    // Calcular totales del mes actual
    const totalIngresos = currentMonthFinances.reduce((sum, f) => f.tipo === 'ingreso' ? sum + f.monto : sum, 0);
    const totalGastos = currentMonthFinances.reduce((sum, f) => f.tipo === 'gasto' ? sum + f.monto : sum, 0);
    const balance = totalIngresos - totalGastos;

    // Calcular diferencia porcentual
    const balanceChange = previousMonthBalance !== 0 
        ? ((balance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100 
        : balance > 0 ? 100 : balance < 0 ? -100 : 0;

    const handlePrint = () => {
        const printContent = document.getElementById('monthly-report');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        winPrint.document.write(`
            <html>
                <head>
                    <title>Informe Mensual</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .page-break { page-break-after: always; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    const handleExportPDF = () => {
        const input = document.getElementById('monthly-report');
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 30;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save("informe_mensual.pdf");
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>
                <div id="monthly-report" ref={reportRef}>
                    <h2 className="text-2xl font-bold mb-4">Informe Mensual de Finanzas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                            <p className="text-2xl text-blue-600">{formatNumber(totalIngresos)}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Gastos</h3>
                            <p className="text-2xl text-red-600">{formatNumber(totalGastos)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <h3 className="text-lg font-semibold mb-2">Balance</h3>
                            <p className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {formatNumber(balance)}
                            </p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4">Análisis</h3>
                        <div className="space-y-4">
                            {/* Mes Actual */}
                            <div className="flex items-center">
                                {balance >= 0 ? (
                                    <FiTrendingUp className="text-green-500 text-4xl mr-2" />
                                ) : (
                                    <FiTrendingDown className="text-red-500 text-4xl mr-2" />
                                )}
                                <p className="text-lg">
                                    {balance >= 0
                                        ? `Ganancia de ${formatNumber(balance)}`
                                        : `Pérdida de ${formatNumber(Math.abs(balance))}`}
                                </p>
                            </div>

                            {/* Comparación con Mes Anterior */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-md font-medium mb-2">Comparación con Mes Anterior</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Balance Mes Anterior:</p>
                                        <p className={`text-lg font-medium ${previousMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatNumber(previousMonthBalance)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Cambio Porcentual:</p>
                                        <div className="flex items-center">
                                            {balanceChange > 0 ? (
                                                <FiTrendingUp className="text-green-500 mr-1" />
                                            ) : balanceChange < 0 ? (
                                                <FiTrendingDown className="text-red-500 mr-1" />
                                            ) : (
                                                <span className="text-gray-500 mr-1">=</span>
                                            )}
                                            <p className={`text-lg font-medium ${
                                                balanceChange > 0 ? 'text-green-600' : 
                                                balanceChange < 0 ? 'text-red-600' : 
                                                'text-gray-600'
                                            }`}>
                                                {balanceChange.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Resumen por Categorías</h3>
                        <div style={{ height: '300px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                        <FiPrinter className="mr-2" />
                        Imprimir
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                        <FiDownload className="mr-2" />
                        Exportar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReportModal;