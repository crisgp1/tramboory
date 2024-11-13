import React, { forwardRef } from 'react';
import { formatNumber } from '../utils/formatters.js';

const CurrencyInput = forwardRef(({ name, defaultValue, placeholder, icon: Icon, className, readOnly = false, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
        defaultValue ? formatNumber(defaultValue) : ''
    );

    const handleChange = (e) => {
        let value = e.target.value.replace(/,/g, '');
        // Permitir solo números y un punto decimal
        value = value.replace(/[^0-9.]/g, '');
        // Asegurar que solo haya un punto decimal
        const parts = value.split('.');
        if (parts.length > 2) {
            parts.pop();
            value = parts.join('.');
        }
        // Limitar a dos decimales
        if (parts.length === 2) {
            parts[1] = parts[1].slice(0, 2);
            value = parts.join('.');
        }
        const formattedValue = formatNumber(value);
        setDisplayValue(formattedValue);
        // Actualizar el valor real (sin comas) en el formulario
        if (onChange) {
            onChange(value);
        }
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
                readOnly={readOnly}
                ref={ref}
                {...props}
            />
            <input type="hidden" name={name} value={displayValue.replace(/,/g, '')} />
        </div>
    );
});

export default CurrencyInput;