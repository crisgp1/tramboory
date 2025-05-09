// ThemeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isDark 
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
    >
      {isDark ? (
        <FiSun className="text-yellow-500" />
      ) : (
        <FiMoon className="text-indigo-600" />
      )}
      <span className="text-sm font-medium">
        {isDark ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
    </button>
  );
};

export default ThemeToggle;