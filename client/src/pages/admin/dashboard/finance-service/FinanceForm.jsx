import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
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
  FiSearch,
  FiChevronDown,
  FiSave,
  FiFileText as FiFilePdf,
  FiCode
} from 'react-icons/fi'
// Usar el alias @ para garantizar resolución correcta en Docker
import CurrencyInput from '@/components/CurrencyInput'
import CloudinaryFileSelector from '@/components/cloudinary/CloudinaryFileSelector'
import ColorPalette from '@/components/ui/ColorPalette'

const FinanceForm = ({
  editingItem,
  onSave,
  categories,
  onAddCategory,
  reservations = [],
  activeTab,
  currentUser // Necesitamos el usuario actual para id_usuario
}) => {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: editingItem || {
      fecha: new Date().toISOString().split('T')[0],
      tipo: '',
      monto: '',
      id_categoria: null,
      id_usuario: currentUser?.id,
      factura_pdf: null,
      factura_xml: null,
      archivo_prueba: null
    }
  })

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categoryColor, setCategoryColor] = useState('#FF6900')
  const [showInvoiceFields, setShowInvoiceFields] = useState(false)

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
    if (!currentUser?.id) {
      toast.error('Error: Usuario no disponible');
      return;
    }

  const formattedData = {
    ...data,
    id_categoria: data.id_categoria,
    id_reserva: data.id_reserva || null,
    id_usuario: currentUser.id,
    monto: parseFloat(data.monto || '0'),
    // Las URLs de Cloudinary ya están en los campos
    factura_pdf: data.factura_pdf || null,
    factura_xml: data.factura_xml || null,
    archivo_prueba: data.archivo_prueba || null
  };

    if (isNaN(formattedData.monto) || formattedData.monto <= 0) {
      toast.error('El monto debe ser mayor que 0');
      return;
    }

    onSave(formattedData);
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.find(cat => cat.nombre === newCategory)) {
      onAddCategory({ nombre: newCategory, color: categoryColor || '#000000' })
      setNewCategory('')
      setShowNewCategoryInput(false)
    }
  }

  // Asegurarnos de que id_usuario esté establecido
  useEffect(() => {
    if (currentUser?.id) {
      setValue('id_usuario', currentUser.id);
    } else {
      console.error('No hay usuario disponible');
    }
  }, [currentUser, setValue]);

  // Establecer id_usuario al montar el componente
  useEffect(() => {
    if (currentUser?.id && !watch('id_usuario')) {
      setValue('id_usuario', currentUser.id);
    }
  }, []);

  return (
    <form
      id={activeTab + 'Form'}
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-4 py-3'
    >
      {/* Campo oculto para id_usuario */}
      <input type="hidden" {...register('id_usuario')} />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        {/* Tipo */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Tipo
          </label>
          <div className='relative'>
            <FiDollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10 transition-colors duration-200' />
            <div className="relative">
              <select
              {...register('tipo', { 
                required: 'Este campo es requerido',
                validate: value => ['ingreso', 'gasto'].includes(value) || 'Tipo de transacción inválido'
              })}
              className='pl-10 w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
            >
              <option value=''>Seleccionar tipo</option>
              <option value='ingreso'>Ingreso</option>
              <option value='gasto'>Gasto</option>
              </select>
            </div>
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
            rules={{ 
              required: 'Este campo es requerido',
              validate: {
                isNumber: value => !isNaN(parseFloat(value)) || 'El monto debe ser un número válido',
                isPositive: value => parseFloat(value) > 0 || 'El monto debe ser mayor que 0'
              }
            }}
            defaultValue=""
            render={({ field: { onChange, value, ...field } }) => (
              <CurrencyInput
                {...field}
                value={value}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                  const parsedValue = parseFloat(numericValue);
                  if (!isNaN(parsedValue)) {
                    onChange(numericValue);
                  }
                }}
                className='pl-10 w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
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
            <FiCalendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10 transition-colors duration-200' />
            <input
              type='date'
              {...register('fecha', { 
                required: 'Este campo es requerido',
                validate: {
                  validDate: value => !isNaN(Date.parse(value)) || 'Fecha inválida'
                }
              })}
              className='pl-10 w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Categoría
          </label>
          <div className='relative flex items-center'>
            <FiTag className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10 transition-colors duration-200' />
            <select
              {...register('id_categoria', {
                setValueAs: value => value === '' ? null : parseInt(value, 10)
              })}
              className='pl-10 w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
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
              className='ml-2 p-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all duration-200 hover:shadow-md'
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
              className='flex-grow p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
            />
            <div
              className='w-8 h-8 rounded-full cursor-pointer'
              style={{ backgroundColor: categoryColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
          </div>
          <div className='mb-2'>
            <ColorPalette 
              selectedColor={categoryColor} 
              onSelectColor={setCategoryColor} 
            />
          </div>
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
          <FiFileText className='absolute left-3 top-3 text-gray-500 w-5 h-5 z-10 transition-colors duration-200' />
          <textarea
            {...register('descripcion')}
            className='pl-10 w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white hover:border-indigo-300 transition-colors duration-200'
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
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10 transition-colors duration-200' />
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
              className='px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors duration-200'
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
          <div className='flex items-center bg-gray-50 p-2.5 rounded-lg border mt-2 hover:bg-gray-100 transition-colors duration-200'>
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

      {/* Botón para mostrar/ocultar facturas */}
      <div className='lg:col-span-2'>
        <button
          type='button'
          onClick={() => setShowInvoiceFields(!showInvoiceFields)}
          className='w-full p-2 flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200'
        >
          <div className='flex-1 flex items-center'>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 transition-colors duration-200 ${
              showInvoiceFields ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'
            }`}>
              <FiFile className='w-4 h-4' />
            </div>
            <span className='font-medium'>
              {showInvoiceFields ? 'Ocultar facturas' : 'Agregar facturas'}
            </span>
          </div>
          <FiChevronDown 
            className={`w-5 h-5 transform transition-transform duration-200 ${
              showInvoiceFields ? 'rotate-180 text-indigo-600' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Sección de facturas con animación suave y scroll */}
      <div 
        className={`space-y-4 transition-all duration-700 ease-in-out transform origin-top ${
          showInvoiceFields 
            ? 'opacity-100 max-h-[800px] mb-4 scale-y-100' 
            : 'opacity-0 max-h-0 mb-0 scale-y-95 overflow-hidden'
        }`}
      >
        <div className='lg:col-span-2 space-y-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Factura PDF
          </label>
          <Controller
            name="factura_pdf"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <CloudinaryFileSelector
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecciona o sube un archivo PDF"
                acceptTypes="application/pdf"
                label="Factura PDF"
                icon={FiFilePdf}
              />
            )}
          />
        </div>

        {/* Factura XML */}
        <div className='lg:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Factura XML
          </label>
          <Controller
            name="factura_xml"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <CloudinaryFileSelector
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecciona o sube un archivo XML"
                acceptTypes="application/xml,text/xml"
                label="Factura XML"
                icon={FiCode}
              />
            )}
          />
        </div>

        {/* Archivo de prueba */}
        <div className='lg:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Archivo de Prueba (Opcional - PNG, JPG o PDF)
          </label>
          <Controller
            name="archivo_prueba"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <CloudinaryFileSelector
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecciona o sube un archivo (PNG, JPG o PDF)"
                acceptTypes="image/png,image/jpeg,application/pdf"
                label="Archivo de Prueba"
                icon={FiFile}
              />
            )}
          />
        </div>
      </div>
    </form>
  )
}

export default FinanceForm
