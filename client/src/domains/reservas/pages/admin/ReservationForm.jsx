import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isWeekend, isTuesday } from 'date-fns';
import { 
  TIME_SLOTS, 
  formatReservationForApi, 
  formatReservationForEditing 
} from '@shared/utils/reservationUtils';
import axiosInstance from '@shared/utils/axiosConfig';
import { FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Importar las secciones restantes (sin UserSection, porque lo reemplazamos):
import PackageSection from './reservationform-components/PackageSection.jsx';
import FoodOptionsSection from './reservationform-components/FoodOptionsSection.jsx';
import DateTimeSection from './reservationform-components/DateTimeSection.jsx';
import ThemeSection from './reservationform-components/ThemeSection.jsx';
import MamparaSection from './reservationform-components/MamparaSection.jsx';
import ExtrasSection from './reservationform-components/ExtrasSection.jsx';
import CelebrantSection from './reservationform-components/CelebrantSection.jsx';
import CommentsSection from './reservationform-components/CommentsSection.jsx';
import GenderSelector from '@shared/components/form/GenderSelector';


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
  existingReservations = [],
  onClose,
}) => {
  const [manualTotal, setManualTotal] = useState(false);
  const [total, setTotal] = useState('0.00');
  const [calculationLogs, setCalculationLogs] = useState([]);
  const [showTuesdayModal, setShowTuesdayModal] = useState(false);
  const [savedReservation, setSavedReservation] = useState(null);
  const formRef = useRef(null);

  // ----------- ESTADOS Y LÓGICA PARA EL BUSCADOR DE USUARIOS -----------
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  // ---------------------------------------------------------------------

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    watch,
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
      activo: true,
      tuesdayFee: 0,
    },
  });

  const watchedFields = useWatch({
    control,
    name: [
      'id_paquete',
      'id_opcion_alimento',
      'id_mampara',
      'extras',
      'fecha_reserva',
      'id_tematica',
      'tuesdayFee',
    ],
  });

  // ---------------------------------------------------------------------
  // Funciones de LOG (opcional, para debug)
  // ---------------------------------------------------------------------
  const sanitizeLogData = (data) => {
    if (!data) return null;
    if (typeof data === 'number' || typeof data === 'string') return data;
    if (Array.isArray(data)) return '[Array]';
    if (typeof data === 'object') return '[Object]';
    return String(data);
  };

  const addLog = useCallback((message, data = null) => {
    const sanitizedData = sanitizeLogData(data);
    console.log(`[ReservationForm] ${message}`, sanitizedData);
    setCalculationLogs((prev) => [
      ...prev.slice(-4),
      {
        message,
        data: sanitizedData,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // ---------------------------------------------------------------------
  // Lógica para calcular el total de la reserva
  // ---------------------------------------------------------------------
  const calculateTotal = useCallback(() => {
    let newTotal = 0;
    addLog('Iniciando cálculo del total');

    const paqueteId = getValues('id_paquete');
    const fecha = getValues('fecha_reserva');
    const tuesdayFee = getValues('tuesdayFee') || 0;

    if (paqueteId && fecha) {
      const paquete = packages.find((p) => Number(p.id) === Number(paqueteId));
      if (paquete) {
        const precio = isWeekend(fecha)
          ? parseFloat(paquete.precio_viernes_domingo)
          : parseFloat(paquete.precio_lunes_jueves);
        
        newTotal += precio;
        addLog(
          `Precio del paquete (${isWeekend(fecha) ? 'fin de semana' : 'entre semana'})`,
          precio
        );

        if (isTuesday(fecha)) {
          newTotal += tuesdayFee;
          addLog('Cargo adicional por martes', tuesdayFee);
        }
      }
    }

    const alimentoValue = getValues('id_opcion_alimento');
    if (alimentoValue?.value) {
      const selectedFood = foodOptions.find(
        (f) => f.id === Number(alimentoValue.value)
      );
      if (selectedFood?.precio_extra) {
        const precioAlimento = parseFloat(selectedFood.precio_extra);
        newTotal += precioAlimento;
        addLog('Precio extra por alimento', precioAlimento);
      }
    }

    const mamparaValue = getValues('id_mampara');
    if (mamparaValue?.value) {
      const selectedMampara = mamparas.find(
        (m) => m.id === Number(mamparaValue.value)
      );
      if (selectedMampara?.precio) {
        const precioMampara = parseFloat(selectedMampara.precio);
        newTotal += precioMampara;
        addLog('Precio de mampara', precioMampara);
      }
    }

    const tematicaValue = getValues('id_tematica');
    if (tematicaValue?.value) {
      const selectedTematica = tematicas.find(
        (t) => t.id === Number(tematicaValue.value)
      );
      if (selectedTematica?.precio) {
        const precioTematica = parseFloat(selectedTematica.precio);
        newTotal += precioTematica;
        addLog('Precio de temática', precioTematica);
      }
    }

    const selectedExtras = getValues('extras') || [];
    let extrasTotal = 0;
    const uniqueExtras = Array.from(new Set(selectedExtras.map((e) => e.id))).map(
      (id) => {
        const extra = selectedExtras.find((e) => e.id === id);
        return extra;
      }
    );

    uniqueExtras.forEach((extra) => {
      const extraInfo = extras.find((e) => Number(e.id) === Number(extra.id));
      if (extraInfo?.precio && extra.cantidad) {
        const extraPrecio =
          parseFloat(extraInfo.precio) * parseInt(extra.cantidad);
        if (!isNaN(extraPrecio)) {
          extrasTotal += extraPrecio;
          addLog(`Extra ${extraInfo.nombre} (${extra.cantidad}x)`, extraPrecio);
        }
      }
    });
    newTotal += extrasTotal;
    addLog('Total de extras', extrasTotal);
    addLog('Total final calculado', newTotal);

    return parseFloat(newTotal).toFixed(2);
  }, [
    getValues,
    packages,
    foodOptions,
    mamparas,
    tematicas,
    extras,
    addLog
  ]);

  // ---------------------------------------------------------------------
  // Efecto para inicializar el formulario en modo edición
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (editingItem) {
      addLog('Inicializando datos de edición');
      
      // Usar la función bidireccional para formatear datos para edición
      const formattedData = formatReservationForEditing(
        editingItem, 
        foodOptions, 
        tematicas, 
        mamparas
      );

      reset(formattedData);
      setTotal(formattedData.total);
      addLog('Datos de edición cargados');

      // También podríamos setear el término de búsqueda si queremos mostrar
      // el nombre en el input directamente:
      const editingUser = users.find(u => u.id === editingItem.id_usuario);
      if (editingUser) {
        setSearchTerm(`${editingUser.nombre} ${editingUser.apellido}`);
      }
    }
  }, [editingItem, reset, addLog, users, foodOptions, tematicas, mamparas]);

  // ---------------------------------------------------------------------
  // Efecto para recalcular el total cuando cambian campos relevantes
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!manualTotal) {
      addLog('Actualizando total automáticamente');
      const newTotal = calculateTotal();
      setTotal(newTotal);
      setValue('total', newTotal);
    }
  }, [watchedFields, manualTotal, calculateTotal, setValue, addLog]);

  // ---------------------------------------------------------------------
  // useMemo para filtrar mamparas según la temática
  // ---------------------------------------------------------------------
  const filteredMamparas = useMemo(() => {
    const selectedTheme = watchedFields[5];
    return selectedTheme
      ? mamparas.filter(
          (m) =>
            Number(m.id_tematica) === Number(selectedTheme.value) && m.activo
        )
      : [];
  }, [watchedFields, mamparas]);

  // ---------------------------------------------------------------------
  // Función para limpiar los datos antes de guardar
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // onSubmit para guardar la reserva
  // ---------------------------------------------------------------------
  const onSubmit = useCallback(
    async (data) => {
      try {
        addLog('Preparando datos para guardar');
        // Ensure extras[] is properly formatted
        const cleanedData = {
          ...data,
          extras: data.extras || []
        };
        
        const formattedData = formatReservationForApi(cleanedData);
        addLog('Datos formateados para guardar');

        try {
          const reservation = await onSave(formattedData);
          addLog('Reserva guardada');

          if (reservation?.id) {
            setSavedReservation(reservation);
            
            // Crear pago pendiente automáticamente
            const paymentData = {
              id_reserva: reservation.id,
              monto: formattedData.total,
              fecha_pago: new Date(),
              metodo_pago: 'pendiente',
              estado: 'pendiente',
            };

            await axiosInstance.post('/api/pagos', paymentData);
            addLog('Entrada de pagos creada como pendiente');
            toast.success('¡Reservación creada exitosamente!');
            onClose();
          }
        } catch (error) {
          console.error('Error al crear el pago:', error);
          // Si falla la creación del pago, eliminamos la reserva para mantener consistencia
          if (savedReservation?.id) {
            await axiosInstance.delete(`/api/reservas/${savedReservation.id}`);
            addLog('Reserva eliminada debido a error en creación de pago');
          }
          throw error;
        }
      } catch (error) {
        console.error('Error al guardar la reserva:', error);
        addLog('Error al guardar la reserva');
        toast.error('Error al crear la reservación');
      }
    },
    [onSave, addLog, onClose]
  );

  // ---------------------------------------------------------------------
  // Efecto para filtrar usuarios según searchTerm
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter((user) => {
        const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
        return (
          fullName.includes(term) ||
          user.id.toString() === term
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // ---------------------------------------------------------------------
  // Manejador para seleccionar un usuario del autocompletado
  // ---------------------------------------------------------------------
  const handleSelectUser = (user) => {
    // Mostramos el nombre del usuario en el input
    setSearchTerm(`${user.nombre} ${user.apellido}`);
    // Guardamos en react-hook-form el ID del usuario
    setValue('id_usuario', user.id);
    // Ocultamos las sugerencias
    setShowUserSuggestions(false);
    // Log de depuración
    addLog(`Usuario seleccionado: ${user.id} - ${user.nombre}`);
  };

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
            {/*
              --------------------------------------------------------------------------------
              Reemplazamos el componente <UserSection> por nuestro buscador de usuarios inline
              --------------------------------------------------------------------------------
            */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>

                {/* Campo de búsqueda */}
                <div className="flex items-center bg-gray-50 rounded-md p-2">
                  <FiSearch className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowUserSuggestions(true);
                    }}
                    className="bg-transparent w-full focus:outline-none"
                  />
                </div>

                {/* Lista de sugerencias */}
                {showUserSuggestions && filteredUsers.length > 0 && (
                  <ul className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md w-full max-h-60 overflow-auto shadow-lg">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.nombre} {user.apellido} (ID: {user.id})
                      </li>
                    ))}
                  </ul>
                )}

                {/* Si hay error en el id_usuario, lo mostramos */}
                {errors.id_usuario && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.id_usuario.message}
                  </p>
                )}
                
                {/* Registramos manualmente el campo id_usuario */}
                <input
                  type="hidden"
                  {...register('id_usuario', { required: 'El usuario es requerido' })}
                />
              </div>
            </div>
            {/*
              --------------------------------------------------------------------------------
              FIN DE SECCIÓN PARA EL BUSCADOR DE USUARIOS
              --------------------------------------------------------------------------------
            */}


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
                getValues={getValues}
                existingReservations={existingReservations.filter(r => r.estado !== 'cancelada')}
                packages={packages}
                showTuesdayModal={showTuesdayModal}
                setShowTuesdayModal={setShowTuesdayModal}
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
                getValues={getValues}
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
              <CelebrantSection control={control} errors={errors} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <GenderSelector control={control} errors={errors} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <CommentsSection control={control} />
            </div>

            {/* SECCIÓN PARA MOSTRAR/MODIFICAR EL TOTAL */}
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
                        addLog('Total actualizado automáticamente');
                      } else {
                        addLog('Modo manual activado');
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-500">
                    Editar manualmente
                  </span>
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
                      addLog('Total actualizado manualmente');
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
                    addLog('Total recalculado');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Calcular
                </button>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Logs de cálculo:
                </h4>
                {calculationLogs.map((log, index) => (
                  <div key={index} className="text-xs text-gray-600 mb-1">
                    {new Date(log.timestamp).toLocaleTimeString()}:{' '}
                    {log.message}
                    {log.data !== null && (
                      <span className="text-indigo-600"> {log.data}</span>
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
              className="px-6 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"
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