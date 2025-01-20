import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiTag,
  FiPackage,
  FiUpload,
  FiFile,
  FiPlus,
  FiMinus,
  FiX,
  FiInfo,
  FiSearch
} from 'react-icons/fi'
import { TwitterPicker } from 'react-color'
import CurrencyInput from '../../components/CurrencyInput'

const FinanceForm = ({
  editingItem,
  onSave,
  categories,
  onAddCategory,
  reservations = [],
  activeTab
}) => {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: editingItem || {
      fecha: new Date().toISOString().split('T')[0] // Establece la fecha de hoy por defecto
    }
  })

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categoryColor, setCategoryColor] = useState('#FF6900')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReservations, setFilteredReservations] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

  // ----------------------------------------------------------------------
  // Si el formulario está en edición, establecemos la reserva inicial (si la hay)
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (editingItem && editingItem.id_reserva) {
      const found = reservations.find(r => r.id === editingItem.id_reserva)
      if (found) {
        setSelectedReservation(found)
      }
    }
  }, [editingItem, reservations])

  // ----------------------------------------------------------------------
  // Al escribir en el buscador, filtramos las reservas
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReservations([])
      return
    }
    const term = searchTerm.toLowerCase()
    const filtered = reservations.filter(res => {
      const festejado = res.nombre_festejado?.toLowerCase() || ''
      const idString = String(res.id)
      return festejado.includes(term) || idString === term
    })
    setFilteredReservations(filtered)
  }, [searchTerm, reservations])

  // ----------------------------------------------------------------------
  // Manejador de selección de reserva en la lista de sugerencias
  // ----------------------------------------------------------------------
  const handleSelectReservation = (res) => {
    setSelectedReservation(res)
    // Asignamos el id de la reserva al form
    setValue('id_reserva', res.id)
    // Limpiamos el buscador y cerramos las sugerencias
    setSearchTerm('')
    setShowSuggestions(false)
  }

  // ----------------------------------------------------------------------
  // Manejador para quitar la reserva seleccionada
  // ----------------------------------------------------------------------
  const handleRemoveReservation = () => {
    setSelectedReservation(null)
    setValue('id_reserva', '')
  }

  const onSubmit = data => {
    // Enviamos los datos con la reserva seleccionada (o null si no hay)
      onSave({
        ...data,
        id_categoria: data.id_categoria,
        // data.id_reserva ya se setea en handleSelectReservation o se limpia en handleRemoveReservation
        id_reserva: data.id_reserva || null
      })
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.find(cat => cat.nombre === newCategory)) {
      onAddCategory({ nombre: newCategory, color: categoryColor || '#000000' })
      setNewCategory('')
      setShowNewCategoryInput(false)
    }
  }

  return (
    <form
      id={activeTab + 'Form'}
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto px-2'
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        {/* Tipo */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Tipo
          </label>
          <div className='relative'>
            <FiDollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('tipo', { required: 'Este campo es requerido' })}
              className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
            >
              <option value=''>Seleccionar tipo</option>
              <option value='ingreso'>Ingreso</option>
              <option value='gasto'>Gasto</option>
            </select>
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Monto
          </label>
          <Controller
            name='monto'
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <CurrencyInput
                {...field}
                className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
                placeholder='Monto'
                icon={FiDollarSign}
              />
            )}
          />
        </div>

        {/* Fecha */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Fecha
          </label>
          <div className='relative'>
            <FiCalendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='date'
              {...register('fecha', { required: 'Este campo es requerido' })}
              className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Categoría
          </label>
          <div className='relative flex items-center'>
            <FiTag className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('id_categoria', {
                required: 'Este campo es requerido'
              })}
              className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
            >
              <option value=''>Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <button
              type='button'
              onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
              className='ml-2 p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              {showNewCategoryInput ? <FiMinus /> : <FiPlus />}
            </button>
          </div>
        </div>
      </div>

      {showNewCategoryInput && (
        <div className='mt-2 p-3 bg-gray-100 rounded-md'>
          <div className='flex items-center space-x-2 mb-2'>
            <input
              type='text'
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder='Nueva categoría'
              className='flex-grow p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
            />
            <div
              className='w-8 h-8 rounded-full cursor-pointer'
              style={{ backgroundColor: categoryColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
          </div>
          {showColorPicker && (
            <div className='relative'>
              <TwitterPicker
                color={categoryColor}
                onChangeComplete={color => setCategoryColor(color.hex)}
              />
              <button
                type='button'
                onClick={() => setShowColorPicker(false)}
                className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
              >
                <FiX />
              </button>
            </div>
          )}
          <button
            type='button'
            onClick={handleAddCategory}
            className='mt-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
          >
            Añadir Categoría
          </button>
        </div>
      )}

      {/* Descripción */}
      <div className='lg:col-span-2'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Descripción
        </label>
        <div className='relative'>
          <FiFileText className='absolute left-3 top-3 text-gray-400' />
          <textarea
            {...register('descripcion')}
            className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
            rows='3'
            placeholder='Descripción'
          ></textarea>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Buscador de Reserva Asociada (Opcional) */}
      {/* ------------------------------------------------------------- */}
      <div className='lg:col-span-2'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Reserva Asociada (Opcional)
        </label>
        <div className='flex items-center text-sm text-gray-500 mb-1'>
          <FiInfo className='mr-1' />
          <span>
            Seleccione la reserva si el ingreso o gasto está relacionado con una reserva. De lo contrario, déjelo en blanco.
          </span>
        </div>

        {/* Si NO tenemos reserva seleccionada, mostramos el buscador */}
        {!selectedReservation && (
          <div className='relative'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Buscar reserva por ID o nombre del festejado...'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value)
                setShowSuggestions(true)
              }}
            />

            {/* Lista de sugerencias */}
            {showSuggestions && filteredReservations.length > 0 && (
              <ul className='absolute z-10 mt-1 bg-white border border-gray-200 rounded-md w-full max-h-60 overflow-auto shadow-lg'>
                {filteredReservations.map(res => (
                  <li
                    key={res.id}
                    className='px-4 py-2 cursor-pointer hover:bg-gray-100'
                    onClick={() => handleSelectReservation(res)}
                  >
                    {`Reserva #${res.id} - ${res.nombre_festejado}`}
                  </li>
                ))}
              </ul>
            )}

            {/* Registramos un input oculto para id_reserva */}
            <input
              type='hidden'
              {...register('id_reserva')}
            />
          </div>
        )}

        {/* Si SÍ tenemos reserva seleccionada, mostramos el "chip" con opción de quitar */}
        {selectedReservation && (
          <div className='flex items-center bg-gray-50 p-2 rounded-md border mt-2'>
            <div className='flex-1 text-sm text-gray-700'>
              <strong>Reserva #{selectedReservation.id}</strong> - {selectedReservation.nombre_festejado}
            </div>
            <button
              type='button'
              className='p-1 text-gray-500 hover:text-gray-700'
              onClick={handleRemoveReservation}
            >
              <FiX className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>
      {/* ------------------------------------------------------------- */}

      {/* Factura PDF */}
      <div className='lg:col-span-2'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Factura PDF
        </label>
        <div className='relative'>
          <FiUpload className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='file'
            accept='.pdf'
            {...register('factura_pdf')}
            className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>
      </div>

      {/* Factura XML */}
      <div className='lg:col-span-2'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Factura XML
        </label>
        <div className='relative'>
          <FiFile className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='file'
            accept='.xml'
            {...register('factura_xml')}
            className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>
      </div>

      {/* Archivo de prueba */}
      {editingItem && editingItem.archivo_prueba && (
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Archivo de prueba actual
          </label>
          <div className='text-sm text-gray-500'>
            {editingItem.archivo_prueba}
          </div>
        </div>
      )}
      <div className='lg:col-span-2'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Archivo de Prueba (Opcional)
        </label>
        <div className='relative'>
          <FiUpload className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='file'
            {...register('archivo_prueba')}
            className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
          />
        </div>
      </div>
    </form>
  )
}

export default FinanceForm
