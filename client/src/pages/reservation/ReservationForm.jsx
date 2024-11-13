import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiImage,
  FiMessageSquare,
  FiPlus,
  FiMinus,
  FiAlertCircle,
  FiInfo,
  FiCheck
} from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { Switch } from '@headlessui/react'
import 'react-datepicker/dist/react-datepicker.css'

const ReservationForm = ({
  onSubmit,
  register,
  control,
  errors,
  watch,
  setValue,
  packages,
  foodOptions,
  tematicas,
  mamparas,
  extras,
  unavailableDates,
  existingReservations,
  isTuesdayModalOpen,
  setIsTuesdayModalOpen
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState({})
  const [filteredMamparas, setFilteredMamparas] = useState([])
  const watchedFields = watch()

  const checkAvailability = async (date, timeSlot) => {
    if (!date || !timeSlot) return true;
    
    try {
      const isAvailable = await checkDateAvailability(date, timeSlot);
      
      if (!isAvailable) {
        toast.warning('Este horario ya no está disponible');
        setValue('hora_inicio', '');
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
  };

  // Estilos personalizados para react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      paddingLeft: '2.5rem',
      borderColor: state.isFocused ? '#6366F1' : '#E5E7EB',
      boxShadow: state.isFocused ? '0 0 0 1px #6366F1' : 'none',
      '&:hover': {
        borderColor: '#6366F1'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#6366F1'
        : state.isFocused
        ? '#E0E7FF'
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#6366F1' : '#E0E7FF'
      }
    })
  }

  // Formateo de moneda
  const formatCurrency = amount => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  // Verificar horarios disponibles
  const checkAvailableTimeSlots = date => {
    if (!date) return { morning: true, afternoon: true }

    const dateStr = date.toISOString().split('T')[0]
    const reservationsForDate = existingReservations.filter(
      res => res.fecha_reserva.split('T')[0] === dateStr
    )

    return {
      morning: !reservationsForDate.some(res => res.hora_inicio === 'mañana'),
      afternoon: !reservationsForDate.some(res => res.hora_inicio === 'tarde')
    }
  }

  // Obtener opciones de horario disponibles
  const getTimeOptions = date => {
    if (!date) return []

    const slots = checkAvailableTimeSlots(date)
    const options = []

    if (slots.morning) {
      options.push({
        value: 'mañana',
        label: 'Matutino (9:00 - 14:00)'
      })
    }
    if (slots.afternoon) {
      options.push({
        value: 'tarde',
        label: 'Vespertino (15:00 - 20:00)'
      })
    }

    return options
  }

  // Verificar si una fecha está completamente ocupada
  const isDateFullyBooked = date => {
    const slots = checkAvailableTimeSlots(date)
    return !slots.morning && !slots.afternoon
  }

  useEffect(() => {
    // Actualizar mamparas filtradas cuando cambia la temática
    const filtered = mamparas.filter(
      m => m.id_tematica === watchedFields.id_tematica
    )
    setFilteredMamparas(filtered)

    // Actualizar horarios disponibles cuando cambia la fecha
    if (watchedFields.fecha_reserva) {
      const slots = checkAvailableTimeSlots(watchedFields.fecha_reserva)
      setAvailableTimeSlots(slots)

      // Verificar si el horario seleccionado sigue disponible
      if (watchedFields.hora_inicio) {
        const isCurrentTimeSlotAvailable =
          (watchedFields.hora_inicio === 'mañana' && slots.morning) ||
          (watchedFields.hora_inicio === 'tarde' && slots.afternoon)

        if (!isCurrentTimeSlotAvailable) {
          setValue('hora_inicio', null)
        }
      }
    }
  }, [
    watchedFields.id_tematica,
    watchedFields.fecha_reserva,
    mamparas,
    existingReservations
  ])

  // Componente de sección reutilizable
  const FormSection = ({ title, children, icon: Icon }) => (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300'>
      <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
        {Icon && <Icon className='w-5 h-5 text-indigo-600' />}
        {title}
      </h3>
      {children}
    </div>
  )

  // Configuración personalizada para los campos de texto


  return (
    <form onSubmit={onSubmit} className='space-y-8'>
      {/* Sección de Paquete */}
      <FormSection title='Información del Paquete' icon={FiPackage}>
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Selecciona tu Paquete
            </label>
            <div className='relative'>
              <Controller
                name='id_paquete'
                control={control}
                rules={{ required: 'Paquete es requerido' }}
                render={({ field }) => {
                  const options = packages.map(pkg => ({
                    value: pkg.id,
                    label: `${pkg.nombre} - L-J: ${formatCurrency(
                      pkg.precio_lunes_jueves
                    )} | V-D: ${formatCurrency(pkg.precio_viernes_domingo)}`
                  }))
                  const selectedOption = options.find(
                    option => option.value === field.value
                  )

                  return (
                    <Select
                      options={options}
                      value={selectedOption}
                      onChange={option => field.onChange(option.value)}
                      placeholder='Seleccionar paquete'
                      className='react-select-container'
                      classNamePrefix='react-select'
                      styles={customSelectStyles}
                    />
                  )
                }}
              />
              {errors.id_paquete && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <FiAlertCircle className='w-4 h-4' />
                  {errors.id_paquete.message}
                </p>
              )}
            </div>
          </div>

          {/* Fecha y Horario */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Fecha de Reserva
              </label>
              <div className='relative'>
                <Controller
                  control={control}
                  name='fecha_reserva'
                  rules={{ required: 'Fecha de reserva es requerida' }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={date => {
                        field.onChange(date)
                        if (date) {
                          // Manejar cargo por martes
                          if (date.getDay() === 2) {
                            setValue('tuesdayFee', 1500)
                            setIsTuesdayModalOpen(true)
                          } else {
                            setValue('tuesdayFee', 0)
                          }

                          // Actualizar precio según día
                          const selectedPackageId = watchedFields.id_paquete
                          if (selectedPackageId) {
                            const selectedPackage = packages.find(
                              pkg => pkg.id === selectedPackageId
                            )
                            const dayOfWeek = date.getDay()
                            const newPrice =
                              dayOfWeek >= 1 && dayOfWeek <= 4
                                ? selectedPackage.precio_lunes_jueves
                                : selectedPackage.precio_viernes_domingo
                            setValue('packagePrice', parseFloat(newPrice))
                          }
                        }
                      }}
                      filterDate={date => !isDateFullyBooked(date)}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                      placeholderText='Seleccionar fecha'
                      dateFormat='dd/MM/yyyy'
                      minDate={new Date()}
                      excludeDates={unavailableDates}
                      showPopperArrow={true}
                    />
                  )}
                />
                {errors.fecha_reserva && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <FiAlertCircle className='w-4 h-4' />
                    {errors.fecha_reserva.message}
                  </p>
                )}
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiCalendar className='h-5 w-5 text-gray-400' />
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Horario Disponible
              </label>
              <div className='relative'>
                <Controller
                  name='hora_inicio'
                  control={control}
                  rules={{ required: 'Horario es requerido' }}
                  render={({ field }) => {
                    const timeOptions = getTimeOptions(
                      watchedFields.fecha_reserva
                    )
                    const selectedOption = timeOptions.find(
                      option => option.value === field.value
                    )

                    return (
                      <div>
                        <Select
                          options={timeOptions}
                          value={selectedOption}
                          onChange={option => field.onChange(option.value)}
                          isDisabled={!watchedFields.fecha_reserva}
                          placeholder={
                            !watchedFields.fecha_reserva
                              ? 'Primero selecciona una fecha'
                              : timeOptions.length === 0
                              ? 'No hay horarios disponibles'
                              : 'Selecciona un horario'
                          }
                          className='react-select-container'
                          classNamePrefix='react-select'
                          styles={customSelectStyles}
                        />
                        {watchedFields.fecha_reserva &&
                          timeOptions.length === 1 && (
                            <div className='mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md flex items-center gap-2'>
                              <FiInfo className='w-4 h-4' />
                              <span>
                                Solo queda disponible este horario para la fecha
                                seleccionada
                              </span>
                            </div>
                          )}
                      </div>
                    )
                  }}
                />
                {errors.hora_inicio && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <FiAlertCircle className='w-4 h-4' />
                    {errors.hora_inicio.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </FormSection>

     {/* Sección de Información del Festejado */}
<FormSection title='Información del Festejado' icon={FiUser}>
  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        Nombre del Festejado *
      </label>
      <div className='relative'>
        <Controller
          name='nombre_festejado'
          control={control}
          rules={{
            required: 'Nombre del festejado es requerido',
            minLength: {
              value: 3,
              message: 'El nombre debe tener al menos 3 caracteres'
            }
          }}
          render={({ field: { onChange, value, ref } }) => (
            <input
            type='text'
            defaultValue={value || ''}
            onChange={onChange}
            ref={ref}
            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            placeholder='Nombre completo'
          />
          )}
        />
        {errors.nombre_festejado && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <FiAlertCircle className='w-4 h-4' />
            {errors.nombre_festejado.message}
          </p>
        )}
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <FiUser className='h-5 w-5 text-gray-400' />
        </div>
      </div>
    </div>

    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        Edad del Festejado *
      </label>
      <div className='relative'>
        <Controller
          name='edad_festejado'
          control={control}
          rules={{
            required: 'Edad del festejado es requerida',
            min: {
              value: 1,
              message: 'La edad debe ser mayor a 0'
            },
            max: {
              value: 100,
              message: 'La edad no puede ser mayor a 100'
            }
          }}
          render={({ field: { onChange, value, ref } }) => (
            <input
              type='text'
              value={value || ''}
              onChange={(e) => {
                const newValue = e.target.value.replace(/[^0-9]/g, '')
                if (!newValue || (parseInt(newValue) >= 0 && parseInt(newValue) <= 100)) {
                  onChange(newValue ? parseInt(newValue) : '')
                }
              }}
              ref={ref}
              className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Edad'
            />
          )}
        />
        {errors.edad_festejado && (
          <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
            <FiAlertCircle className='w-4 h-4' />
            {errors.edad_festejado.message}
          </p>
        )}
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <FiUser className='h-5 w-5 text-gray-400' />
        </div>
      </div>
    </div>
  </div>
</FormSection>
      {/* Sección de Alimentos */}
      <FormSection title='Opción de Alimentos' icon={FiDollarSign}>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Selección de Menú
          </label>
          <div className='relative'>
            <Controller
              name='id_opcion_alimento'
              control={control}
              rules={{ required: 'Opción de alimento es requerida' }}
              render={({ field }) => {
                const options = foodOptions.map(option => ({
                  value: option.id,
                  label: `${option.nombre} - Adultos: ${
                    option.platillo_adulto
                  } | Niños: ${option.platillo_nino} - ${formatCurrency(
                    option.precio_extra
                  )}`,
                  description: `${option.descripcion || ''}`
                }))
                const selectedOption = options.find(
                  option => option.value === field.value
                )

                return (
                  <div className='space-y-2'>
                    <Select
                      options={options}
                      value={selectedOption}
                      onChange={option => field.onChange(option.value)}
                      placeholder='Seleccionar menú'
                      className='react-select-container'
                      classNamePrefix='react-select'
                      styles={customSelectStyles}
                    />
                    {selectedOption && selectedOption.description && (
                      <div className='text-sm text-gray-600 bg-gray-50 p-2 rounded-md'>
                        {selectedOption.description}
                      </div>
                    )}
                  </div>
                )
              }}
            />
            {errors.id_opcion_alimento && (
              <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                <FiAlertCircle className='w-4 h-4' />
                {errors.id_opcion_alimento.message}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      {/* Sección de Temática y Mampara */}
      <FormSection title='Decoración y Temática' icon={FiImage}>
        <div className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Temática
            </label>
            <div className='relative'>
              <Controller
                name='id_tematica'
                control={control}
                rules={{ required: 'Temática es requerida' }}
                render={({ field }) => {
                  const options = tematicas.map(t => ({
                    value: t.id,
                    label: t.nombre,
                    description: t.descripcion
                  }))
                  const selectedOption = options.find(
                    option => option.value === field.value
                  )

                  return (
                    <div className='space-y-2'>
                      <Select
                        options={options}
                        value={selectedOption}
                        onChange={option => {
                          field.onChange(option.value)
                          setValue('id_mampara', null)
                        }}
                        placeholder='Seleccionar temática'
                        className='react-select-container'
                        classNamePrefix='react-select'
                        styles={customSelectStyles}
                      />
                      {selectedOption && selectedOption.description && (
                        <div className='text-sm text-gray-600 bg-gray-50 p-2 rounded-md'>
                          {selectedOption.description}
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              {errors.id_tematica && (
                <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                  <FiAlertCircle className='w-4 h-4' />
                  {errors.id_tematica.message}
                </p>
              )}
            </div>
          </div>

          {/* Mampara (visible solo cuando hay temática seleccionada) */}
          {watchedFields.id_tematica && (
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mampara
              </label>
              <div className='relative'>
                {filteredMamparas.length > 0 ? (
                  <Controller
                    name='id_mampara'
                    control={control}
                    rules={{ required: 'Mampara es requerida' }}
                    render={({ field }) => {
                      const options = filteredMamparas.map(m => ({
                        value: m.id,
                        label: `${m.nombre} - ${
                          m.piezas
                        } piezas - ${formatCurrency(m.precio)}`,
                        description: m.descripcion
                      }))
                      const selectedOption = options.find(
                        option => option.value === field.value
                      )

                      return (
                        <div className='space-y-2'>
                          <Select
                            options={options}
                            value={selectedOption}
                            onChange={option => field.onChange(option.value)}
                            placeholder='Seleccionar mampara'
                            className='react-select-container'
                            classNamePrefix='react-select'
                            styles={customSelectStyles}
                          />
                          {selectedOption && selectedOption.description && (
                            <div className='text-sm text-gray-600 bg-gray-50 p-2 rounded-md'>
                              {selectedOption.description}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                ) : (
                  <div className='text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-center gap-2'>
                    <FiInfo className='w-5 h-5' />
                    <span>No hay mamparas disponibles para esta temática.</span>
                  </div>
                )}
                {errors.id_mampara && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <FiAlertCircle className='w-4 h-4' />
                    {errors.id_mampara.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Sección de Extras */}
      <FormSection title='Servicios Adicionales' icon={FiPlus}>
        <div className='space-y-4'>
          {extras.map((extra, index) => {
            const isChecked = watchedFields.extras?.some(e => e.id === extra.id)
            const extraIndex = watchedFields.extras?.findIndex(
              e => e.id === extra.id
            )

            return (
              <div
                key={extra.id}
                className='group bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-all duration-200 shadow-sm hover:shadow'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <Switch
                      checked={isChecked}
                      onChange={checked => {
                        const currentExtras = watchedFields.extras || []
                        if (checked) {
                          setValue('extras', [
                            ...currentExtras,
                            { id: extra.id, cantidad: 1 }
                          ])
                        } else {
                          setValue(
                            'extras',
                            currentExtras.filter(e => e.id !== extra.id)
                          )
                        }
                      }}
                      className={`${
                        isChecked ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span className='sr-only'>Activar extra</span>
                      <span
                        className={`${
                          isChecked ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {extra.nombre}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {formatCurrency(extra.precio)} por unidad
                      </p>
                      {extra.descripcion && (
                        <p className='text-sm text-gray-500 mt-1'>
                          {extra.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {isChecked && extraIndex >= 0 && (
                    <div className='flex items-center space-x-3'>
                      <button
                        type='button'
                        onClick={() => {
                          const currentValue =
                            watchedFields.extras[extraIndex].cantidad || 1
                          if (currentValue > 1) {
                            const newExtras = [...watchedFields.extras]
                            newExtras[extraIndex].cantidad = currentValue - 1
                            setValue('extras', newExtras)
                          }
                        }}
                        className='p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors'
                        disabled={
                          watchedFields.extras[extraIndex].cantidad <= 1
                        }
                      >
                        <FiMinus className='w-4 h-4' />
                      </button>

                      <input
                        type='number'
                        value={watchedFields.extras[extraIndex].cantidad}
                        onChange={e => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          const newValue = value ? parseInt(value) : 1
                          const newExtras = [...watchedFields.extras]
                          newExtras[extraIndex].cantidad = newValue
                          setValue('extras', newExtras)
                        }}
                        className='w-16 text-center border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                        min='1'
                      />

                      <button
                        type='button'
                        onClick={() => {
                          const currentValue =
                            watchedFields.extras[extraIndex].cantidad || 1
                          const newExtras = [...watchedFields.extras]
                          newExtras[extraIndex].cantidad = currentValue + 1
                          setValue('extras', newExtras)
                        }}
                        className='p-1 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors'
                      >
                        <FiPlus className='w-4 h-4' />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </FormSection>

      {/* Sección de Comentarios */}
      <FormSection title='Comentarios Adicionales' icon={FiMessageSquare}>
  <div>
    <div className='relative'>
      <Controller
        name='comentarios'
        control={control}
        defaultValue=''
        render={({ field: { onChange, value, ref } }) => (
          <textarea
            rows='3'
            value={value || ''}
            onChange={onChange}
            ref={ref}
            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-y'
            placeholder='¿Tienes algún requerimiento especial o comentario adicional para tu reserva?'
          />
        )}
      />
      <div className='absolute top-3 left-3'>
        <FiMessageSquare className='h-5 w-5 text-gray-400' />
      </div>
    </div>
  </div>
</FormSection>

   {/* Botón de envío */}
   <div className='flex justify-end mt-8'>
        <button
          type='submit'
          className='px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm'
        >
          <FiCheck className='w-5 h-5' />
          Crear Reserva
        </button>
      </div>

      {/* Información Adicional y Políticas */}
      <div className='mt-8 space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200'>
        <h4 className='font-medium text-gray-900 flex items-center gap-2'>
          <FiInfo className='w-5 h-5 text-indigo-600' />
          Información Importante
        </h4>

        {/* Resumen de horarios */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div className='bg-white p-3 rounded-md border border-gray-200'>
            <h5 className='font-medium text-gray-800 mb-2'>Horario Matutino</h5>
            <p className='text-gray-600'>9:00 AM - 2:00 PM</p>
          </div>
          <div className='bg-white p-3 rounded-md border border-gray-200'>
            <h5 className='font-medium text-gray-800 mb-2'>
              Horario Vespertino
            </h5>
            <p className='text-gray-600'>3:00 PM - 8:00 PM</p>
          </div>
        </div>

        {/* Recordatorios y políticas */}
        <div className='space-y-2 text-sm text-gray-600'>
          <p className='flex items-center gap-2'>
            <FiCheck className='w-4 h-4 text-green-500' />
            Los precios varían según el día de la semana (L-J o V-D).
          </p>
          <p className='flex items-center gap-2'>
            <FiCheck className='w-4 h-4 text-green-500' />
            Las reservas de los martes tienen un cargo adicional de $1,500.
          </p>
          <p className='flex items-center gap-2'>
            <FiCheck className='w-4 h-4 text-green-500' />
            Los horarios están sujetos a disponibilidad.
          </p>
          <p className='flex items-center gap-2'>
            <FiCheck className='w-4 h-4 text-green-500' />
            Se requiere confirmar la reserva con el pago correspondiente.
          </p>
        </div>

        {/* Condiciones específicas según selección */}
        {watchedFields.fecha_reserva && (
          <div className='bg-indigo-50 p-3 rounded-md border border-indigo-100'>
            <h5 className='font-medium text-indigo-800 mb-2'>
              Detalles de tu Fecha
            </h5>
            <div className='space-y-1 text-sm'>
              <p className='text-indigo-600'>
                {new Date(watchedFields.fecha_reserva).toLocaleDateString(
                  'es-MX',
                  {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }
                )}
              </p>
              {watchedFields.fecha_reserva.getDay() === 2 && (
                <p className='text-amber-600 flex items-center gap-2'>
                  <FiInfo className='w-4 h-4' />
                  Aplica cargo adicional por ser martes
                </p>
              )}
              <p className='text-indigo-600'>
                Tarifa:{' '}
                {watchedFields.fecha_reserva.getDay() >= 1 &&
                watchedFields.fecha_reserva.getDay() <= 4
                  ? 'Lunes a Jueves'
                  : 'Viernes a Domingo'}
              </p>
            </div>
          </div>
        )}

        {/* Indicador de campos requeridos */}
        <div className='text-sm text-gray-500 flex items-center gap-2'>
          <FiInfo className='w-4 h-4' />
          Los campos marcados con * son obligatorios
        </div>
      </div>

      {/* Resumen de Costos (si se requiere) */}
      {watchedFields.id_paquete && watchedFields.fecha_reserva && (
        <div className='mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
          <h4 className='font-medium text-gray-900 flex items-center gap-2 mb-4'>
            <FiDollarSign className='w-5 h-5 text-indigo-600' />
            Resumen de Costos
          </h4>
          <div className='space-y-2'>
            <div className='flex justify-between items-center py-2 border-b border-gray-100'>
              <span className='text-gray-600'>Paquete Base</span>
              <span className='font-medium'>
                {formatCurrency(watchedFields.packagePrice || 0)}
              </span>
            </div>
            {watchedFields.fecha_reserva?.getDay() === 2 && (
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Cargo por Martes</span>
                <span className='font-medium text-amber-600'>
                  {formatCurrency(1500)}
                </span>
              </div>
            )}
            {watchedFields.id_opcion_alimento && (
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Opción de Alimentos</span>
                <span className='font-medium'>
                  {formatCurrency(
                    foodOptions.find(
                      opt => opt.id === watchedFields.id_opcion_alimento
                    )?.precio_extra || 0
                  )}
                </span>
              </div>
            )}
            {watchedFields.id_mampara && (
              <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                <span className='text-gray-600'>Mampara</span>
                <span className='font-medium'>
                  {formatCurrency(
                    mamparas.find(m => m.id === watchedFields.id_mampara)
                      ?.precio || 0
                  )}
                </span>
              </div>
            )}
            {watchedFields.extras && watchedFields.extras.length > 0 && (
              <>
                <div className='text-sm font-medium text-gray-700 mt-4 mb-2'>
                  Servicios Adicionales
                </div>
                {watchedFields.extras.map(extra => {
                  const extraInfo = extras.find(e => e.id === extra.id)
                  if (!extraInfo) return null
                  return (
                    <div
                      key={extra.id}
                      className='flex justify-between items-center py-2 border-b border-gray-100'
                    >
                      <span className='text-gray-600'>
                        {extraInfo.nombre} x {extra.cantidad}
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(extraInfo.precio * extra.cantidad)}
                      </span>
                    </div>
                  )
                })}
              </>
            )}
            <div className='flex justify-between items-center pt-4 text-lg font-medium'>
              <span>Total Estimado</span>
              <span className='text-indigo-600'>
                {formatCurrency(
                  (watchedFields.packagePrice || 0) +
                    (watchedFields.fecha_reserva?.getDay() === 2 ? 1500 : 0) +
                    (foodOptions.find(
                      opt => opt.id === watchedFields.id_opcion_alimento
                    )?.precio_extra || 0) +
                    (mamparas.find(m => m.id === watchedFields.id_mampara)
                      ?.precio || 0) +
                    (watchedFields.extras?.reduce((acc, extra) => {
                      const extraInfo = extras.find(e => e.id === extra.id)
                      return (
                        acc + (extraInfo?.precio || 0) * (extra.cantidad || 1)
                      )
                    }, 0) || 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal para información de cargo por martes */}
      {isTuesdayModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-md w-full mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Información de Cargo Adicional
            </h3>
            <p className='text-gray-600 mb-4'>
              Has seleccionado un martes para tu reserva. Los martes tienen un
              cargo adicional de {formatCurrency(1500)} que será agregado al
              total de tu reserva.
            </p>
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={() => setIsTuesdayModalOpen(false)}
                className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container para notificaciones */}
      <div className='fixed bottom-4 right-4 z-50' />
    </form>
  )
}

export default ReservationForm