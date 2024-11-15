import React, { useCallback, useMemo } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { FiPlus, FiMinus, FiPackage, FiCheck, FiDollarSign, FiShoppingCart, FiInfo } from 'react-icons/fi';

const ExtrasSection = ({ extras, control, setValue }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extras',
  });

  const handleExtraToggle = useCallback((extra) => {
    console.log('[ExtrasSection] Toggling extra:', extra);
    const existingIndex = fields.findIndex((field) => field.id === extra.id);
    if (existingIndex === -1) {
      console.log('[ExtrasSection] Adding extra with quantity 1');
      append({ id: extra.id, cantidad: 1 });
    } else {
      console.log('[ExtrasSection] Removing extra');
      remove(existingIndex);
    }
  }, [fields, append, remove]);

  const handleQuantityChange = useCallback((index, newQuantity) => {
    console.log('[ExtrasSection] Changing quantity:', { index, newQuantity });
    if (newQuantity < 1) {
      console.log('[ExtrasSection] Removing extra due to quantity < 1');
      remove(index);
    } else {
      console.log('[ExtrasSection] Updating quantity');
      setValue(`extras.${index}.cantidad`, newQuantity);
    }
  }, [remove, setValue]);

  const selectedExtras = useMemo(() => 
    fields.map(field => ({
      ...field,
      extra: extras.find(e => e.id === field.id)
    })).filter(item => item.extra),
    [fields, extras]
  );

  const renderQuantityControls = useCallback((index, cantidad) => (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={() => handleQuantityChange(index, cantidad - 1)}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Disminuir cantidad"
      >
        <FiMinus className="w-3 h-3" />
      </button>
      <Controller
        name={`extras.${index}.cantidad`}
        control={control}
        defaultValue={1}
        render={({ field }) => (
          <input
            type="number"
            {...field}
            min="1"
            className="w-16 text-center border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              handleQuantityChange(index, value);
            }}
            aria-label="Cantidad"
          />
        )}
      />
      <button
        type="button"
        onClick={() => handleQuantityChange(index, cantidad + 1)}
        className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Aumentar cantidad"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  ), [control, handleQuantityChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShoppingCart className="text-indigo-600 w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Extras</h3>
        </div>
        {fields.length > 0 && (
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {fields.length} seleccionado{fields.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {extras.map((extra) => {
          const existingExtra = fields.find((field) => field.id === extra.id);
          const isSelected = !!existingExtra;
          const extraIndex = fields.findIndex((field) => field.id === extra.id);

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

                {isSelected && renderQuantityControls(extraIndex, existingExtra.cantidad)}
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

      {selectedExtras.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FiPackage className="text-indigo-600" />
            Extras seleccionados
          </h4>
          <div className="space-y-2">
            {selectedExtras.map(({ id, cantidad, extra }) => (
              <div
                key={id}
                className="flex justify-between items-center text-sm bg-gray-50 p-2.5 rounded-md transition-colors duration-200 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <FiCheck className="text-indigo-500" />
                  <span className="font-medium">{extra.nombre}</span>
                  <span className="text-gray-500">
                    (x{cantidad})
                  </span>
                </div>
                <span className="font-medium text-indigo-600">
                  ${(parseFloat(extra.precio) * cantidad).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtrasSection;