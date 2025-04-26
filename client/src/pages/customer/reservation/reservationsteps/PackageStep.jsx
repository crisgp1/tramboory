import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiUsers, FiCheck, FiInfo } from 'react-icons/fi';

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount || 0);
};

const PackageStep = ({ packages, nextStep }) => {
  const { control, setValue, watch, formState: { errors } } = useFormContext();
  const selectedPackageId = watch('id_paquete');
  const [expandedDetails, setExpandedDetails] = useState(null);

  // Ordenar paquetes por precio
  const sortedPackages = [...packages].sort((a, b) => {
    return parseFloat(a.precio_lunes_jueves) - parseFloat(b.precio_lunes_jueves);
  });

  // Establecer valor predeterminado si no hay selección y hay paquetes disponibles
  useEffect(() => {
    if (!selectedPackageId && sortedPackages.length > 0) {
      // No seleccionar automáticamente, dejar que el usuario elija
    }
  }, [selectedPackageId, sortedPackages]);

  // Función para alternar detalles expandidos
  const toggleDetails = (packageId) => {
    setExpandedDetails(expandedDetails === packageId ? null : packageId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Selecciona tu Paquete</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Elige el paquete que más se adapte a tus necesidades para tu celebración especial
        </p>
      </div>

      <Controller
        control={control}
        name="id_paquete"
        rules={{ required: "Por favor selecciona un paquete" }}
        render={({ field }) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedPackages.map((pkg) => {
                const isSelected = field.value === pkg.id;
                const isExpanded = expandedDetails === pkg.id;

                return (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-indigo-500 transform scale-[1.02]'
                        : 'hover:shadow-xl'
                    }`}
                  >
                    <div
                      className={`border h-full flex flex-col rounded-xl overflow-hidden ${
                        isSelected ? 'border-indigo-500' : 'border-gray-200'
                      }`}
                    >
                      {/* Encabezado del paquete */}
                      <div
                        className={`p-5 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FiPackage
                              className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-indigo-600'}`}
                            />
                            <h3 className="text-lg font-semibold">{pkg.nombre}</h3>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-medium">
                              <FiCheck className="w-3 h-3" />
                              Seleccionado
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cuerpo del paquete */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Precios */}
                        <div className="flex justify-between mb-4">
                          <div>
                            <div className="text-gray-500 text-sm">Lunes - Jueves</div>
                            <div className="text-indigo-600 font-semibold text-lg">
                              {formatCurrency(pkg.precio_lunes_jueves)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-500 text-sm">Viernes - Domingo</div>
                            <div className="text-indigo-600 font-semibold text-lg">
                              {formatCurrency(pkg.precio_viernes_domingo)}
                            </div>
                          </div>
                        </div>

                        {/* Capacidad */}
                        <div className="flex items-center gap-2 mb-3">
                          <FiUsers className="text-gray-500" />
                          <span className="text-gray-700">
                            {pkg.min_invitados} - {pkg.max_invitados} invitados
                          </span>
                        </div>

                        {/* Características del paquete (sólo si expande) */}
                        <div className={`mt-2 space-y-2 ${isExpanded ? 'block' : 'hidden'}`}>
                          {pkg.descripcion && (
                            <div className="text-gray-700 text-sm">{pkg.descripcion}</div>
                          )}
                          {/* Aquí se pueden agregar más características específicas del paquete */}
                        </div>

                        {/* Botón para expandir/colapsar detalles */}
                        <button
                          type="button"
                          onClick={() => toggleDetails(pkg.id)}
                          className="mt-auto text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          {isExpanded ? 'Ver menos detalles' : 'Ver más detalles'}
                        </button>
                      </div>

                      {/* Pie de paquete con botón de selección */}
                      <div className="p-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(pkg.id);
                            setTimeout(() => {
                              // Permitir que la selección visual ocurra antes de avanzar
                              // nextStep();
                            }, 500);
                          }}
                          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                            isSelected
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isSelected ? 'Paquete Seleccionado' : 'Seleccionar este Paquete'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {errors.id_paquete && (
              <p className="text-red-500 flex items-center gap-1 text-sm mt-2">
                <FiInfo className="w-4 h-4 flex-shrink-0" />
                <span>{errors.id_paquete.message}</span>
              </p>
            )}
          </div>
        )}
      />

      {sortedPackages.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FiInfo className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay paquetes disponibles en este momento</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex gap-3">
          <FiInfo className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800">¿No encuentras lo que buscas?</h4>
            <p className="text-blue-700 text-sm mt-1">
              Todos nuestros paquetes son personalizables. Selecciona el más cercano a tus
              necesidades y después podrás ajustarlo con extras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageStep;