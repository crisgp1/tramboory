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
  FiX
} from 'react-icons/fi'
import { TwitterPicker } from 'react-color'
import CurrencyInput from '../../components/CurrencyInput'

const FinanceForm = ({
  editingItem,
  onSave,
  categories,
  onAddCategory,
  reservations,
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

  const selectedCategoryId = watch('categoria')

  const onSubmit = data => {
    console.log('Formulario enviado:', data)
    onSave({
      ...data,
      categoria: data.categoria,
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

  const getCategoryColor = categoryName => {
    const category = categories.find(cat => cat.nombre === categoryName)
    return category && category.color ? category.color : '#CCCCCC'
  }

  return (
    <form
      id={activeTab + 'Form'}
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Categoría
          </label>
          <div className='relative flex items-center'>
            <FiTag className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <select
              {...register('categoria', {
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
        <div className='mt-4 p-4 bg-gray-100 rounded-md'>
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

      <div className='col-span-2'>
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

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Reserva Asociada (Opcional)
        </label>
        <div className='relative'>
          <FiPackage className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <select
            {...register('id_reserva')}
            className='pl-10 w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500'
          >
            <option value=''>Sin reserva asociada</option>
            {reservations.map(reserva => (
              <option key={reserva.id} value={reserva.id}>
                {`Reserva #${reserva.id} - ${reserva.nombre_festejado}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
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

      <div>
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

      <div>
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
