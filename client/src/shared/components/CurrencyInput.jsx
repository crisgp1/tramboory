import React, { forwardRef } from 'react';
import { formatNumber } from '../utils/formatters.js';

const CurrencyInput = forwardRef(({ name, value, placeholder, icon: Icon, className, readOnly = false, onChange, error, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
        value ? formatNumber(value) : ''
    );

    // Actualizar el displayValue cuando cambia el valor externo
    React.useEffect(() => {
        if (value !== undefined) {
            setDisplayValue(value ? formatNumber(value) : '');
        }
    }, [value]);

    const handleChange = (e) => {
        let newValue = e.target.value.replace(/,/g, '');
        // Permitir solo números y un punto decimal
        newValue = newValue.replace(/[^0-9.]/g, '');
        
        // Asegurar que solo haya un punto decimal
        const parts = newValue.split('.');
        if (parts.length > 2) {
            parts.pop();
            newValue = parts.join('.');
        }
        
        // Limitar a dos decimales
        if (parts.length === 2) {
            parts[1] = parts[1].slice(0, 2);
            newValue = parts.join('.');
        }

        // Actualizar la visualización
        setDisplayValue(formatNumber(newValue));
        
        // Pasar el valor como string al formulario
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: newValue || ''
                }
            });
        }
    };

    return (
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
            <input
                type="text"
                name={name}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    error ? 'border-red-500' : ''
                } ${className}`}
                readOnly={readOnly}
                ref={ref}
                {...props}
            />
            {error && (
                <div className="text-red-500 text-sm mt-1">
                    {error}
                </div>
            )}
        </div>
    );
});

export default CurrencyInput;