import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  className, 
  variant = 'default',
  disabled = false,
  onClick,
  text,
  ...props 
}) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-medium transition-all duration-300';

  const variants = {
    default: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50 transform scale-98'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
    outline: disabled
      ? 'bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
      : 'bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    danger: disabled
      ? 'bg-red-200 text-red-400 cursor-not-allowed opacity-50'
      : 'bg-red-500 hover:bg-red-600 text-white',
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${className || ''}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      {text || children}
    </motion.button>
  );
};

export default Button;