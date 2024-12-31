import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axiosInstance from '../../components/axiosConfig'
import ScreenSizeAlert from './ScreenSizeAlert'
import UserSummary from './UserSummary'
import ReservationSummary from './ReservationSummary'
import FinancialSummary from './FinancialSummary'
import TabNavigation from './TabNavigation'
import UserTable from './UserTable'
import ReservationTable from './ReservationTable'
import FinanceTable from './FinanceTable'
import PackageTable from './PackageTable'
import MonthSelector from './MonthSelector'
import ReservationModal from './ReservationModal'
import ItemModal from './ItemModal'
import FinanceDetailModal from './FinanceDetailModal'
import UserForm from './UserForm'
import ReservationForm from './ReservationForm'
import FinanceForm from './FinanceForm'
import PackageForm from './PackageForm'
import ExtraForm from './ExtraForm'
import ExtraTable from './ExtraTable'
import OpcionAlimentoForm from './OpcionAlimentoForm'
import OpcionAlimentoTable from './OpcionAlimentoTable'
import TematicaForm from './TematicaForm'
import TematicaTable from './TematicaTable'
import Swal from 'sweetalert2'
import MonthlyReportModal from './MonthlyReportModal'
import MamparaTable from './MamparaTable'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ReservationCalendar from './ReservationCalendar'
import MamparaForm from './MamparaForm'
import PaymentTable from './PaymentTable'
import PaymentForm from './PaymentForm'
import PaymentModal from './PaymentModal'
import PaymentDetails from './PaymentDetails'
import AuditHistory from './AuditHistory'

