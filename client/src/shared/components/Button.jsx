import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export const Button = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  text,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Size variations
  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };
  
  const baseStyle = `${sizes[size]} rounded-lg font-medium transition-all duration-300 ${
    fullWidth ? 'w-full' : ''
  }`;

  const getVariantStyle = () => {
    if (disabled || loading) {
      return {
        default: 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50',
        outline: 'bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed opacity-50',
        danger: 'bg-red-200 text-red-400 cursor-not-allowed opacity-50',
        warning: 'bg-yellow-200 text-yellow-400 cursor-not-allowed opacity-50',
        success: 'bg-green-200 text-green-400 cursor-not-allowed opacity-50'
      }[variant];
    }
    
    if (isDark) {
      return {
        default: 'bg-indigo-700 text-white hover:bg-indigo-600 active:scale-95',
        outline: 'bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-900/50',
        danger: 'bg-red-700 hover:bg-red-600 text-white',
        warning: 'bg-yellow-700 hover:bg-yellow-600 text-white',
        success: 'bg-green-700 hover:bg-green-600 text-white'
      }[variant];
    }
    
    return {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
      outline: 'bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white'
    }[variant];
  };

  const variantStyle = getVariantStyle();

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    />
  );

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyle} ${className}`}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <LoadingSpinner />}
        {icon && iconPosition === 'left' && !loading && icon}
        {text || children}
        {icon && iconPosition === 'right' && !loading && icon}
      </div>
    </motion.button>
  );
};

export default Button;