import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = ({ className = '', compact = false, iconOnly = false, placement = 'right' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Different sizes based on compact prop
  const iconSize = compact ? 16 : 20;
  const paddingClass = compact ? 'px-2 py-1.5' : 'px-3 py-2';
  const textClass = compact ? 'text-xs' : 'text-sm';
  
  // Icon-only variation for when space is tight
  if (iconOnly) {
    return (
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.1 }}
        className={`p-2 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-indigo-800 text-yellow-300 hover:bg-indigo-700 border border-indigo-700'
            : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-100'
        } ${className}`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative"
        >
          {isDark ? (
            <FiSun className="text-yellow-300" size={iconSize} />
          ) : (
            <FiMoon className="text-indigo-600" size={iconSize} />
          )}
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center justify-center gap-2 ${paddingClass} rounded-md transition-all duration-300 ${
        isDark
          ? 'bg-indigo-800 text-yellow-300 hover:bg-indigo-700 border border-indigo-700'
          : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-100'
      } ${className}`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative"
      >
        {isDark ? (
          <FiSun className="text-yellow-300" size={iconSize} />
        ) : (
          <FiMoon className="text-indigo-600" size={iconSize} />
        )}
      </motion.div>
      
      {!iconOnly && (
        <motion.span 
          className={`${textClass} font-medium`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </motion.span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;