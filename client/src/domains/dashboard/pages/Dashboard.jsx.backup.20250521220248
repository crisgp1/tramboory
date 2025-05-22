import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
// Asegurar que todas las importaciones usen el alias @ para resolver correctamente en Docker
import axiosInstance from '@/components/axiosConfig'
import { useAuth } from '@/hooks/useAuth'
import * as socketService from '@/services/socketService'
import CrmLayout from '@/components/layout/CrmLayout'
import { Breadcrumb } from '@/components/ui'
// Importar tiendas Zustand
import {
  useUiStore,
  useUsersStore,
  useReservationsStore,
  useFinancesStore,
  usePackagesStore,
  useCategoriesStore,
  useThemesStore,
  useExtrasStore,
  useFoodOptionsStore,
  useMamparasStore,
  usePaymentsStore
} from '@/store'
import ScreenSizeAlert from './dashboard-components/ScreenSizeAlert.jsx'
import UserSummary from './user-service/UserSummary.jsx'
import ReservationSummary from './reservation-service/ReservationSummary.jsx'
import FinancialSummary from './finance-service/FinancialSummary.jsx'
import UserTable from './user-service/UserTable.jsx'
import ReservationTable from './reservation-service/ReservationTable.jsx'
import FinanceTable from './finance-service/FinanceTable.jsx'
import PackageTable from './catalog-service/paquete-service/PackageTable.jsx'
import MonthSelector from './dashboard-components/MonthSelector.jsx'
import ReservationCalendar from './dashboard-components/ReservationCalendar.jsx'
import ReservationModal from './reservation-service/ReservationModal.jsx'
import ItemModal from './dashboard-components/ItemModal.jsx'
import FinanceDetailModal from './finance-service/FinanceDetailModal.jsx'
import UserForm from './user-service/UserForm.jsx'
import ReservationForm from './reservation-service/ReservationForm.jsx'
import FinanceForm from './finance-service/FinanceForm.jsx'
import PackageForm from './catalog-service/paquete-service/PackageForm.jsx'
import UserModal from './user-service/UserModal.jsx'
import ExtraForm from './catalog-service/extra-service/ExtraForm.jsx'
import ExtraTable from './catalog-service/extra-service/ExtraTable.jsx'
import OpcionAlimentoForm from './catalog-service/alimento-service/OpcionAlimentoForm.jsx'
import OpcionAlimentoTable from './catalog-service/alimento-service/OpcionAlimentoTable.jsx'
import TematicaForm from './catalog-service/tematica-service/TematicaForm.jsx'
import TematicaTable from './catalog-service/tematica-service/TematicaTable.jsx'
import Swal from 'sweetalert2'
import MonthlyReportModal from './finance-service/MonthlyReportModal.jsx'
import MamparaTable from './catalog-service/mampara-service/MamparaTable.jsx'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import MamparaForm from './catalog-service/mampara-service/MamparaForm.jsx'
import PaymentTable from './payment-service/PaymentTable.jsx'
import PaymentForm from './payment-service/PaymentForm.jsx'
import PaymentModal from './payment-service/PaymentModal.jsx'
import PaymentDetails from './payment-service/PaymentDetails.jsx'
import AuditHistory from './auditory-service/AuditHistory.jsx'
import ArchivedTable from './auditory-service/ArchivedTable.jsx'
import GaleriaManagement from './gallery-service/GaleriaManagement.jsx'
import { HiPlus } from 'react-icons/hi'

