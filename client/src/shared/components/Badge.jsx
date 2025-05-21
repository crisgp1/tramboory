
export const Badge = ({ children, variant = 'default' }) => {
    const badgeClasses = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        secondary: 'bg-blue-100 text-blue-800',
    };

    return (
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${badgeClasses[variant]}`}>
      {children}
    </span>
    );
};