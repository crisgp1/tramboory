import React from 'react';

export const Input = ({ 
  className, 
  label, 
  icon: Icon, 
  error, 
  required = false,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="text-gray-400 dark:text-gray-500" size={16} />
          </div>
        )}
        <input
          className={`w-full px-3 py-2 ${Icon ? 'pl-10' : ''} border rounded-md
            focus:ring-indigo-500 focus:border-indigo-500
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
            bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white
            ${className || ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const Select = ({ 
  className, 
  label, 
  options = [], 
  error, 
  required = false,
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-md appearance-none
          focus:ring-indigo-500 focus:border-indigo-500
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
          bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white
          ${className || ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};