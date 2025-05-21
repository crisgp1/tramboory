import React from 'react';

export const Table = ({ children, className, ...props }) => {
  return (
    <div className={`relative w-full overflow-auto ${className || ''}`} {...props}>
      <table className="w-full caption-bottom text-sm border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={`bg-gray-50 dark:bg-[#172033] ${className || ''}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-[#334155] ${className || ''}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className, ...props }) => {
  return (
    <tr 
      className={`border-b border-gray-200 dark:border-[#334155] transition-colors hover:bg-gray-50 dark:hover:bg-[#263449] ${className || ''}`} 
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className, ...props }) => {
  return (
    <th 
      className={`h-12 px-4 text-left align-middle font-medium text-gray-700 dark:text-white ${className || ''}`} 
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({ children, className, ...props }) => {
  return (
    <td 
      className={`p-4 align-middle text-gray-800 dark:text-white ${className || ''}`} 
      {...props}
    >
      {children}
    </td>
  );
};

export const Badge = ({ children, color = 'gray', className = '', ...props }) => {
  const colorMap = {
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-100',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-100',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-100',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-100',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/70 dark:text-pink-100',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-100',
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.gray} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};