const Dashboard = () => {
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [finances, setFinances] = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [extras, setExtras] = useState([])
  const [tematicas, setTematicas] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [activeTab, setActiveTab] = useState('users')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [reservationSearch, setReservationSearch] = useState('')
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [showAlert, setShowAlert] = useState(true)
  const [selectedFinance, setSelectedFinance] = useState(null)
  const [mamparas, setMamparas] = useState([])
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [foodOptions, setFoodOptions] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentModalMode, setPaymentModalMode] = useState('view')
  const [unavailableDates, setUnavailableDates] = useState([])

  const navigate = useNavigate()

  const generateMonthlyReport = () => {
    setIsReportModalOpen(true)
  }

  const handleSelectReservation = reservation => {
    setSelectedReservation(reservation)
  }

  const handleCloseReservationModal = () => {
    setSelectedReservation(null)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const responses = await Promise.allSettled([
        axiosInstance.get('/api/usuarios'),
        axiosInstance.get('/api/reservas'),
        axiosInstance.get('/api/finanzas'),
        axiosInstance.get('/api/paquetes'),
        axiosInstance.get('/api/categorias'),
        axiosInstance.get('/api/extras'),
        axiosInstance.get('/api/opciones-alimentos'),
        axiosInstance.get('/api/tematicas'),
        axiosInstance.get('/api/mamparas'),
        axiosInstance.get('/api/pagos')
      ])

      if (responses[0].status === 'fulfilled') setUsers(responses[0].value.data)
      if (responses[1].status === 'fulfilled')
        setReservations(responses[1].value.data)
      if (responses[2].status === 'fulfilled') {
        setFinances(
          responses[2].value.data.map(finance => ({
            ...finance,
            monto: Number(finance.monto)
          }))
        )
      }
      if (responses[3].status === 'fulfilled')
        setPackages(responses[3].value.data)
      if (responses[4].status === 'fulfilled')
        setCategories(responses[4].value.data)
      if (responses[5].status === 'fulfilled')
        setExtras(responses[5].value.data)
      if (responses[6].status === 'fulfilled')
        setFoodOptions(responses[6].value.data)
      if (responses[7].status === 'fulfilled')
        setTematicas(responses[7].value.data)
      if (responses[8].status === 'fulfilled')
        setMamparas(responses[8].value.data)
      if (responses[9].status === 'fulfilled')
        setPayments(responses[9].value.data)

      responses.forEach((response, index) => {
        if (response.status === 'rejected') {
          console.error(`Error en la solicitud ${index}:`, response.reason)
          toast.error(`Error al cargar los datos de la solicitud ${index + 1}`)
        }
      })
    } catch (error) {
      console.error('Error al cargar los datos:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredUsers = useMemo(() => {
    return users.filter(
      user =>
        user.nombre.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (user.id_personalizado &&
          user.id_personalizado
            .toLowerCase()
            .includes(userSearch.toLowerCase()))
    )
  }, [users, userSearch])

  const filteredReservations = useMemo(() => {
    return reservations.filter(
      reservation =>
        reservation.id.toString().includes(reservationSearch) ||
        (reservation.nombre_festejado &&
          reservation.nombre_festejado
            .toLowerCase()
            .includes(reservationSearch.toLowerCase()))
    )
  }, [reservations, reservationSearch])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleViewReservation = useCallback(reservation => {
    setSelectedReservation(reservation)
    setIsReservationModalOpen(true)
  }, [])

  const filterDataByMonth = useCallback(
    (data, dateField) => {
      return data.filter(item => {
        const itemDate = new Date(item[dateField])
        return itemDate.getMonth() === selectedMonth
      })
    },
    [selectedMonth]
  )

  const handleAddItem = useCallback(() => {
    if (activeTab === 'payments') {
      setSelectedPayment(null)
      setPaymentModalMode('add')
      setIsPaymentModalOpen(true)
    } else {
      setEditingItem(null)
      setIsModalOpen(true)
    }
  }, [activeTab])

  const handleSavePayment = useCallback(async (paymentData) => {
    try {
      await axiosInstance.post('/api/pagos', paymentData)
      toast.success('Pago creado exitosamente')
      setIsPaymentModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error al crear el pago:', error)
      toast.error('Error al crear el pago')
      if (error.response?.status === 401) {
        navigate('/signin')
      }
    }
  }, [navigate, fetchData])

  const handleEditItem = useCallback(
    item => {
      console.log('Editando elemento:', item)
      if (activeTab === 'payments') {
        setSelectedPayment(item)
        setPaymentModalMode('add')
        setIsPaymentModalOpen(true)
      } else {
        setEditingItem(item)
        setIsModalOpen(true)
      }
    },
    [activeTab]
  )
  
  const handleUpdatePaymentStatus = useCallback(async (paymentId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/pagos/${paymentId}/estado`, {
        estado: newStatus
      })
  
      if (response.status === 200) {
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment.id === paymentId ? { ...payment, estado: newStatus } : payment
          )
        )
  
        toast.success('Estado del pago actualizado con éxito')
        await fetchData()
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error)
      toast.error('Error al actualizar el estado del pago')
  
      if (error.response?.status === 401) {
        navigate('/signin')
      }
    }
  }, [navigate, fetchData])

  const handleReservationStatusChange = useCallback((reservationId, newStatus) => {
    setReservations(prevReservations =>
      prevReservations.map(reservation =>
        reservation.id === reservationId
          ? { ...reservation, estado: newStatus }
          : reservation
      )
    )
  
    if (newStatus === 'cancelada' || newStatus === 'pendiente') {
      const updatedReservation = reservations.find(r => r.id === reservationId)
      if (updatedReservation) {
        const reservationDate = new Date(updatedReservation.fecha_reserva)
        
        setUnavailableDates(prevDates => {
          const newDates = prevDates.filter(date => 
            date.getTime() !== reservationDate.getTime()
          )
          
          const activeDates = reservations
            .filter(r => 
              r.id !== reservationId && 
              (r.estado === 'confirmada' || r.estado === 'pendiente')
            )
            .map(r => new Date(r.fecha_reserva))
            
          return [...new Set([...newDates, ...activeDates])]
        })
      }
    } else if (newStatus === 'confirmada') {
      const updatedReservation = reservations.find(r => r.id === reservationId)
      if (updatedReservation) {
        const reservationDate = new Date(updatedReservation.fecha_reserva)
        setUnavailableDates(prevDates => {
          if (!prevDates.some(date => date.getTime() === reservationDate.getTime())) {
            return [...prevDates, reservationDate]
          }
          return prevDates
        })
      }
    }
  }, [reservations])

  useEffect(() => {
    const initializeUnavailableDates = () => {
      const dates = reservations
        .filter(reservation => 
          reservation.estado === 'confirmada' || 
          reservation.estado === 'pendiente'
        )
        .map(reservation => new Date(reservation.fecha_reserva))
      
      setUnavailableDates([...new Set(dates)])
    }
  
    if (reservations.length > 0) {
      initializeUnavailableDates()
    }
  }, [reservations])

  const handleSendEmail = useCallback(reservation => {
    toast.info(`Funcionalidad de enviar correo a ${reservation.usuario.email}`)
  }, [])

  const handleContactUser = useCallback(reservation => {
    toast.info(
      `Funcionalidad de contactar al usuario ${reservation.usuario.nombre}`
    )
  }, [])

  const handleError = useCallback(
    (error, action) => {
      if (error.response) {
        if (error.response.status === 404) {
          toast.warning('El elemento ya no existe')
        } else if (error.response.status === 401) {
          toast.error(
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          )
          navigate('/signin')
        } else {
          toast.error(
            `Error del servidor al ${action} el elemento: ${
              error.response.data.message || 'Algo salió mal'
            }`
          )
        }
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor')
      } else {
        toast.error(`Error al ${action} el elemento`)
      }
      console.error(`Error al ${action} el elemento:`, error)
    },
    [navigate]
  )

  function removeCircularReferences (obj, seen = new WeakSet()) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }
    if (seen.has(obj)) {
      return '[Circular]'
    }
    seen.add(obj)
    const newObj = Array.isArray(obj) ? [] : {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = removeCircularReferences(obj[key], seen)
      }
    }
    return newObj
  }

  const handleSubmit = useCallback(
    async data => {
      setLoading(true)
      try {
        console.log('Datos recibidos en handleSubmit:', data)
        let endpoint
        let successMessage

        switch (activeTab) {
          case 'users':
            endpoint = '/api/usuarios'
            successMessage = editingItem
              ? 'Usuario actualizado exitosamente'
              : 'Usuario creado exitosamente'
            break
          case 'reservations':
            endpoint = '/api/reservas'
            successMessage = editingItem
              ? 'Reserva actualizada exitosamente'
              : 'Reserva creada exitosamente'
            break
          case 'finances':
            endpoint = '/api/finanzas'
            successMessage = editingItem
              ? 'Registro financiero actualizado exitosamente'
              : 'Registro financiero creado exitosamente'
            break
          case 'packages':
            endpoint = '/api/paquetes'
            successMessage = editingItem
              ? 'Paquete actualizado exitosamente'
              : 'Paquete creado exitosamente'
            break
          case 'extras':
            endpoint = '/api/extras'
            successMessage = editingItem
              ? 'Extra actualizado exitosamente'
              : 'Extra creado exitosamente'
            break
          case 'opcionesAlimento':
            endpoint = '/api/opciones-alimentos'
            successMessage = editingItem
              ? 'Opción de alimento actualizada exitosamente'
              : 'Opción de alimento creada exitosamente'
            break
          case 'tematicas':
            endpoint = '/api/tematicas'
            successMessage = editingItem
              ? 'Temática actualizada exitosamente'
              : 'Temática creada exitosamente'
            break
          case 'mamparas':
            endpoint = '/api/mamparas'
            successMessage = editingItem
              ? 'Mampara actualizada exitosamente'
              : 'Mampara creada exitosamente'
            break
          case 'payments':
            endpoint = '/api/pagos'
            successMessage = editingItem
              ? 'Pago actualizado exitosamente'
              : 'Pago creado exitosamente'
            break
          default:
            throw new Error('Tipo de formulario no reconocido')
        }

        const cleanedData = removeCircularReferences(data)
        console.log('Datos limpios a enviar al servidor:', cleanedData)

        const serializedData = JSON.stringify(cleanedData)

        if (editingItem) {
          await axiosInstance.put(
            `${endpoint}/${editingItem.id}`,
            JSON.parse(serializedData)
          )
        } else {
          await axiosInstance.post(endpoint, JSON.parse(serializedData))
        }

        toast.success(successMessage)
        setIsModalOpen(false)
        fetchData()
      } catch (error) {
        console.error('Error en handleSubmit:', error)
        if (error.response && error.response.status === 401) {
          toast.error(
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          )
          navigate('/signin')
          return
        } else {
          handleError(error, editingItem ? 'actualizar' : 'crear')
        }
      } finally {
        setLoading(false)
      }
    },
    [activeTab, editingItem, fetchData, handleError, navigate]
  )

  const handleDeleteItem = async (endpoint, id, successMessage) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará el registro. Podrás reactivarlo más tarde si es necesario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`${endpoint}/${id}`)
        Swal.fire('¡Desactivado!', successMessage, 'success')
        fetchData()
      } catch (error) {
        handleError(error, 'desactivar')
      }
    }
  }

  const generateRandomPassword = useCallback(() => {
    const adjectives = [
      'Happy',
      'Silly',
      'Funny',
      'Crazy',
      'Lucky',
      'Sunny',
      'Brave',
      'Kind',
      'Cute',
      'Cool',
      'Fast',
      'Smart',
      'Strong',
      'Wise'
    ]
    const nouns = [
      'Cat',
      'Dog',
      'Bird',
      'Fish',
      'Panda',
      'Koala',
      'Lion',
      'Tiger',
      'Bear',
      'Monkey',
      'Laundry',
      'Pencil',
      'Computer',
      'Phone'
    ]
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = numbers[Math.floor(Math.random() * numbers.length)]

    const password = `${adjective}${noun}${number}`
    setGeneratedPassword(password)
  }, [])

  const handleDownloadFile = useCallback(async (id, type) => {
    try {
      const response = await axiosInstance.get(
        `/api/finanzas/${id}/download/${type}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finanza_${id}_${type}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Error al descargar el archivo:', error)
      toast.error('Error al descargar el archivo')
    }
  }, [])

  const handleViewDetails = useCallback(finance => {
    setSelectedFinance(finance)
  }, [])

  const handleAddCategory = useCallback(async newCategory => {
    try {
      const response = await axiosInstance.post('/api/categorias', {
        nombre: newCategory.nombre,
        color: newCategory.color || '#000000'
      })
      setCategories(prevCategories => [...prevCategories, response.data])
      toast.success('Categoría añadida con éxito')
    } catch (error) {
      console.error('Error al añadir la categoría:', error)
      toast.error('Error al añadir la categoría')
    }
  }, [])

  const renderModalContent = useCallback(() => {
    const props = {
      editingItem,
      onSave: handleSubmit,
      generateRandomPassword,
      generatedPassword,
      users,
      packages,
      categories,
      onAddCategory: handleAddCategory,
      reservations,
      tematicas,
      foodOptions,
      extras
    }
    switch (activeTab) {
      case 'users':
        return <UserForm {...props} />
      case 'reservations':
        return <ReservationForm {...props} />
      case 'finances':
        return <FinanceForm {...props} />
      case 'packages':
        return <PackageForm {...props} />
      case 'extras':
        return <ExtraForm {...props} />
      case 'opcionesAlimento':
        return <OpcionAlimentoForm {...props} />
      case 'tematicas':
        return <TematicaForm {...props} />
      case 'mamparas':
        return <MamparaForm {...props} />
      case 'payments':
        return <PaymentForm {...props} />
      default:
        return null
    }
  }, [
    activeTab,
    editingItem,
    handleSubmit,
    generateRandomPassword,
    generatedPassword,
    users,
    packages,
    categories,
    handleAddCategory,
    reservations,
    tematicas,
    foodOptions,
    extras
  ])

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8'>
      {isSmallScreen && showAlert && (
        <ScreenSizeAlert setShowAlert={setShowAlert} />
      )}
      <h1 className='text-4xl font-bold mb-8 text-center text-indigo-800'>
        Panel de Control
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
        <ReservationCalendar
          reservations={reservations}
          onSelectReservation={handleSelectReservation}
          unavailableDates={unavailableDates}
        />
        <UserSummary users={users} />
        <ReservationSummary
          reservations={reservations}
          filterDataByMonth={filterDataByMonth}
        />
        <FinancialSummary
          finances={finances}
          filterDataByMonth={filterDataByMonth}
          categories={categories}
        />
      </div>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleAddItem={handleAddItem}
        />
        {activeTab === 'users' && (
          <UserTable
            users={filteredUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/usuarios',
                id,
                'Usuario desactivado con éxito',
                () => setIsModalOpen(false)
              )
            }
          />
        )}
        {activeTab === 'reservations' && (
          <ReservationTable
            reservations={reservations}
            reservationSearch={reservationSearch}
            setReservationSearch={setReservationSearch}
            handleViewReservation={handleViewReservation}
            handleEditItem={handleEditItem}
            handleDeleteItem={handleDeleteItem}
            selectedMonth={selectedMonth}
          />
        )}
        {activeTab === 'finances' && (
          <FinanceTable
            finances={filterDataByMonth(finances, 'fecha')}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/finanzas',
                id,
                'Finanza desactivada con éxito',
                () => setIsModalOpen(false)
              )
            }
            handleDownloadFile={handleDownloadFile}
            handleViewDetails={handleViewDetails}
            categories={categories}
            generateMonthlyReport={generateMonthlyReport}
          />
        )}
        {activeTab === 'packages' && (
          <PackageTable
            packages={packages}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/paquetes',
                id,
                'Paquete desactivado con éxito',
                () => setIsModalOpen(false),
                'paquetes'
              )
            }
          />
        )}
        {activeTab === 'extras' && (
          <ExtraTable
            extras={extras}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem('/api/extras', id, 'Extra eliminado con éxito')
            }
          />
        )}
        {activeTab === 'opcionesAlimento' && (
          <OpcionAlimentoTable
            opcionesAlimento={foodOptions}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/opciones-alimentos',
                id,
                'Opción de alimento eliminada con éxito'
              )
            }
          />
        )}
        {activeTab === 'tematicas' && (
          <TematicaTable
            tematicas={tematicas}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/tematicas',
                id,
                'Temática eliminada con éxito'
              )
            }
          />
        )}
        {activeTab === 'mamparas' && (
          <MamparaTable
            tematicas={tematicas}
            mamparas={mamparas}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/mamparas',
                id,
                'Mampara eliminada con éxito'
              )
            }
          />
        )}
        {activeTab === 'payments' && (
          <PaymentTable
            payments={payments}
            reservations={reservations}
            onViewPayment={(payment) => {
              setSelectedPayment(payment)
              setPaymentModalMode('view')
              setIsPaymentModalOpen(true)
            }}
            onEditPayment={(payment) => {
              setSelectedPayment(payment)
              setPaymentModalMode('edit')
              setIsPaymentModalOpen(true)
            }}
          />
        )}
        {activeTab === 'auditoria' && (
          <AuditHistory />
        )}
      </div>
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
      {isReservationModalOpen && selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={handleCloseReservationModal}
          onStatusChange={newStatus =>
            handleReservationStatusChange(selectedReservation.id, newStatus)
          }
          onSendEmail={handleSendEmail}
          onContactUser={handleContactUser}
          tematicas={tematicas}
          extras={extras}
        />
      )}
      {isModalOpen && (
        <ItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${editingItem ? 'Editar' : 'Agregar'} ${activeTab.slice(
            0,
            -1
          )}`}
          loading={loading}
          activeTab={activeTab}
          handleSubmit={handleSubmit}
          editingItem={editingItem}
          generatedPassword={generatedPassword}
          generateRandomPassword={generateRandomPassword}
          users={users}
          packages={packages}
          reservations={reservations}
          categories={categories}
          onAddCategory={handleAddCategory}
          tematicas={tematicas}
          foodOptions={foodOptions}
          extras={extras}
          mamparas={mamparas}
        />
      )}
      {selectedFinance && (
        <FinanceDetailModal
          finance={selectedFinance}
          onClose={() => setSelectedFinance(null)}
          onDownloadFile={handleDownloadFile}
        />
      )}
      {isPaymentModalOpen && (
        <PaymentModal
          payment={selectedPayment}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setSelectedPayment(null)
            setIsPaymentModalOpen(false)
          }}
          onUpdateStatus={handleUpdatePaymentStatus}
          onSavePayment={handleSavePayment}
          reservations={reservations}
          mode={paymentModalMode}
        />
      )}
      {isReportModalOpen && (
        <MonthlyReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          finances={filterDataByMonth(finances, 'fecha')}
          categories={categories}
        />
      )}
    </div>
  )
}

export default Dashboard