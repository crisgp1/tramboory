import { FiX } from 'react-icons/fi'
import UserForm from './UserForm'
import ReservationForm from './ReservationForm'
import FinanceForm from './FinanceForm'
import PackageForm from './PackageForm'
import ExtraForm from './ExtraForm'
import OpcionAlimentoForm from './OpcionAlimentoForm'
import TematicaForm from './TematicaForm'
import MamparaForm from './MamparaForm'
import PaymentForm from './PaymentForm'

const ItemModal = ({
  isOpen,
  onClose,
  title,
  loading,
  activeTab,
  handleSubmit,
  editingItem,
  generatedPassword,
  generateRandomPassword,
  users,
  packages,
  reservations,
  categories,
  onAddCategory,
  foodOptions,
  extras,
  tematicas,
  mamparas,
  payments
}) => {
  const commonProps = {
    editingItem,
    onSave: handleSubmit,
    activeTab,
    payment: editingItem,
    onClose,
    users,
    packages,
    foodOptions,
    extras,
    tematicas,
    mamparas,
    payments,
    reservations
  }

  const renderForm = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UserForm
            {...commonProps}
            generatedPassword={generatedPassword}
            generateRandomPassword={generateRandomPassword}
          />
        )

      case 'reservations':
        console.log(
          'Abriendo formulario de reserva con los siguientes props:',
          {
            editingItem,
            users,
            packages,
            foodOptions,
            extras,
            tematicas,
            mamparas
          }
        )
        return (
          <ReservationForm
            {...commonProps}
            users={users}
            packages={packages}
            foodOptions={foodOptions}
            extras={extras}
            tematicas={tematicas}
            mamparas={mamparas || []}
          />
        )
      case 'finances':
        return (
          <FinanceForm
            {...commonProps}
            categories={categories}
            onAddCategory={onAddCategory}
            reservations={reservations}
          />
        )
      case 'packages':
        return <PackageForm {...commonProps} />
      case 'extras':
        return <ExtraForm {...commonProps} />
      case 'opcionesAlimento':
        return <OpcionAlimentoForm {...commonProps} />
      case 'tematicas':
        return <TematicaForm {...commonProps} />
      case 'mamparas': // Agregar este caso
        return <MamparaForm {...commonProps} />
      case 'payments':
        return <PaymentForm {...commonProps} payment={editingItem} />
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col'>
        <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            {title || `${editingItem ? 'Editar' : 'Agregar'} ${activeTab}`}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out'
          >
            <FiX size={24} />
          </button>
        </div>

        <div className='flex-grow overflow-y-auto p-6'>{renderForm()}</div>

        <div className='px-6 py-4 border-t border-gray-200 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition duration-150 ease-in-out'
          >
            Cancelar
          </button>
          <button
            form={`${activeTab}Form`}
            type='submit'
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out'
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemModal
