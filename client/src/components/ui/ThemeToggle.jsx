import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className={`relative p-2 rounded-lg overflow-hidden flex items-center ${className}`}
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative z-10 flex items-center justify-center">
        {isDark ? (
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <FiSun className="text-yellow-300" size={20} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <FiMoon className="text-indigo-600" size={20} />
          </motion.div>
        )}
      </div>
      <span className="ml-2 text-sm font-medium hidden md:inline-block">
        {isDark ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
    </motion.button>
  );
};

export default ThemeToggle;