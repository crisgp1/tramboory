export const Button = ({ children, className, variant = 'default', ...props }) => {
    const baseStyle = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

    const variants = {
        default: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    };

    const variantStyle = variants[variant] || variants.default;

    return (
        <button
            className={`${baseStyle} ${variantStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};