const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate()
  
  // Estados de UI desde Zustand
  const { 
    activeTab, setActiveTab,
    isModalOpen, setIsModalOpen,
    isReservationModalOpen, setIsReservationModalOpen,
    isReportModalOpen, setIsReportModalOpen,
    isPaymentModalOpen, setIsPaymentModalOpen,
    isUserModalOpen, setIsUserModalOpen,
    loading, setLoading,
    isSmallScreen, setIsSmallScreen,
    showAlert, setShowAlert,
    userSearch, setUserSearch,
    reservationSearch, setReservationSearch,
    archivedSearch, setArchivedSearch,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    paymentModalMode, setPaymentModalMode,
    generatedPassword, generateRandomPassword
  } = useUiStore();

  // Estados de entidades (todavía mantenemos el estado local por ahora)
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [finances, setFinances] = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [extras, setExtras] = useState([])
  const [tematicas, setTematicas] = useState([])
  const [archivedItems, setArchivedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [selectedFinance, setSelectedFinance] = useState(null)
  const [mamparas, setMamparas] = useState([])
  const [foodOptions, setFoodOptions] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Determinar si mostrar el dashboard principal o contenido específico
  const isMainDashboard = activeTab === 'dashboard';
  
  // Mapeo de categorías y sus pestañas para las migajas de pan
  const breadcrumbsMap = {
    dashboard: [{ label: 'Panel Principal', path: 'dashboard' }],
    users: [{ label: 'Usuarios', path: 'users' }],
    reservations: [{ label: 'Reservaciones', path: 'reservations' }],
    finances: [{ label: 'Finanzas', path: 'finances' }],
    payments: [{ label: 'Pagos', path: 'payments' }],
    packages: [{ label: 'Catálogo', path: 'catalog' }, { label: 'Paquetes', path: 'packages' }],
    extras: [{ label: 'Catálogo', path: 'catalog' }, { label: 'Extras', path: 'extras' }],
    opcionesAlimento: [{ label: 'Catálogo', path: 'catalog' }, { label: 'Opciones de Alimento', path: 'opcionesAlimento' }],
    tematicas: [{ label: 'Catálogo', path: 'catalog' }, { label: 'Temáticas', path: 'tematicas' }],
    mamparas: [{ label: 'Catálogo', path: 'catalog' }, { label: 'Mamparas', path: 'mamparas' }],
    galeria: [{ label: 'Sistema', path: 'system' }, { label: 'Galería', path: 'galeria' }],
    auditoria: [{ label: 'Sistema', path: 'system' }, { label: 'Auditoría', path: 'auditoria' }],
    archived: [{ label: 'Sistema', path: 'system' }, { label: 'Elementos Archivados', path: 'archived' }]
  };
  
  // Obtener los ítems del breadcrumb actual
  const currentBreadcrumbItems = useMemo(() => {
    return breadcrumbsMap[activeTab] || [];
  }, [activeTab]);
  
  // Manejar navegación desde el breadcrumb
  const handleBreadcrumbNavigation = useCallback((path) => {
    if (path === 'dashboard') {
      setActiveTab('dashboard');
    } else if (path === 'catalog') {
      setActiveTab('packages');
    } else if (path === 'system') {
      setActiveTab('galeria');
    } else if (breadcrumbsMap[path]) {
      setActiveTab(path);
    }
  }, [setActiveTab]);
  
  const handleViewUser = useCallback(user => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }, [setIsUserModalOpen])

  const generateMonthlyReport = () => {
    setIsReportModalOpen(true)
  }

  const handleSelectReservation = reservation => {
    setSelectedReservation(reservation)
  }

  const handleCloseReservationModal = () => {
    setSelectedReservation(null)
  }

  // Obtener las funciones fetch de las tiendas
  const { fetchUsers: fetchUsersZustand } = useUsersStore();
  const { fetchReservations: fetchReservationsZustand, initSocketListeners } = useReservationsStore();
  const { fetchFinances: fetchFinancesZustand } = useFinancesStore();
  const { fetchPackages: fetchPackagesZustand } = usePackagesStore();
  const { fetchCategories: fetchCategoriesZustand } = useCategoriesStore();
  const { fetchExtras: fetchExtrasZustand } = useExtrasStore();
  const { fetchFoodOptions: fetchFoodOptionsZustand } = useFoodOptionsStore();
  const { fetchThemes: fetchThemesZustand } = useThemesStore();
  const { fetchMamparas: fetchMamparasZustand } = useMamparasStore();
  const { fetchPayments: fetchPaymentsZustand } = usePaymentsStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Usar Promise.allSettled para manejar errores individuales sin detener todo el proceso
      const results = await Promise.allSettled([
        fetchUsersZustand().then(data => setUsers(data)),
        fetchReservationsZustand().then(data => setReservations(data)),
        fetchFinancesZustand().then(data => setFinances(data)),
        fetchPackagesZustand().then(data => setPackages(data)),
        fetchCategoriesZustand().then(data => setCategories(data)),
        fetchExtrasZustand().then(data => setExtras(data)),
        fetchFoodOptionsZustand().then(data => setFoodOptions(data)),
        fetchThemesZustand().then(data => setTematicas(data)),
        fetchMamparasZustand().then(data => setMamparas(data)),
        fetchPaymentsZustand().then(data => setPayments(data)),
        // Obtener elementos archivados - todavía usando axios ya que no tenemos tiendas para estos
        axiosInstance.get('/reservas/archived'),
        axiosInstance.get('/pagos/archived'),
        axiosInstance.get('/finanzas/archived')
      ]);

      // Manejar elementos archivados
      const archivedData = [];
      if (results[10].status === 'fulfilled') {
        archivedData.push(...results[10].value.data.map(item => ({ ...item, type: 'reservas' })));
      }
      if (results[11].status === 'fulfilled') {
        archivedData.push(...results[11].value.data.map(item => ({ ...item, type: 'pagos' })));
      }
      if (results[12].status === 'fulfilled') {
        archivedData.push(...results[12].value.data.map(item => ({ ...item, type: 'finanzas' })));
      }
      setArchivedItems(archivedData);

      // Reportar errores
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error en la solicitud ${index}:`, result.reason);
          
          // No mostrar toast para errores 404 en solicitudes de elementos archivados (índices 10, 11, 12)
          const isArchivedRequest = index >= 10 && index <= 12;
          const is404Error = result.reason?.response?.status === 404;
          
          if (!(isArchivedRequest && is404Error)) {
            toast.error(`Error al cargar los datos de la solicitud ${index + 1}`);
          }
        }
      });
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [
    fetchUsersZustand, fetchReservationsZustand, fetchFinancesZustand, 
    fetchPackagesZustand, fetchCategoriesZustand, fetchExtrasZustand, 
    fetchFoodOptionsZustand, fetchThemesZustand, fetchMamparasZustand, 
    fetchPaymentsZustand, setLoading
  ]);

  useEffect(() => {
    // Inicializar datos y configurar Socket.IO
    fetchData().then(() => {
      // Usar la función initSocketListeners de reservationsStore para centralizar la lógica de sockets
      // Esta función se encarga de inicializar Socket.IO y configurar todos los listeners
      // También actualiza automáticamente el estado global de reservations en la tienda
      initSocketListeners({
        onReservaCreada: (nuevaReserva) => {
          console.log('Reserva creada recibida vía Socket.IO:', nuevaReserva);
          toast.success(`Nueva reserva #${nuevaReserva.id} creada`);
        },
        onReservaActualizada: (reservaActualizada) => {
          console.log('Reserva actualizada recibida vía Socket.IO:', reservaActualizada);
        },
        onReservaEliminada: (data) => {
          console.log('Reserva eliminada recibida vía Socket.IO:', data);
        },
        onFechasBloqueadas: (data) => {
          console.log('Fechas bloqueadas recibidas vía Socket.IO:', data);
          if (!data.reservas || !Array.isArray(data.reservas)) {
            // Si no tenemos datos completos de las reservas, recargar todo
            fetchData();
          }
        },
        onError: (error) => {
          console.error('Error en Socket.IO:', error);
          toast.error('Error en la comunicación en tiempo real');
        }
      });
    });

    // Limpieza al desmontar el componente
    return () => {
      // Desconectar y limpiar Socket.IO
      socketService.disconnect();
      // Limpiar listeners de Socket.IO
      useReservationsStore.getState().cleanupSocketListeners();
    };
  }, [fetchData, initSocketListeners]);

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

  // Función para filtrar datos por mes
  const filterDataByMonth = useCallback(
    (data, dateField) => {
      // Primero verificar si data es un array
      if (!Array.isArray(data)) return [];
      
      // Filtrar por mes
      return data.filter(item => {
        // Verificar que el item y el campo de fecha existen
        if (!item || !item[dateField]) return false;
        
        // Convertir a objeto Date
        const itemDate = new Date(item[dateField]);
        
        // Asegurarse de que la fecha es válida
        if (isNaN(itemDate.getTime())) return false;
        
        // Comparar tanto mes como año
        return itemDate.getMonth() === selectedMonth && 
               itemDate.getFullYear() === selectedYear;
      });
    },
    [selectedMonth, selectedYear]
  );

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
      await usePaymentsStore.getState().addPayment(paymentData);
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error al crear el pago:', error);
      toast.error('Error al crear el pago');
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  }, [navigate, fetchData, setIsPaymentModalOpen])

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
      await usePaymentsStore.getState().updatePaymentStatus(paymentId, newStatus);
      // Actualizar la UI con datos frescos
      await fetchData();
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error);
      toast.error('Error al actualizar el estado del pago');
      
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  }, [navigate, fetchData])

  const handleReservationStatusChange = useCallback(async (reservationId, newStatus) => {
    try {
      // Usar la tienda Zustand para actualizar el estado de la reserva
      await useReservationsStore.getState().updateReservationStatus(reservationId, newStatus);
      // No es necesario actualizar manualmente el estado local, ya que se actualizará
      // automáticamente desde la tienda al llamar a updateReservationStatus
      toast.success('Estado de la reserva actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar el estado de la reserva:', error);
      toast.error('Error al actualizar el estado de la reserva');
      
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    }
  }, [navigate])

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
        
        // Limpiar y validar los datos
        const cleanedData = removeCircularReferences(data)
        console.log('Datos limpios a enviar al servidor:', cleanedData)
        
        // Para reservas, validar y asegurar que id_usuario sea un número
        if (activeTab === 'reservations' && !cleanedData.id_usuario) {
          toast.error('Debe seleccionar un usuario para la reserva')
          setLoading(false)
          return
        }
        
        if (activeTab === 'reservations') {
          cleanedData.id_usuario = Number(cleanedData.id_usuario)
        }
        
        // Usar las tiendas Zustand para crear/actualizar
        let result;
        
        if (editingItem) {
          // Actualizar usando las tiendas Zustand
          switch (activeTab) {
            case 'users':
              result = await useUsersStore.getState().updateUser(editingItem.id, cleanedData);
              break;
            case 'reservations':
              result = await useReservationsStore.getState().updateReservation(editingItem.id, cleanedData);
              break;
            case 'finances':
              result = await useFinancesStore.getState().updateFinance(editingItem.id, cleanedData);
              break;
            case 'packages':
              result = await usePackagesStore.getState().updatePackage(editingItem.id, cleanedData);
              break;
            case 'extras':
              result = await useExtrasStore.getState().updateExtra(editingItem.id, cleanedData);
              break;
            case 'opcionesAlimento':
              result = await useFoodOptionsStore.getState().updateFoodOption(editingItem.id, cleanedData);
              break;
            case 'tematicas':
              result = await useThemesStore.getState().updateTheme(editingItem.id, cleanedData);
              break;
            case 'mamparas':
              result = await useMamparasStore.getState().updateMampara(editingItem.id, cleanedData);
              break;
            case 'payments':
              result = await usePaymentsStore.getState().updatePayment(editingItem.id, cleanedData);
              break;
            default:
              throw new Error('Tipo de formulario no reconocido');
          }
        } else {
          // Crear usando las tiendas Zustand
          switch (activeTab) {
            case 'users':
              result = await useUsersStore.getState().addUser(cleanedData);
              break;
            case 'reservations':
              result = await useReservationsStore.getState().addReservation(cleanedData);
              break;
            case 'finances':
              result = await useFinancesStore.getState().addFinance(cleanedData);
              break;
            case 'packages':
              result = await usePackagesStore.getState().addPackage(cleanedData);
              break;
            case 'extras':
              result = await useExtrasStore.getState().addExtra(cleanedData);
              break;
            case 'opcionesAlimento':
              result = await useFoodOptionsStore.getState().addFoodOption(cleanedData);
              break;
            case 'tematicas':
              result = await useThemesStore.getState().addTheme(cleanedData);
              break;
            case 'mamparas':
              result = await useMamparasStore.getState().addMampara(cleanedData);
              break;
            case 'payments':
              result = await usePaymentsStore.getState().addPayment(cleanedData);
              break;
            default:
              throw new Error('Tipo de formulario no reconocido');
          }
        }
        
        setIsModalOpen(false);
        // Actualizar la UI con datos frescos
        await fetchData();
        
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
    [activeTab, editingItem, fetchData, handleError, navigate, setLoading, setIsModalOpen]
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
        // Determinar qué tienda usar basado en el endpoint
        switch (endpoint) {
          case '/api/usuarios':
            await useUsersStore.getState().deleteUser(id);
            break;
          case '/api/reservas':
            await useReservationsStore.getState().deleteReservation(id);
            break;
          case '/api/finanzas':
            await useFinancesStore.getState().deleteFinance(id);
            break;
          case '/api/paquetes':
            await usePackagesStore.getState().deletePackage(id);
            break;
          case '/api/extras':
            await useExtrasStore.getState().deleteExtra(id);
            break;
          case '/api/opciones-alimentos':
            await useFoodOptionsStore.getState().deleteFoodOption(id);
            break;
          case '/api/tematicas':
            await useThemesStore.getState().deleteTheme(id);
            break;
          case '/api/mamparas':
            await useMamparasStore.getState().deleteMampara(id);
            break;
          case '/api/pagos':
            await usePaymentsStore.getState().deletePayment(id);
            break;
          default:
            // Si no hay una tienda específica para el endpoint, usar axios directamente
            await axiosInstance.delete(`${endpoint}/${id}`);
        }
        
        Swal.fire('¡Desactivado!', successMessage, 'success');
        // Actualizar la UI con datos frescos
        await fetchData();
      } catch (error) {
        handleError(error, 'desactivar');
      }
    }
  }

  // Eliminada la función local generateRandomPassword ya que la estamos importando desde useUiStore

  const handleDownloadFile = useCallback(async (id, type) => {
    try {
      // Usar la tienda Zustand para descargar el archivo
      const blob = await useFinancesStore.getState().downloadFinanceFile(id, type);
      
      // Crear URL para el blob y descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `finanza_${id}_${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Liberar la URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast.error('Error al descargar el archivo');
    }
  }, [])

  const handleViewDetails = useCallback(finance => {
    setSelectedFinance(finance)
  }, [])

  const handleAddCategory = useCallback(async newCategory => {
    try {
      await useCategoriesStore.getState().addCategory({
        nombre: newCategory.nombre,
        color: newCategory.color || '#000000'
      });
      // Actualizar categorías tras la adición
      const updatedCategories = await fetchCategoriesZustand();
      setCategories(updatedCategories);
      toast.success('Categoría añadida con éxito');
    } catch (error) {
      console.error('Error al añadir la categoría:', error);
      toast.error('Error al añadir la categoría');
    }
  }, [fetchCategoriesZustand])

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
      extras,
      currentUser
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

  
  // Renderizar componente del panel según la categoría activa
  const renderDashboardWidgets = () => {
    if (!isMainDashboard) return null;
    
    return (
      <div className='mb-8'>
        {/* Header del Dashboard con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
          <p className="text-indigo-100">Bienvenido al sistema de administración de Tramboory</p>
        </div>
        
        {/* Widgets de estadísticas */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-0 rounded-xl shadow-md overflow-hidden border border-indigo-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <UserSummary users={users} />
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white p-0 rounded-xl shadow-md overflow-hidden border border-green-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <ReservationSummary
              reservations={reservations}
              filterDataByMonth={filterDataByMonth}
            />
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white p-0 rounded-xl shadow-md overflow-hidden border border-purple-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Pagos</h2>
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <HiPlus className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-bold text-purple-600">{payments.length}</p>
              <p className="text-sm text-gray-500 mt-1">
                {payments.filter(p => p.estado === 'completado').length} completados
              </p>
            </div>
          </div>
        </div>
        
        {/* Widgets principales */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100 transform transition-all duration-300 hover:shadow-lg">
            <ReservationCalendar
              reservations={reservations}
              onSelectReservation={handleSelectReservation}
            />
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100 transform transition-all duration-300 hover:shadow-lg">
            <FinancialSummary
              finances={finances}
              filterDataByMonth={filterDataByMonth}
              categories={categories}
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Botón de acción contextual según la pestaña activa
  const renderActionButton = () => {
    // No mostrar botón en el dashboard principal
    if (isMainDashboard) return null;
    
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddItem}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <HiPlus className="mr-2" />
          Agregar {getActiveTabLabel()}
        </button>
      </div>
    );
  };
  
  // Obtener nombre amigable para la pestaña activa
  const getActiveTabLabel = () => {
    switch (activeTab) {
      case 'users': return 'Usuario';
      case 'reservations': return 'Reservación';
      case 'finances': return 'Registro';
      case 'payments': return 'Pago';
      case 'packages': return 'Paquete';
      case 'extras': return 'Extra';
      case 'opcionesAlimento': return 'Opción de Alimento';
      case 'tematicas': return 'Temática';
      case 'mamparas': return 'Mampara';
      case 'galeria': return 'Imagen';
      default: return 'Elemento';
    }
  };
  
  return (
    <CrmLayout>
      {isSmallScreen && showAlert && (
        <ScreenSizeAlert setShowAlert={setShowAlert} />
      )}
      
      {/* Widgets del dashboard principal, solo se muestran en la vista de dashboard */}
      {renderDashboardWidgets()}
      
      {/* Contenedor principal contextual */}
      <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100'>
        {/* Breadcrumb para navegación contextual */}
        <Breadcrumb 
          items={currentBreadcrumbItems} 
          onNavigate={handleBreadcrumbNavigation}
        />
        
        {/* Botón de acción contextual */}
        {renderActionButton()}
        {/* Contenido según pestaña activa */}
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
            handleViewUser={handleViewUser}
          />
        )}
        {activeTab === 'reservations' && (
          <ReservationTable
            reservations={filterDataByMonth(reservations, 'fecha_reserva')}
            reservationSearch={reservationSearch}
            setReservationSearch={setReservationSearch}
            handleViewReservation={handleViewReservation}
            handleEditItem={handleEditItem}
            handleDeleteItem={id =>
              handleDeleteItem(
                '/api/reservas',
                id,
                'Reserva desactivada con éxito'
              )
            }
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
        {activeTab === 'archived' && (
          <ArchivedTable
            items={archivedItems}
            itemSearch={archivedSearch}
            setItemSearch={setArchivedSearch}
            fetchData={fetchData}
            selectedMonth={selectedMonth}
            type="reservas"
          />
        )}
        {activeTab === 'galeria' && (
          <GaleriaManagement />
        )}
      </div>
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
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
          currentUser={currentUser}
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
      {isUserModalOpen && selectedUser && (
        <UserModal
          user={selectedUser}
          reservations={reservations.filter(res => res.id_usuario === selectedUser.id)}
          onClose={() => {
            setSelectedUser(null)
            setIsUserModalOpen(false)
          }}
          onEdit={handleEditItem}
          onSendEmail={() => toast.info(`Funcionalidad de enviar correo a ${selectedUser.email}`)}
        />
      )}
      {isReportModalOpen && (
        <MonthlyReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          finances={finances}
          categories={categories}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      )}
    </CrmLayout>
  )
}

export default Dashboard