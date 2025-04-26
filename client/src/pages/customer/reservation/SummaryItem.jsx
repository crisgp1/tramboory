// SummaryItem.js
import React from 'react';

const SummaryItem = ({ icon, label, value }) => {
  if (!value) return null;

  return (
    <div className="flex items-center space-x-3">
      <div className="text-indigo-500">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">
          {value && typeof value === 'object' && value.label
            ? value.label
            : value || 'No seleccionado'}
        </p>
      </div>
    </div>
  );
};

export default SummaryItem;
