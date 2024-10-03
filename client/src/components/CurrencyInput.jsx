import { useState } from 'react';

const CurrencyInput = ({ name, defaultValue, placeholder, icon: Icon, className }) => {
    const [displayValue, setDisplayValue] = useState(
        defaultValue ? formatNumber(defaultValue) : ''
    );

    const formatNumber = (num) => {
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const handleChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 1) {
            parts[1] = parts[1].slice(0, 2);
        }
        const formattedValue = formatNumber(parts.join('.'));
        setDisplayValue(formattedValue);

        // Actualizar el valor real (sin formato) en el formulario
        e.target.form[name].value = value;
    };

    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
            <input
                type="text"
                name={`${name}_display`}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
            />
            <input type="hidden" name={name} value={displayValue.replace(/,/g, '')} />
        </div>
    );
};

export default CurrencyInput;