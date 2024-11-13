import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import {
  FiUser,
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import CurrencyInput from '../../components/CurrencyInput';
import Select from 'react-select';
import { Switch } from '@headlessui/react';

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
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: editingItem || {},
  });

  const { fields: extraFields, append, remove, update } = useFieldArray({
    control,
    name: 'extras',
  });

  const [manualTotal, setManualTotal] = useState(false);
  const [filteredMamparas, setFilteredMamparas] = useState([]);

  const selectedTematica = watch('id_tematica');
  const watchedFields = useWatch({
    control,
    name: [
      'id_paquete',
      'id_opcion_alimento',
      'id_mampara',
      'extras',
      'id_tematica',
    ],
  });

  const calculateTotal = useCallback(() => {
    let total = 0;
    try {
      // Paquete base
      const paqueteId = getValues('id_paquete');
      if (paqueteId) {
        const paquete = packages.find(
          (p) => Number(p.id) === Number(paqueteId)
        );
        if (paquete?.precio) {
          total += parseFloat(paquete.precio);
        }
      }

      // Opción de alimento
      const alimentoValue = getValues('id_opcion_alimento');
      if (alimentoValue?.data?.precio_extra) {
        total += parseFloat(alimentoValue.data.precio_extra);
      }

      // Mampara
      const mamparaValue = getValues('id_mampara');
      if (mamparaValue?.data?.precio) {
        total += parseFloat(mamparaValue.data.precio);
      }

      // Extras
      const selectedExtras = getValues('extras') || [];
      selectedExtras.forEach((extra) => {
        const extraInfo = extras.find((e) => Number(e.id) === Number(extra.id));
        if (extraInfo?.precio && extra.cantidad) {
          const extraTotal =
            parseFloat(extraInfo.precio) * parseInt(extra.cantidad);
          if (!isNaN(extraTotal)) {
            total += extraTotal;
          }
        }
      });

      return parseFloat(total).toFixed(2);
    } catch (error) {
      console.error('Error calculando total:', error);
      return '0.00';
    }
  }, [getValues, packages, extras]);

  const handleExtraChange = useCallback(
    (extra, checked, cantidad = 1) => {
      const currentExtras = getValues('extras') || [];
      let newExtras;

      if (checked) {
        const existingExtraIndex = currentExtras.findIndex(
          (e) => Number(e.id) === Number(extra.id)
        );
        if (existingExtraIndex >= 0) {
          newExtras = currentExtras.map((e, i) =>
            i === existingExtraIndex
              ? { ...e, cantidad: Number(cantidad) }
              : e
          );
        } else {
          newExtras = [
            ...currentExtras,
            { id: Number(extra.id), cantidad: Number(cantidad) },
          ];
        }
      } else {
        newExtras = currentExtras.filter(
          (e) => Number(e.id) !== Number(extra.id)
        );
      }

      setValue('extras', newExtras, { shouldDirty: true });

      if (!manualTotal) {
        const newTotal = calculateTotal();
        setValue('total', newTotal, { shouldValidate: true });
      }
    },
    [getValues, setValue, manualTotal, calculateTotal]
  );

  const onSubmit = useCallback(
    (data) => {
      console.log('Datos recibidos en onSubmit:', data);
      const formattedData = {
        ...data,
        id_usuario: Number(data.id_usuario),
        id_paquete: Number(data.id_paquete),
        id_opcion_alimento: data.id_opcion_alimento?.value
          ? Number(data.id_opcion_alimento.value)
          : null,
        id_tematica: data.id_tematica?.value
          ? Number(data.id_tematica.value)
          : data.id_tematica || null,
        id_mampara:
          data.id_mampara?.value &&
          filteredMamparas.some((m) => m.id === data.id_mampara.value)
            ? Number(data.id_mampara.value)
            : null,
        total: parseFloat(data.total),
        edad_festejado: Number(data.edad_festejado),
        extras:
          data.extras?.map((extra) => ({
            ...extra,
            id: Number(extra.id),
            cantidad: Number(extra.cantidad),
          })) || [],
        estado: editingItem ? editingItem.estado : 'pendiente',
      };

      if (Object.keys(errors).length > 0) {
        console.error('Errores de validación:', errors);
        return;
      }

      console.log('Datos formateados a enviar:', formattedData);
      onSave(formattedData);
    },
    [filteredMamparas, errors, editingItem, onSave]
  );

  useEffect(() => {
    if (editingItem) {
      console.log('Editando item:', editingItem);

      const selectedFoodOption = foodOptions.find(
        (option) => option.id === editingItem.id_opcion_alimento
      );
      console.log('Opción de alimento seleccionada:', selectedFoodOption);

      const selectedTematica = tematicas.find(
        (t) => t.id === editingItem.id_tematica
      );
      console.log('Temática seleccionada:', selectedTematica);

      const selectedMampara = mamparas.find(
        (m) => m.id === editingItem.id_mampara
      );
      console.log('Mampara seleccionada:', selectedMampara);

      const formattedData = {
        ...editingItem,
        id_opcion_alimento: selectedFoodOption
          ? {
              value: selectedFoodOption.id,
              label: `${selectedFoodOption.nombre} - Adulto: ${selectedFoodOption.platillo_adulto}, Niño: ${selectedFoodOption.platillo_nino} - $${selectedFoodOption.precio_extra}`,
              data: selectedFoodOption,
            }
          : null,
        id_tematica: selectedTematica
          ? {
              value: selectedTematica.id,
              label: selectedTematica.nombre,
              data: selectedTematica,
            }
          : null,
        id_mampara: selectedMampara
          ? {
              value: selectedMampara.id,
              label: `${selectedMampara.piezas} pieza(s) - $${selectedMampara.precio}`,
              data: selectedMampara,
            }
          : null,
        total: editingItem.total || '0.00',
      };

      reset(formattedData);

      // Cargar extras en el field array
      if (Array.isArray(editingItem.extras)) {
        // Limpiar los extras actuales
        extraFields.forEach((field, index) => {
          remove(index);
        });
        // Agregar los extras del elemento en edición
        editingItem.extras.forEach((extra) => {
          append({
            id: Number(extra.id),
            cantidad: Number(extra.cantidad),
          });
        });
      }
    }
  }, [
    editingItem,
    reset,
    foodOptions,
    tematicas,
    mamparas,
    append,
    remove,
    extraFields,
  ]);

  useEffect(() => {
    console.log('Cambió la temática seleccionada:', selectedTematica);

    let selectedTematicaId;
    if (typeof selectedTematica === 'object' && selectedTematica !== null) {
      selectedTematicaId = selectedTematica.value || selectedTematica.id;
    } else {
      selectedTematicaId = selectedTematica;
    }

    console.log('ID de temática seleccionada:', selectedTematicaId);

    if (selectedTematicaId) {
      const filtered = mamparas.filter(
        (m) =>
          Number(m.id_tematica) === Number(selectedTematicaId) && m.activo
      );

      console.log('Mamparas filtradas:', filtered);
      setFilteredMamparas(filtered);

      const currentMampara = getValues('id_mampara');
      console.log('Mampara actual:', currentMampara);

      if (
        currentMampara &&
        !filtered.some((m) => m.id === currentMampara.value)
      ) {
        console.log('Reseteando mampara porque ya no es válida');
        setValue('id_mampara', null);
      }
    } else {
      console.log('No hay temática seleccionada, limpiando mamparas');
      setFilteredMamparas([]);
      setValue('id_mampara', null);
    }
  }, [selectedTematica, mamparas, getValues, setValue]);

  useEffect(() => {
    if (!manualTotal) {
      const newTotal = calculateTotal();
      console.log('Nuevo total calculado:', newTotal);
      setValue('total', newTotal, { shouldValidate: true });
    } else {
      console.log('El total se está ingresando manualmente, no se recalcula');
    }
  }, [watchedFields, manualTotal, setValue, calculateTotal]);

  return (
    <form
      id={activeTab + 'Form'}
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-8'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Usuario */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Usuario
          </label>
          <div className='relative'>
            <FiUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('id_usuario', {
                required: 'Este campo es requerido',
              })}
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value=''>Seleccionar usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>
          {errors.id_usuario && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.id_usuario.message}
            </p>
          )}
        </div>
        {/* Paquete */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Paquete
          </label>
          <div className='relative'>
            <FiPackage className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('id_paquete', {
                required: 'Este campo es requerido',
              })}
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value=''>Seleccionar paquete</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.nombre}
                </option>
              ))}
            </select>
          </div>
          {errors.id_paquete && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.id_paquete.message}
            </p>
          )}
        </div>
        {/* Fecha de Reserva */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Fecha de Reserva
          </label>
          <div className='relative'>
            <FiCalendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='date'
              {...register('fecha_reserva', {
                required: 'Este campo es requerido',
              })}
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          {errors.fecha_reserva && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.fecha_reserva.message}
            </p>
          )}
        </div>
        {/* Hora de Inicio */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Hora de Inicio
          </label>
          <div className='relative'>
            <FiClock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('hora_inicio', {
                required: 'Este campo es requerido',
              })}
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value=''>Seleccionar hora</option>
              <option value='mañana'>Mañana</option>
              <option value='tarde'>Tarde</option>
            </select>
          </div>
          {errors.hora_inicio && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.hora_inicio.message}
            </p>
          )}
        </div>
        {/* Opción de Alimento */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Opción de Alimento
          </label>
          <Controller
            name='id_opcion_alimento'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={foodOptions.map((option) => ({
                  value: option.id,
                  label: `${option.nombre} - Adulto: ${option.platillo_adulto}, Niño: ${option.platillo_nino} - $${option.precio_extra}`,
                  data: option,
                }))}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  if (!manualTotal) {
                    const newTotal = calculateTotal();
                    setValue('total', newTotal);
                  }
                }}
                placeholder='Seleccionar opción de alimento'
                className='react-select-container'
                classNamePrefix='react-select'
              />
            )}
          />
          {errors.id_opcion_alimento && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.id_opcion_alimento.message}
            </p>
          )}
        </div>
        {/* Temática */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Temática
          </label>
          <Controller
            name='id_tematica'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={tematicas.map((t) => ({
                  value: t.id,
                  label: t.nombre,
                  data: t,
                }))}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  setValue('id_mampara', null);
                }}
                placeholder='Seleccionar temática'
                className='react-select-container'
                classNamePrefix='react-select'
              />
            )}
          />
          {errors.id_tematica && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.id_tematica.message}
            </p>
          )}
        </div>
        {/* Mampara */}
        {selectedTematica && filteredMamparas.length > 0 && (
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Mampara
            </label>
            <Controller
              name='id_mampara'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={filteredMamparas.map((m) => ({
                    value: m.id,
                    label: `${m.piezas} pieza(s) - $${m.precio}`,
                    data: m,
                  }))}
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption);
                    if (!manualTotal) {
                      const newTotal = calculateTotal();
                      setValue('total', newTotal);
                    }
                  }}
                  placeholder='Seleccionar mampara'
                  className='react-select-container'
                  classNamePrefix='react-select'
                  isClearable
                />
              )}
            />
          </div>
        )}
        {/* Nombre del Festejado */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Nombre del Festejado
          </label>
          <div className='relative'>
            <FiUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              {...register('nombre_festejado', {
                required: 'Este campo es requerido',
              })}
              type='text'
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='Nombre del festejado'
            />
          </div>
          {errors.nombre_festejado && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.nombre_festejado.message}
            </p>
          )}
        </div>

        {/* Edad del Festejado */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Edad del Festejado
          </label>
          <input
            {...register('edad_festejado', {
              required: 'Este campo es requerido',
              min: {
                value: 1,
                message: 'La edad debe ser mayor a 0',
              },
              max: {
                value: 100,
                message: 'La edad debe ser menor a 100',
              },
            })}
            type='number'
            className='w-full px-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Edad del festejado'
          />
          {errors.edad_festejado && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.edad_festejado.message}
            </p>
          )}
        </div>

        {/* Total */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Total
          </label>
          <Controller
            name='total'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <CurrencyInput
                {...field}
                className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                readOnly={!manualTotal}
                icon={FiDollarSign}
              />
            )}
          />
          <label className='flex items-center mt-2'>
            <input
              type='checkbox'
              checked={manualTotal}
              onChange={(e) => {
                setManualTotal(e.target.checked);
                if (!e.target.checked) {
                  const newTotal = calculateTotal();
                  setValue('total', newTotal, { shouldValidate: true });
                }
              }}
              className='form-checkbox h-5 w-5 text-indigo-600'
            />
            <span className='ml-2 text-sm text-gray-700'>
              Ingresar total manualmente
            </span>
          </label>
        </div>

        {/* Extras */}
        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Extras
          </label>
          <div className='space-y-4'>
            {extras.map((extra) => {
              const fieldIndex = extraFields.findIndex(
                (e) => Number(e.id) === Number(extra.id)
              );
              const isChecked = fieldIndex !== -1;
              const extraCantidad =
                isChecked && extraFields[fieldIndex]?.cantidad
                  ? extraFields[fieldIndex].cantidad
                  : 1;

              return (
                <div
                  key={extra.id}
                  className='flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm'
                >
                  <div className='flex items-center'>
                    <Switch
                      checked={isChecked}
                      onChange={(checked) => {
                        if (checked) {
                          append({
                            id: Number(extra.id),
                            cantidad: Number(extraCantidad),
                          });
                        } else {
                          remove(fieldIndex);
                        }
                        if (!manualTotal) {
                          const newTotal = calculateTotal();
                          setValue('total', newTotal, { shouldValidate: true });
                        }
                      }}
                      className={`${
                        isChecked ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      <span className='sr-only'>Habilitar/Deshabilitar</span>
                      <span
                        className={`${
                          isChecked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                      />
                    </Switch>
                    <span className='ml-3 text-sm font-medium text-gray-900'>
                      {extra.nombre} - ${extra.precio}
                    </span>
                  </div>
                  {isChecked && (
                    <div className='flex items-center space-x-2'>
                      <button
                        type='button'
                        onClick={() => {
                          const newCantidad = Math.max(1, extraCantidad - 1);
                          update(fieldIndex, {
                            id: Number(extra.id),
                            cantidad: newCantidad,
                          });
                          if (!manualTotal) {
                            const newTotal = calculateTotal();
                            setValue('total', newTotal, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        className='text-gray-500 hover:text-gray-600 focus:outline-none'
                      >
                        <FiMinus />
                      </button>
                      <input
                        type='number'
                        value={extraCantidad}
                        onChange={(e) => {
                          const newCantidad = parseInt(e.target.value) || 1;
                          update(fieldIndex, {
                            id: Number(extra.id),
                            cantidad: newCantidad,
                          });
                          if (!manualTotal) {
                            const newTotal = calculateTotal();
                            setValue('total', newTotal, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        className='w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
                        min='1'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          const newCantidad = extraCantidad + 1;
                          update(fieldIndex, {
                            id: Number(extra.id),
                            cantidad: newCantidad,
                          });
                          if (!manualTotal) {
                            const newTotal = calculateTotal();
                            setValue('total', newTotal, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        className='text-gray-500 hover:text-gray-600 focus:outline-none'
                      >
                        <FiPlus />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comentarios Adicionales */}
        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Comentarios Adicionales
          </label>
          <div className='relative'>
            <FiMessageSquare className='absolute left-3 top-3 text-gray-400' />
            <textarea
              {...register('comentarios')}
              className='w-full pl-10 pr-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              rows='3'
              placeholder='Comentarios adicionales'
            ></textarea>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ReservationForm;
