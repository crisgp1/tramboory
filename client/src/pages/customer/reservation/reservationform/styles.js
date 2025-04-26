// Common select styles for react-select components
export const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#E5E7EB',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#6366F1',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#6366F1' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: '#E0E7FF',
    },
  }),
};

// Common currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

// Common input styles
export const inputStyles = `
  w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm 
  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
`;

// Common button styles
export const buttonStyles = {
  primary: `
    px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
    transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm
  `,
  secondary: `
    px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 
    transition-colors duration-200 flex items-center gap-2
  `,
};

// Calendar styles
export const calendarStyles = {
  calendarContainer: `
    bg-white border border-gray-200 rounded-lg shadow-lg p-4
    font-sans
  `,
  monthYearWrapper: `
    flex items-center justify-between mb-4
    text-gray-800 font-semibold
  `,
  monthYear: `
    text-lg font-bold text-gray-900
  `,
  nextPrevButton: `
    p-2 rounded-full hover:bg-gray-100
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    transition-colors duration-200
  `,
  weekDays: `
    grid grid-cols-7 gap-1 mb-2
    text-sm font-medium text-gray-600
  `,
  dayWrapper: `
    aspect-square flex items-center justify-center
    text-sm font-medium cursor-pointer
    transition-all duration-200
  `,
  selectedDay: `
    bg-indigo-600 text-white rounded-full
    hover:bg-indigo-700
  `,
  today: `
    border-2 border-indigo-500 rounded-full
    text-indigo-600
  `,
  disabledDay: `
    text-gray-300 cursor-not-allowed
    hover:bg-transparent
  `,
  normalDay: `
    hover:bg-gray-100 rounded-full
    text-gray-700
  `,
  weekend: `
    text-indigo-600 font-semibold
  `,
};

// Time slot styles
export const timeSlotStyles = {
  container: `
    mt-4 grid grid-cols-2 gap-2
  `,
  slot: `
    p-3 border rounded-lg text-center cursor-pointer
    transition-all duration-200
    hover:border-indigo-500 hover:bg-indigo-50
  `,
  slotSelected: `
    border-indigo-500 bg-indigo-50 text-indigo-700
    font-medium
  `,
  slotDisabled: `
    bg-gray-50 text-gray-400 cursor-not-allowed
    hover:border-gray-200 hover:bg-gray-50
  `,
  slotLabel: `
    text-sm font-medium
  `,
  slotTime: `
    text-xs text-gray-500 mt-1
  `,
};