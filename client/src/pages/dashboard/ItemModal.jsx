import Modal from '../../components/ui/Modal'
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
  payments,
  currentUser
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
    currentUser,
    extras,
    tematicas,
    mamparas,
    payments,
    reservations,
    blockedDates: reservations
      .filter(r => r.estado === 'confirmada')
      .map(r => new Date(r.fecha_reserva)),
    existingReservations: reservations
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
        console.log('Abriendo formulario de reserva con los siguientes props:', commonProps)
        return <ReservationForm {...commonProps} />

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
      case 'mamparas':
        return <MamparaForm {...commonProps} />
      case 'payments':
        return <PaymentForm {...commonProps} payment={editingItem} />
      default:
        return null
    }
  }

  if (!isOpen) return null

  const footerContent = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300 transition duration-150 ease-in-out"
      >
        Cancelar
      </button>
      <button
        form={`${activeTab}Form`}
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
        disabled={loading}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || `${editingItem ? 'Editar' : 'Agregar'} ${activeTab}`}
      footer={footerContent}
    >
      {renderForm()}
    </Modal>
  )
}

export default ItemModal
