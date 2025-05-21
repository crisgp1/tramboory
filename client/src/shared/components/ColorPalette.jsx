import React from 'react';
import { FiInfo } from 'react-icons/fi';

const ColorPalette = ({ onSelectColor, selectedColor }) => {
  // Beautiful array of vibrant colors with descriptive names
  const colors = [
    { hex: '#FF5733', name: 'Rojo vibrante' },
    { hex: '#33FF57', name: 'Verde lima' },
    { hex: '#3357FF', name: 'Azul brillante' },
    { hex: '#FF33A8', name: 'Rosa fuerte' },
    { hex: '#33FFF3', name: 'Turquesa' },
    { hex: '#F3FF33', name: 'Amarillo' },
    { hex: '#FF5733', name: 'Naranja' },
    { hex: '#A833FF', name: 'Púrpura' },
    { hex: '#FF3333', name: 'Rojo' },
    { hex: '#33FF33', name: 'Verde' }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiInfo className="text-indigo-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Selección de Color</h3>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <table className="color-picker w-full">
          <tbody>
            <tr>
              {colors.slice(0, 5).map((color) => (
                <td 
                  key={color.hex}
                  data-color={color.hex}
                  title={`${color.name}: ${color.hex}`}
                  style={{ 
                    background: color.hex,
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    border: selectedColor === color.hex ? '2px solid #000' : '1px solid #ccc'
                  }}
                  onClick={() => onSelectColor(color.hex)}
                  className="rounded-md transition-all duration-200 hover:scale-110"
                ></td>
              ))}
            </tr>
            <tr>
              {colors.slice(5, 10).map((color) => (
                <td 
                  key={color.hex}
                  data-color={color.hex}
                  title={`${color.name}: ${color.hex}`}
                  style={{ 
                    background: color.hex,
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    border: selectedColor === color.hex ? '2px solid #000' : '1px solid #ccc'
                  }}
                  onClick={() => onSelectColor(color.hex)}
                  className="rounded-md transition-all duration-200 hover:scale-110"
                ></td>
              ))}
            </tr>
          </tbody>
        </table>
        
        {selectedColor && (
          <div className="mt-4 flex items-center gap-2">
            <div 
              style={{ 
                background: selectedColor,
                width: '24px',
                height: '24px'
              }}
              className="rounded-md border border-gray-300"
            ></div>
            <span className="text-sm font-medium">{selectedColor}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;