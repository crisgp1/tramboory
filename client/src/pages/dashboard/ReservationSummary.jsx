import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiPackage, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { format, isWeekend, isTuesday } from 'date-fns';
import { es } from 'date-fns/locale';

const TUESDAY_SURCHARGE = 500;

const ReservationSummary = ({ 
  formData, 
  packages = [], 
  foodOptions = [], 
  extras = [],
  tematicas = [],
  mamparas = []
}) => {
    const {
        fecha_reserva,
        hora_inicio,
        id_paquete,
        id_opcion_alimento,
        id_tematica,
        id_mampara,
        extras: selectedExtras = [],
        estado,
        activo
    } = formData || {};

    const calculateTotal = () => {
        let total = 0;

        // Precio base del paquete según el día
        if (id_paquete && fecha_reserva) {
            const selectedPackage = packages.find(p => p.id === id_paquete);
            if (selectedPackage) {
                const isWeekendDay = isWeekend(fecha_reserva);
                total += isWeekendDay 
                    ? parseFloat(selectedPackage.precio_viernes_domingo)
                    : parseFloat(selectedPackage.precio_lunes_jueves);

                // Cargo extra por martes
                if (isTuesday(fecha_reserva)) {
                    total += TUESDAY_SURCHARGE;
                }
            }
        }

        // Precio de la opción de alimento
        if (id_opcion_alimento) {
            const selectedFood = foodOptions.find(f => f.id === id_opcion_alimento);
            if (selectedFood?.precio_extra) {
                total += parseFloat(selectedFood.precio_extra);
            }
        }

        // Precio de la mampara
        if (id_mampara) {
            const selectedMampara = mamparas.find(m => m.id === id_mampara);
            if (selectedMampara?.precio) {
                total += parseFloat(selectedMampara.precio);
            }
        }

        // Precio de los extras
        if (selectedExtras.length > 0) {
            selectedExtras.forEach(selectedExtra => {
                const extra = extras.find(e => e.id === selectedExtra.id);
                if (extra?.precio && selectedExtra.cantidad) {
                    total += parseFloat(extra.precio) * parseInt(selectedExtra.cantidad);
                }
            });
        }

        return total;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const selectedPackage = packages.find(p => p.id === id_paquete);
    const selectedFood = foodOptions.find(f => f.id === id_opcion_alimento);
    const selectedTematica = tematicas.find(t => t.id === id_tematica);
    const selectedMampara = mamparas.find(m => m.id === id_mampara);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmada':
                return 'bg-green-100 text-green-800';
            case 'cancelada':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6 space-y-4"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Resumen de Reserva</h2>
                <div className="flex items-center gap-3">
                    {estado && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estado)}`}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </span>
                    )}
                    {activo !== undefined && (
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            <FiCheckCircle className={activo ? 'text-green-500' : 'text-gray-500'} />
                            {activo ? 'Activa' : 'Inactiva'}
                        </span>
                    )}
                </div>
            </div>

            {fecha_reserva && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiCalendar className="text-indigo-500" />
                    <div>
                        <div className="font-medium">Fecha</div>
                        <div className="text-sm text-gray-600">
                            {format(fecha_reserva, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                        </div>
                    </div>
                </div>
            )}

            {hora_inicio && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiClock className="text-indigo-500" />
                    <div>
                        <div className="font-medium">Horario</div>
                        <div className="text-sm text-gray-600">
                            {hora_inicio === 'mañana' ? 'Mañana (11:00 - 16:00)' : 'Tarde (17:00 - 22:00)'}
                        </div>
                    </div>
                </div>
            )}

            {selectedPackage && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiPackage className="text-indigo-500" />
                    <div>
                        <div className="font-medium">Paquete</div>
                        <div className="text-sm text-gray-600">{selectedPackage.nombre}</div>
                        {fecha_reserva && (
                            <div className="text-sm text-indigo-600 mt-1">
                                Precio base: {formatCurrency(
                                    isWeekend(fecha_reserva)
                                        ? selectedPackage.precio_viernes_domingo
                                        : selectedPackage.precio_lunes_jueves
                                )}
                                {isTuesday(fecha_reserva) && (
                                    <span className="block text-amber-600">
                                        + Cargo martes: {formatCurrency(TUESDAY_SURCHARGE)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedFood && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiPackage className="text-indigo-500" />
                    <div>
                        <div className="font-medium">Opción de Alimento</div>
                        <div className="text-sm text-gray-600">{selectedFood.nombre}</div>
                        <div className="text-sm text-indigo-600 mt-1">
                            Extra: {formatCurrency(selectedFood.precio_extra)}
                        </div>
                    </div>
                </div>
            )}

            {selectedTematica && selectedMampara && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FiPackage className="text-indigo-500" />
                    <div>
                        <div className="font-medium">Temática y Mampara</div>
                        <div className="text-sm text-gray-600">
                            {selectedTematica.nombre} - {selectedMampara.piezas} piezas
                        </div>
                        <div className="text-sm text-indigo-600 mt-1">
                            Precio: {formatCurrency(selectedMampara.precio)}
                        </div>
                    </div>
                </div>
            )}

            {selectedExtras?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-2">Extras Seleccionados</div>
                    <div className="space-y-2">
                        {selectedExtras.map(selectedExtra => {
                            const extra = extras.find(e => e.id === selectedExtra.id);
                            if (!extra) return null;
                            return (
                                <div key={extra.id} className="flex justify-between text-sm text-gray-600">
                                    <span>{extra.nombre} (x{selectedExtra.cantidad})</span>
                                    <span className="text-indigo-600">
                                        {formatCurrency(extra.precio * selectedExtra.cantidad)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <FiDollarSign className="text-2xl text-indigo-600" />
                    <span className="font-medium text-indigo-900">Total</span>
                </div>
                <span className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(calculateTotal())}
                </span>
            </div>
        </motion.div>
    );
};

export default ReservationSummary;