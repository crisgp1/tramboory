import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isWeekend, isTuesday } from 'date-fns';
import axiosInstance from '../../components/axiosConfig';
import { FiX } from 'react-icons/fi';

// Importar los componentes del formulario
import PackageSection from './reservationform/PackageSection';
import FoodOptionsSection from './reservationform/FoodOptionsSection';
import DateTimeSection from './reservationform/DateTimeSection';
import ThemeSection from './reservationform/ThemeSection';
import MamparaSection from './reservationform/MamparaSection';
import ExtrasSection from './reservationform/ExtrasSection';
import CelebrantSection from './reservationform/CelebrantSection';
import CommentsSection from './reservationform/CommentsSection';

const TUESDAY_SURCHARGE = 1500;

const ReservationForm = ({
  editingItem,
  users,
  packages,
  foodOptions = [],
  extras = [],
  tematicas = [],
  mamparas = [],
  onSave,
  activeTab,
  blockedDates = [],
  existingReservations = [],
  onClose,
}) => {
  const [manualTotal, setManualTotal] = useState(false);
  const [total, setTotal] = useState('0.00');
  const [calculationLogs, setCalculationLogs] = useState([]);
  const formRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id_usuario: '',
      id_paquete: '',
      id_opcion_alimento: null,
      id_tematica: null,
      id_mampara: null,
      extras: [],
      fecha_reserva: null,
      hora_inicio: null,
      nombre_festejado: '',
      edad_festejado: '',
      comentarios: '',
      total: '0.00',
      estado: 'pendiente',
      activo: true
    },
  });

  // Usar useWatch para observar cambios en los campos relevantes
  const watchedFields = useWatch({
    control,
    name: ['id_paquete', 'id_opcion_alimento', 'id_mampara', 'extras', 'fecha_reserva', 'id_tematica'],
  });

  const addLog = useCallback((message, data = null) => {
    console.log(`[ReservationForm] ${message}`, data);
    setCalculationLogs(prev => [...prev, { message, data, timestamp: new Date() }]);
  }, []);

  // Calcular total
  const calculateTotal = useCallback(() => {
    let newTotal = 0;
    addLog('Iniciando cálculo del total');

    // Paquete base
    const paqueteId = getValues('id_paquete');
    const fecha = getValues('fecha_reserva');
    
    if (paqueteId && fecha) {
      const paquete = packages.find(p => Number(p.id) === Number(paqueteId));
      if (paquete) {
        const precio = isWeekend(fecha) 
          ? parseFloat(paquete.precio_viernes_domingo)
          : parseFloat(paquete.precio_lunes_jueves);
        
        newTotal += precio;
        addLog(`Precio del paquete (${isWeekend(fecha) ? 'fin de semana' : 'entre semana'}):`, precio);

        if (isTuesday(fecha)) {
          newTotal += TUESDAY_SURCHARGE;
          addLog('Cargo adicional por martes:', TUESDAY_SURCHARGE);
        }
      }
    }

    // Opción de alimento
    const alimentoValue = getValues('id_opcion_alimento');
    if (alimentoValue?.data?.precio_extra) {
      const precioAlimento = parseFloat(alimentoValue.data.precio_extra);
      newTotal += precioAlimento;
      addLog('Precio extra por alimento:', precioAlimento);
    }

    // Mampara
    const mamparaValue = getValues('id_mampara');
    if (mamparaValue?.data?.precio) {
      const precioMampara = parseFloat(mamparaValue.data.precio);
      newTotal += precioMampara;
      addLog('Precio de mampara:', precioMampara);
    }

    // Extras
    const selectedExtras = getValues('extras') || [];
    let extrasTotal = 0;
    selectedExtras.forEach(extra => {
      const extraInfo = extras.find(e => Number(e.id) === Number(extra.id));
      if (extraInfo?.precio && extra.cantidad) {
        const extraPrecio = parseFloat(extraInfo.precio) * parseInt(extra.cantidad);
        if (!isNaN(extraPrecio)) {
          extrasTotal += extraPrecio;
          addLog(`Extra ${extraInfo.nombre} (${extra.cantidad}x):`, extraPrecio);
        }
      }
    });
    newTotal += extrasTotal;
    addLog('Total de extras:', extrasTotal);

    addLog('Total final calculado:', newTotal);
    return parseFloat(newTotal).toFixed(2);
  }, [getValues, packages, extras, addLog]);

  // Inicializar datos de edición
  useEffect(() => {
    if (editingItem) {
      addLog('Inicializando datos de edición:', editingItem);
      const formattedData = {
        ...editingItem,
        id_usuario: editingItem.id_usuario,
        id_paquete: editingItem.id_paquete,
        id_opcion_alimento: editingItem.opcionAlimento ? {
          value: editingItem.opcionAlimento.id,
          label: `${editingItem.opcionAlimento.nombre} - Adulto: ${editingItem.opcionAlimento.platillo_adulto}, Niño: ${editingItem.opcionAlimento.platillo_nino} - $${editingItem.opcionAlimento.precio_extra}`,
          data: editingItem.opcionAlimento,
        } : null,
        id_tematica: editingItem.tematicaReserva ? {
          value: editingItem.tematicaReserva.id,
          label: editingItem.tematicaReserva.nombre,
          data: editingItem.tematicaReserva,
        } : null,
        id_mampara: editingItem.mampara ? {
          value: editingItem.mampara.id,
          label: `${editingItem.mampara.piezas} pieza(s) - $${editingItem.mampara.precio}`,
          data: editingItem.mampara,
        } : null,
        extras: editingItem.extras?.map(extra => ({
          id: extra.id,
          cantidad: extra.ReservaExtra?.cantidad || 1,
        })) || [],
        fecha_reserva: editingItem.fecha_reserva ? new Date(editingItem.fecha_reserva) : null,
        hora_inicio: editingItem.hora_inicio ? {
          value: editingItem.hora_inicio,
          hora_inicio: editingItem.hora_inicio,
        } : null,
        total: editingItem.total || '0.00',
        estado: editingItem.estado || 'pendiente',
        activo: editingItem.activo !== undefined ? editingItem.activo : true
      };

      reset(formattedData);
      setTotal(formattedData.total);
      addLog('Datos de edición formateados:', formattedData);
    }
  }, [editingItem, reset, addLog]);

  // Actualizar total cuando cambian los campos relevantes
  useEffect(() => {
    if (!manualTotal) {
      addLog('Actualizando total automáticamente');
      const newTotal = calculateTotal();
      setTotal(newTotal);
      setValue('total', newTotal);
    } else {
      addLog('Total en modo manual');
    }
  }, [watchedFields, manualTotal, calculateTotal, setValue, addLog]);

  // Filtrar mamparas basado en la temática seleccionada
  const filteredMamparas = useMemo(() => {
    const selectedTheme = watchedFields[5];
    return selectedTheme
      ? mamparas.filter(
          (m) =>
            Number(m.id_tematica) === Number(selectedTheme.value) && m.activo
        )
      : [];
  }, [watchedFields, mamparas]);

  const onSubmit = useCallback(
    async (data) => {
      try {
        addLog('Preparando datos para guardar:', data);
        const formattedData = {
          ...data,
          id_usuario: Number(data.id_usuario),
          id_paquete: Number(data.id_paquete),
          id_opcion_alimento: data.id_opcion_alimento?.value
            ? Number(data.id_opcion_alimento.value)
            : null,
          id_tematica: data.id_tematica?.value
            ? Number(data.id_tematica.value)
            : null,
          id_mampara: data.id_mampara?.value
            ? Number(data.id_mampara.value)
            : null,
          total: parseFloat(data.total),
          edad_festejado: Number(data.edad_festejado),
          extras: data.extras?.map((extra) => ({
            id: Number(extra.id),
            cantidad: Number(extra.cantidad),
          })) || [],
          estado: data.estado,
          activo: data.activo,
          hora_inicio: data.hora_inicio?.hora_inicio || data.hora_inicio,
        };

        addLog('Datos formateados para guardar:', formattedData);

        // Guardar la reserva
        const savedReservation = await onSave(formattedData);
        addLog('Reserva guardada:', savedReservation);

        if (savedReservation?.id) {
          // Crear entrada en finanzas
          const financeData = {
            id_reserva: savedReservation.id,
            tipo: 'ingreso',
            monto: formattedData.total,
            fecha: new Date(),
            descripcion: `Ingreso por reserva #${savedReservation.id}`,
            categoria: 'Reserva',
          };

          await axiosInstance.post('/api/finanzas', financeData);
          addLog('Entrada de finanzas creada:', financeData);

          // Crear entrada en pagos
          const paymentData = {
            id_reserva: savedReservation.id,
            monto: formattedData.total,
            fecha_pago: new Date(),
            metodo_pago: 'pendiente',
            estado: 'pendiente',
          };

          await axiosInstance.post('/api/pagos', paymentData);
          addLog('Entrada de pagos creada:', paymentData);
        }
      } catch (error) {
        console.error('Error al guardar la reserva:', error);
        addLog('Error al guardar la reserva:', error);
      }
    },
    [onSave, addLog]
  );

  // Sección de Usuario
  const UserSection = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Usuario
      </label>
      <div className="relative">
        <select
          {...register('id_usuario', {
            required: 'Este campo es requerido',
          })}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => {
            register('id_usuario').onChange(e);
            addLog('Usuario seleccionado:', e.target.value);
          }}
        >
          <option value="">Seleccionar usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nombre}
            </option>
          ))}
        </select>
        {errors.id_usuario && (
          <p className="mt-1 text-xs text-red-500">
            {errors.id_usuario.message}
          </p>
        )}
      </div>
    </div>
  );

  // Nueva sección de Estado y Activo
  const StatusSection = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado de la Reservación
          </label>
          <select
            {...register('estado')}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado Activo
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('activo')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              Reservación activa
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {editingItem ? 'Editar Reservación' : 'Nueva Reservación'}
          </h2>

          <form
            ref={formRef}
            id={activeTab + 'Form'}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto px-2"
          >
            <UserSection />
            <StatusSection />

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <PackageSection 
                control={control}
                packages={packages}
                errors={errors}
                setValue={setValue}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <FoodOptionsSection
                control={control}
                errors={errors}
                foodOptions={foodOptions}
                setValue={setValue}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <DateTimeSection
                control={control}
                errors={errors}
                setValue={setValue}
                unavailableDates={blockedDates}
                existingReservations={existingReservations}
                packages={packages}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <ThemeSection
                control={control}
                errors={errors}
                tematicas={tematicas}
                setValue={setValue}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <MamparaSection
                control={control}
                errors={errors}
                filteredMamparas={filteredMamparas}
                setValue={setValue}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <ExtrasSection
                extras={extras}
                control={control}
                setValue={setValue}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <CelebrantSection
                control={control}
                errors={errors}
              />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <CommentsSection
                control={control}
              />
            </div>

            {/* Total Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <label className="text-lg font-medium text-gray-700">
                  Total
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={manualTotal}
                    onChange={(e) => {
                      setManualTotal(e.target.checked);
                      if (!e.target.checked) {
                        const newTotal = calculateTotal();
                        setTotal(newTotal);
                        setValue('total', newTotal);
                        addLog('Total actualizado automáticamente:', newTotal);
                      } else {
                        addLog('Modo manual activado');
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-500">Editar manualmente</span>
                </div>
              </div>
              <div className="mt-2 flex gap-4">
                <input
                  type="text"
                  value={total}
                  onChange={(e) => {
                    if (manualTotal) {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setTotal(value);
                      setValue('total', value);
                      addLog('Total actualizado manualmente:', value);
                    }
                  }}
                  readOnly={!manualTotal}
                  className="flex-1 px-3 py-2 text-lg font-medium text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTotal = calculateTotal();
                    setTotal(newTotal);
                    setValue('total', newTotal);
                    addLog('Total recalculado:', newTotal);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Calcular
                </button>
              </div>

              {/* Logs de cálculo */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Logs de cálculo:</h4>
                {calculationLogs.slice(-5).map((log, index) => (
                  <div key={index} className="text-xs text-gray-600 mb-1">
                    {new Date(log.timestamp).toLocaleTimeString()}: {log.message}
                    {log.data !== null && (
                      <span className="text-indigo-600"> {JSON.stringify(log.data)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={activeTab + 'Form'}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {editingItem ? 'Actualizar' : 'Crear'} Reservación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;