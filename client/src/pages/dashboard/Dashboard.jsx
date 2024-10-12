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
import Swal from 'sweetalert2'

const Dashboard = () => {
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [finances, setFinances] = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
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

  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        usersResponse,
        reservationsResponse,
        financesResponse,
        packagesResponse,
        categoriesResponse
      ] = await Promise.all([
        axiosInstance.get('/api/usuarios'),
        axiosInstance.get('/api/reservas'),
        axiosInstance.get('/api/finanzas'),
        axiosInstance.get('/api/paquetes'),
        axiosInstance.get('/api/categorias')
      ])

      setUsers(usersResponse.data)
      setReservations(reservationsResponse.data)
      setFinances(
        financesResponse.data.map(finance => ({
          ...finance,
          monto: Number(finance.monto)
        }))
      )
      setPackages(packagesResponse.data)
      setCategories(categoriesResponse.data)
    } catch (error) {
      handleError(error, 'cargar los datos')
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
    setEditingItem(null)
    setIsModalOpen(true)
  }, [])

  const handleEditItem = useCallback(item => {
    setEditingItem(item)
    setIsModalOpen(true)
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

  const handleSubmit = useCallback(async (data) => {
    setLoading(true);
    try {
        let endpoint;
        let successMessage;

        switch (activeTab) {
            case 'users':
                endpoint = '/api/usuarios';
                successMessage = editingItem ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
                break;
            case 'reservations':
                endpoint = '/api/reservas';
                successMessage = editingItem ? 'Reserva actualizada exitosamente' : 'Reserva creada exitosamente';
                break;
            case 'finances':
                endpoint = '/api/finanzas';
                successMessage = editingItem ? 'Registro financiero actualizado exitosamente' : 'Registro financiero creado exitosamente';
                break;
            case 'packages':
                endpoint = '/api/paquetes';
                successMessage = editingItem ? 'Paquete actualizado exitosamente' : 'Paquete creado exitosamente';
                break;
            default:
                throw new Error('Tipo de formulario no reconocido');
        }

        if (editingItem) {
            await axiosInstance.put(`${endpoint}/${editingItem.id}`, data);
        } else {
            await axiosInstance.post(endpoint, data);
        }

        toast.success(successMessage);
        setIsModalOpen(false);
        fetchData();
    } catch (error) {
        console.error('Error en handleSubmit:', error);
        if (error.response) {
            toast.error(`Error al ${editingItem ? 'actualizar' : 'crear'} el registro: ${error.response.data.message}`);
        } else {
            toast.error(`Error al ${editingItem ? 'actualizar' : 'crear'} el registro`);
        }
    } finally {
        setLoading(false);
    }
}, [activeTab, editingItem, fetchData, setIsModalOpen]);

  const handleDeleteItem = async (endpoint, id, successMessage, onClose) => {
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
        const response = await axiosInstance.delete(`${endpoint}/${id}`)
        if (response.status === 200) {
          Swal.fire('¡Desactivado!', successMessage, 'success')
          onClose()
          fetchData()
        } else {
          Swal.fire(
            'Error',
            'Hubo un problema al desactivar el registro',
            'error'
          )
        }
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
      const response = await axiosInstance.post('/api/categorias', newCategory)
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
      onSubmit: handleSubmit,
      generateRandomPassword,
      generatedPassword,
      users,
      packages,
      categories,
      onAddCategory: handleAddCategory,
      reservations
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
    reservations
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
        <UserSummary users={users} />
        <ReservationSummary
          reservations={reservations}
          filterDataByMonth={filterDataByMonth}
        />
        <FinancialSummary
          finances={finances}
          filterDataByMonth={filterDataByMonth}
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
            reservations={filteredReservations}
            reservationSearch={reservationSearch}
            setReservationSearch={setReservationSearch}
            handleViewReservation={handleViewReservation}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/reservas',
                id,
                'Reserva desactivada con éxito',
                () => setIsModalOpen(false)
              )
            }
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
                'Paquete eliminado con éxito'
              )
            }
          />
        )}
      </div>
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
      {isReservationModalOpen && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}
       {isModalOpen && (
            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${editingItem ? 'Editar' : 'Agregar'} ${activeTab.slice(0, -1)}`}
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
            />
        )}
      {selectedFinance && (
        <FinanceDetailModal
          finance={selectedFinance}
          onClose={() => setSelectedFinance(null)}
          onDownloadFile={handleDownloadFile}
        />
      )}
    </div>
  )
}

export default Dashboard
