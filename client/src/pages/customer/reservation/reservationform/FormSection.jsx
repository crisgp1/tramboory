import React from 'react';

const FormSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
      {title}
    </h3>
    {children}
  </div>
);

export default FormSection;
