import { useState } from 'react';

const withValidation = (WrappedComponent) => {
    return function ValidatedField({ isRequired, ...props }) {
        const [touched, setTouched] = useState(false);
        const [value, setValue] = useState(props.defaultValue || '');

        const handleBlur = () => setTouched(true);
        const handleChange = (e) => setValue(e.target.value);

        const showError = touched && isRequired && !value;

        return (
            <div>
                <WrappedComponent
                    {...props}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={`${props.className} ${showError ? 'border-red-500' : ''}`}
                />
                {showError && (
                    <p className="mt-1 text-xs text-red-500">Este campo es requerido</p>
                )}
            </div>
        );
    };
};

export default withValidation;