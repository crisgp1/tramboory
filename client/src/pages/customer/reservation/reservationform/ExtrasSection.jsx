import React, { useCallback, useMemo, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { FiPlus, FiMinus, FiCheck, FiDollarSign, FiShoppingCart, FiInfo } from 'react-icons/fi';
import { processExtras } from '../../../../utils/reservationUtils';

const ExtrasSection = ({ extras, control, setValue }) => {
  const selectedExtras = useWatch({
    control,
    name: 'extras',
    defaultValue: []
  });

  // Efecto para procesar extras y eliminar duplicados al inicializar
  useEffect(() => {
    if (selectedExtras && selectedExtras.length > 0) {
      const processedExtras = processExtras(selectedExtras);
      if (JSON.stringify(processedExtras) !== JSON.stringify(selectedExtras)) {
        setValue('extras', processedExtras);
      }
    }
  }, []);

  const handleExtraToggle = useCallback((extra) => {
    const currentExtras = selectedExtras || [];
    // Usar Number() para garantizar comparación consistente
    const existingIndex = currentExtras.findIndex((item) => Number(item.id) === Number(extra.id));
    
    if (existingIndex === -1) {
      // Preservar propiedades adicionales útiles
      setValue('extras', [...currentExtras, { 
        id: extra.id, 
        cantidad: 1,
        nombre: extra.nombre,
        precio: extra.precio
      }]);
    } else {
      setValue('extras', currentExtras.filter((_, index) => index !== existingIndex));
    }
  }, [selectedExtras, setValue]);

  const handleQuantityChange = useCallback((extraId, newQuantity) => {
    const currentExtras = selectedExtras || [];
    // Usar Number() para garantizar comparación consistente
    const existingIndex = currentExtras.findIndex((item) => Number(item.id) === Number(extraId));
    
    if (newQuantity < 1) {
      setValue('extras', currentExtras.filter((_, index) => index !== existingIndex));
    } else {
      const updatedExtras = [...currentExtras];
      updatedExtras[existingIndex] = { 
        ...updatedExtras[existingIndex], 
        cantidad: newQuantity 
      };
      setValue('extras', updatedExtras);
    }
  }, [selectedExtras, setValue]);

  const renderQuantityControls = useCallback((extraId, cantidad) => (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={() => handleQuantityChange(extraId, cantidad - 1)}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Disminuir cantidad"
      >
        <FiMinus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={cantidad}
        min="1"
        onChange={(e) => handleQuantityChange(extraId, parseInt(e.target.value) || 1)}
        className="w-16 text-center border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        aria-label="Cantidad"
      />
      <button
        type="button"
        onClick={() => handleQuantityChange(extraId, cantidad + 1)}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Aumentar cantidad"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  ), [handleQuantityChange]);

  const selectedCount = useMemo(() => selectedExtras?.length || 0, [selectedExtras]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShoppingCart className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Extras</h3>
        </div>
        {selectedCount > 0 && (
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra) => {
          // Usar Number() para garantizar comparación consistente
          const existingExtra = selectedExtras?.find((item) => Number(item.id) === Number(extra.id));
          const isSelected = !!existingExtra;

          return (
            <div
              key={extra.id}
              className={`group p-4 rounded-lg border transition-all duration-300 transform ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{extra.nombre}</h4>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                        <FiCheck className="w-3 h-3" />
                        Seleccionado
                      </span>
                    )}
                  </div>
                  {extra.descripcion && (
                    <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-700">
                      {extra.descripcion}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleExtraToggle(extra)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  aria-label={isSelected ? 'Remover extra' : 'Agregar extra'}
                >
                  {isSelected ? <FiMinus /> : <FiPlus />}
                </button>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-indigo-600 w-4 h-4" />
                  <span className="text-lg font-semibold text-indigo-600">
                    ${Number(extra.precio).toFixed(2)}
                  </span>
                </div>

                {isSelected && renderQuantityControls(
                  extra.id, 
                  // Manejar diferentes formatos de cantidad (edición vs nuevo)
                  existingExtra.cantidad || existingExtra.ReservaExtra?.cantidad || 1
                )}
              </div>
            </div>
          );
        })}
      </div>

      {extras.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FiInfo className="w-5 h-5" />
          <span>No hay extras disponibles</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ExtrasSection);