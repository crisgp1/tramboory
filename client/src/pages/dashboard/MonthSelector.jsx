import React from 'react';

const MonthSelector = ({ selectedMonth, onMonthChange }) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    return (
        <div className="mt-8 flex justify-end">
            <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(parseInt(e.target.value))}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {months.map((month, index) => (
                    <option key={index} value={index}>
                        {month}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MonthSelector;