import { useState, useEffect } from 'react';
import axios from '../components/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  FiAlertCircle,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiDollarSign,
  FiEdit2,
  FiEye,
  FiGift,
  FiImage,
  FiMessageSquare,
  FiPackage,
  FiPlusCircle,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX
} from 'react-icons/fi';
import { FaBirthdayCake } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Dashboard = () => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [reservations, setReservations] = useState([])
    const [filteredReservations, setFilteredReservations] = useState([])
    const [finances, setFinances] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [packages, setPackages] = useState([])
    const [activeTab, setActiveTab] = useState('users')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [userSearch, setUserSearch] = useState('')
    const [reservationSearch, setReservationSearch] = useState('')
    const {register, handleSubmit, reset, setValue} = useForm()
    const [selectedReservation, setSelectedReservation] = useState(null)
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [showAlert, setShowAlert] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        const token = Cookies.get('token')
        if (token) {
            fetchData(token)
        } else {
            console.error('No se encontró token de autenticación')
            navigate('/signin')
        }
    }, [navigate])

    useEffect(() => {
        setFilteredUsers(users.filter(user => user.nombre.toLowerCase().includes(userSearch.toLowerCase()) || user.email.toLowerCase().includes(userSearch.toLowerCase()) || (user.id_personalizado && user.id_personalizado
            .toLowerCase()
            .includes(userSearch.toLowerCase()))))
    }, [users, userSearch])

    useEffect(() => {
        setFilteredReservations(reservations.filter(reservation => reservation.id.toString().includes(reservationSearch) || (reservation.nombre_festejado && reservation.nombre_festejado
            .toLowerCase()
            .includes(reservationSearch.toLowerCase()))))
    }, [reservations, reservationSearch])

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    useEffect(() => {
        // Asegúrate de que los elementos existan antes de animarlos
        const formElement = document.querySelector('.form-class')
        const summaryElement = document.querySelector('.summary-class')

        if (formElement && summaryElement) {
            gsap.fromTo(formElement, {opacity: 0, x: -50}, {
                opacity: 1, x: 0, duration: 1, scrollTrigger: {trigger: formElement, start: 'top 80%'}
            })
            gsap.fromTo(summaryElement, {opacity: 0, x: 50}, {
                opacity: 1, x: 0, duration: 1, scrollTrigger: {trigger: summaryElement, start: 'top 80%'}
            })
        }
    }, [])

    const ScreenSizeAlert = () => (
        <div className='fixed top-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-3 shadow-md z-50'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <FiAlertCircle className='mr-2'/>
                    <p>
                        Para una mejor experiencia, se recomienda usar un iPad o dispositivo
                        con pantalla más grande.
                    </p>
                </div>
                <button
                    onClick={() => setShowAlert(false)}
                    className='text-yellow-800 hover:text-yellow-900'
                >
                    <FiX size={24}/>
                </button>
            </div>
        </div>)

    const fetchData = async token => {
        setLoading(true)
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

            const [usersResponse, reservationsResponse, financesResponse, packagesResponse] = await Promise.all([axios.get('/api/usuarios', config), axios.get('/api/reservas', config), axios.get('/api/finanzas', config), axios.get('/api/paquetes', config)])

            setUsers(usersResponse.data)
            setReservations(reservationsResponse.data)
            setFinances(financesResponse.data)
            setPackages(packagesResponse.data)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }
    const handleViewReservation = reservation => {
        setSelectedReservation(reservation)
        setIsReservationModalOpen(true)
    }

    const filterDataByMonth = (data, dateField) => {
        return data.filter(item => {
            const itemDate = new Date(item[dateField])
            return itemDate.getMonth() === selectedMonth
        })
    }

    const handleAddItem = () => {
        setEditingItem(null)
        reset()
        setIsModalOpen(true)
    }

    const handleEditItem = item => {
        setEditingItem(item)
        Object.keys(item).forEach(key => {
            setValue(key, item[key])
        })
        setIsModalOpen(true)
    }

    const handleDeleteItem = async id => {
        try {
            const apiRoute = apiRoutes[activeTab]

            if (!apiRoute) {
                throw new Error(`Ruta de API no definida para el tab: ${activeTab}`)
            }

            const response = await axios.delete(`${apiRoute}/${id}`)
            if (response.status === 204) {
                toast.success('Elemento eliminado con éxito')
            } else {
                toast.error('Error al eliminar el elemento')
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    toast.warning('El elemento ya no existe')
                } else {
                    toast.error(`Error del servidor: ${error.response.data.message || 'Algo salió mal'}`)
                }
            } else if (error.request) {
                toast.error('No se recibió respuesta del servidor')
            } else {
                toast.error('Error al eliminar el elemento')
            }
            console.error('Error al eliminar el elemento:', error)
        } finally {
            fetchData()
        }
    }

  const handleCreateReservation = async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/reservas', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Reserva creada exitosamente');
      closeModal();
      fetchReservations();
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Error al crear la reserva');
      } else {
        toast.error('No se pudo conectar con el servidor. Revisa tu conexión a internet');
      }
    } finally {
      setLoading(false);
    }
  };

  const apiRoutes = {
    users: '/api/usuarios',
    reservations: '/api/reservas',
    finances: '/api/finanzas',
    packages: '/api/paquetes'
  };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (activeTab === 'reservations' && modalMode === 'create') {
              await handleCreateReservation(data);
              const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No se encontró token de autenticación');
                }

                const response = await axios.post('/api/reservas', data, {
                    headers: {
                        'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
                    }
                });

                toast.success('Reserva creada exitosamente');
                closeModal();
                fetchReservations(); // Asegúrate de tener esta función para actualizar la lista de reservas
            } else if (activeTab === 'users' && modalMode === 'create') {
                // Lógica para crear un nuevo usuario
                // ...
            } else if (modalMode === 'edit') {
                // Lógica para editar un elemento existente
                // ...
            } else {
                // Inicio de sesión (código existente)
                const response = await axios.post('/api/auth/login', data, {
                    withCredentials: true, headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const {message, userType, token} = response.data;

                localStorage.setItem('token', token);
                console.log('Token guardado:', token);

                toast.success(message || 'Inicio de sesión exitoso');

                setTimeout(() => {
                    if (userType === 'admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/reservations');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error en onSubmit:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    if (error.response.data.message === 'User not found') {
                        toast.error('El usuario no existe');
                    } else {
                        toast.error('El correo electrónico o la contraseña son incorrectos');
                    }
                } else if (error.response.status === 500) {
                    toast.error('Error del servidor. Por favor, intenta de nuevo más tarde');
                } else {
                    toast.error(error.response.data?.message || 'Error desconocido al procesar la solicitud');
                }
            } else if (error.request) {
                toast.error('No se pudo conectar con el servidor. Revisa tu conexión a internet');
            } else {
                toast.error('Error al procesar la solicitud: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };
    const renderForm = () => {
        switch (activeTab) {
            case 'users':
                return (<>
                        <input
                            {...register('nombre')}
                            placeholder='Nombre'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('email')}
                            placeholder='Email'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('telefono')}
                            placeholder='Teléfono'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('direccion')}
                            placeholder='Dirección'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('id_personalizado')}
                            placeholder='ID Personalizado'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <select
                            {...register('tipo_usuario')}
                            className='w-full mb-2 p-2 border rounded'
                        >
                            <option value=''>Seleccionar tipo de usuario</option>
                            <option value='cliente'>Cliente</option>
                            <option value='admin'>Administrador</option>
                        </select>
                        <input
                            {...register('clave')}
                            type='password'
                            placeholder='Contraseña'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <button
                            type='button'
                            onClick={generateRandomPassword}
                            className='bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600'
                        >
                            Generar contraseña aleatoria
                        </button>
                        {generatedPassword && (<p className='mt-2'>
                                Contraseña generada: <strong>{generatedPassword}</strong>
                            </p>)}
                    </>)
            case 'reservations':
                return (<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='flex items-center'>
                            <FiUser className='mr-2 text-indigo-600'/>
                            <select
                                {...register('id_usuario')}
                                className='w-full p-2 border rounded'
                            >
                                <option value=''>Seleccionar usuario</option>
                                {users.map(user => (<option key={user.id} value={user.id}>
                                        {user.nombre}
                                    </option>))}
                            </select>
                        </div>
                        <div className='flex items-center'>
                            <FiPackage className='mr-2 text-indigo-600'/>
                            <select
                                {...register('id_paquete')}
                                className='w-full p-2 border rounded'
                                onChange={e => setValue('total', packages.find(p => p.id === parseInt(e.target.value))?.precio || 0)}
                            >
                                <option value=''>Seleccionar paquete</option>
                                {packages.map(pkg => (<option key={pkg.id} value={pkg.id}>
                                        {pkg.nombre} - ${pkg.precio}
                                    </option>))}
                            </select>
                        </div>
                        <div className='flex items-center'>
                            <FiCalendar className='mr-2 text-indigo-600'/>
                            <input
                                {...register('fecha_reserva')}
                                type='date'
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <div className='flex items-center'>
                            <FiClock className='mr-2 text-indigo-600'/>
                            <select
                                {...register('hora_inicio')}
                                className='w-full p-2 border rounded'
                            >
                                <option value=''>Seleccionar hora</option>
                                <option value='mañana'>Mañana</option>
                                <option value='tarde'>Tarde</option>
                            </select>
                        </div>
                        <div className='flex items-center'>
                            <FiCheckCircle className='mr-2 text-indigo-600'/>
                            <select
                                {...register('estado')}
                                className='w-full p-2 border rounded'
                            >
                                <option value=''>Seleccionar estado</option>
                                <option value='pendiente'>Pendiente</option>
                                <option value='confirmada'>Confirmada</option>
                                <option value='cancelada'>Cancelada</option>
                            </select>
                        </div>
                        <div className='flex items-center'>
                            <FiDollarSign className='mr-2 text-indigo-600'/>
                            <input
                                {...register('total')}
                                type='number'
                                step='0.01'
                                placeholder='Total'
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <div className='flex items-center'>
                            <FiUser className='mr-2 text-indigo-600'/>
                            <input
                                {...register('nombre_festejado')}
                                placeholder='Nombre del festejado'
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <div className='flex items-center'>
                            <FaBirthdayCake className='mr-2 text-indigo-600'/>
                            <input
                                {...register('edad_festejado')}
                                type='number'
                                placeholder='Edad del festejado'
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <div className='flex items-center'>
                            <FiGift className='mr-2 text-indigo-600'/>
                            <input
                                {...register('tematica')}
                                placeholder='Temática'
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <div className='flex items-center space-x-4'>
                            <div className='flex items-center'>
                                <FiCoffee className='mr-2 text-indigo-600'/>
                                <input
                                    {...register('cupcake')}
                                    type='checkbox'
                                    className='mr-2'
                                />
                                <label>Cupcake</label>
                            </div>
                            <div className='flex items-center'>
                                <FiImage className='mr-2 text-indigo-600'/>
                                <input
                                    {...register('mampara')}
                                    type='checkbox'
                                    className='mr-2'
                                />
                                <label>Mampara</label>
                            </div>
                            <div className='flex items-center'>
                                <FiBox className='mr-2 text-indigo-600'/>
                                <input
                                    {...register('piñata')}
                                    type='checkbox'
                                    className='mr-2'
                                />
                                <label>Piñata</label>
                            </div>
                        </div>
                        <div className='col-span-2 flex items-start'>
                            <FiMessageSquare className='mr-2 text-indigo-600 mt-1'/>
                            <textarea
                                {...register('comentarios')}
                                placeholder='Comentarios'
                                className='w-full p-2 border rounded'
                                rows='3'
                            />
                        </div>
                    </div>)
            case 'finances':
                return (<>
                        <select
                            {...register('tipo')}
                            className='w-full mb-2 p-2 border rounded'
                        >
                            <option value=''>Seleccionar tipo</option>
                            <option value='ingreso'>Ingreso</option>
                            <option value='gasto'>Gasto</option>
                        </select>
                        <input
                            {...register('monto')}
                            type='number'
                            step='0.01'
                            placeholder='Monto'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('fecha')}
                            type='date'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <input
                            {...register('descripcion')}
                            placeholder='Descripción'
                            className='w-full mb-2 p-2 border rounded'
                        />
                        <select
                            {...register('id_reserva')}
                            className='w-full mb-2 p-2 border rounded'
                        >
                            <option value=''>Sin reserva asociada</option>
                            {reservations.map(reserva => (<option key={reserva.id} value={reserva.id}>
                                    Reserva #{reserva.id} -{' '}
                                    {new Date(reserva.fecha_reserva).toLocaleDateString()}
                                </option>))}
                        </select>
                    </>)
            case 'packages':
                return (<>
                        <div className='mb-4'>
                            <label
                                htmlFor='nombre'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Nombre
                            </label>
                            <input
                                {...register('nombre')}
                                type='text'
                                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                            />
                        </div>
                        <div className='mb-4'>
                            <label
                                htmlFor='descripcion'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Descripción
                            </label>
                            <textarea
                                {...register('descripcion')}
                                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                            />
                        </div>
                        <div className='mb-4'>
                            <label
                                htmlFor='precio'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Precio
                            </label>
                            <input
                                {...register('precio')}
                                type='number'
                                step='0.01'
                                className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                            />
                        </div>
                    </>)
            default:
                return null
        }
    }

    const renderTable = () => {
        switch (activeTab) {
            case 'users':
                return (<>
                        <div className='mb-4'>
                            <input
                                type='text'
                                placeholder='Buscar usuario...'
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <table className='w-full'>
                            <thead>
                            <tr className='bg-gray-100'>
                                <th className='px-4 py-2 text-left'>ID Personalizado</th>
                                <th className='px-4 py-2 text-left'>Nombre</th>
                                <th className='px-4 py-2 text-left'>Email</th>
                                <th className='px-4 py-2 text-left'>Tipo de Usuario</th>
                                <th className='px-4 py-2 text-left'>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.map(user => (<tr
                                    key={user.id}
                                    className='border-b border-gray-200 hover:bg-gray-50'
                                >
                                    <td className='px-4 py-2'>
                                        {user.id_personalizado || 'N/A'}
                                    </td>
                                    <td className='px-4 py-2'>{user.nombre}</td>
                                    <td className='px-4 py-2'>{user.email}</td>
                                    <td className='px-4 py-2'>
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                      >
                        {user.tipo_usuario}
                      </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        <button
                                            onClick={() => handleEditItem(user)}
                                            className='text-blue-500 hover:text-blue-700 mr-2'
                                        >
                                            <FiEdit2/>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(user.id)}
                                            className='text-red-500 hover:text-red-700'
                                        >
                                            <FiTrash2/>
                                        </button>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </>)
            case 'reservations':
                return (<>
                        <div className='mb-4'>
                            <input
                                type='text'
                                placeholder='Buscar reserva...'
                                value={reservationSearch}
                                onChange={e => setReservationSearch(e.target.value)}
                                className='w-full p-2 border rounded'
                            />
                        </div>
                        <table className='w-full'>
                            <thead>
                            <tr className='bg-gray-100'>
                                <th className='px-4 py-2 text-left'>Nº Reserva</th>
                                <th className='px-4 py-2 text-left'>Cliente</th>
                                <th className='px-4 py-2 text-left'>Fecha</th>
                                <th className='px-4 py-2 text-left'>Estado</th>
                                <th className='px-4 py-2 text-left'>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredReservations.map(reservation => (<tr
                                    key={reservation.id}
                                    className='border-b border-gray-200 hover:bg-gray-50'
                                >
                                    <td className='px-4 py-2'>{reservation.id}</td>
                                    <td className='px-4 py-2'>{reservation.nombre_cliente}</td>
                                    <td className='px-4 py-2'>{reservation.fecha_reserva}</td>
                                    <td className='px-4 py-2'>
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${reservation.estado === 'confirmada' ? 'bg-green-100 text-green-800' : reservation.estado === 'cancelada' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {reservation.estado}
                      </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        <button
                                            onClick={() => handleViewReservation(reservation)}
                                            className='text-blue-500 hover:text-blue-700 mr-2'
                                        >
                                            <FiEye/>
                                        </button>
                                        <button
                                            onClick={() => handleEditItem(reservation)}
                                            className='text-green-500 hover:text-green-700 mr-2'
                                        >
                                            <FiEdit2/>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(reservation.id)}
                                            className='text-red-500 hover:text-red-700'
                                        >
                                            <FiTrash2/>
                                        </button>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </>)
            case 'finances':
                return (<table className='w-full'>
                        <thead>
                        <tr className='bg-gray-100'>
                            <th className='px-4 py-2 text-left'>Descripción</th>
                            <th className='px-4 py-2 text-left'>Monto</th>
                            <th className='px-4 py-2 text-left'>Fecha</th>
                            <th className='px-4 py-2 text-left'>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filterDataByMonth(finances, 'fecha').map(finance => (<tr
                                key={finance.id}
                                className='border-b border-gray-200 hover:bg-gray-50'
                            >
                                <td className='px-4 py-2'>{finance.descripcion}</td>
                                <td
                                    className={`px-4 py-2 ${finance.tipo === 'ingreso' ? 'text-blue-600' : 'text-red-600'}`}
                                >
                                    {finance.tipo === 'ingreso' ? '$' : '-$'}
                                    {Math.abs(finance.monto)}
                                </td>
                                <td className='px-4 py-2'>{finance.fecha}</td>
                                <td className='px-4 py-2'>
                                    <button
                                        onClick={() => handleEditItem(finance)}
                                        className='text-blue-500 hover:text-blue-700 mr-2'
                                    >
                                        <FiEdit2/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(finance.id)}
                                        className='text-red-500 hover:text-red-700'
                                    >
                                        <FiTrash2/>
                                    </button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>)

            case 'packages':
                return (<table className='w-full'>
                        <thead>
                        <tr className='bg-gray-100'>
                            <th className='px-4 py-2 text-left'>Nombre</th>
                            <th className='px-4 py-2 text-left'>Descripción</th>
                            <th className='px-4 py-2 text-left'>Precio</th>
                            <th className='px-4 py-2 text-left'>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {packages.map(pkg => (<tr
                                key={pkg.id}
                                className='border-b border-gray-200 hover:bg-gray-50'
                            >
                                <td className='px-4 py-2'>{pkg.nombre}</td>
                                <td className='px-4 py-2'>{pkg.descripcion}</td>
                                <td className='px-4 py-2'>${pkg.precio}</td>
                                <td className='px-4 py-2'>
                                    <button
                                        onClick={() => handleEditItem(pkg)}
                                        className='text-blue-500 hover:text-blue-700 mr-2'
                                    >
                                        <FiEdit2/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(pkg.id)}
                                        className='text-red-500 hover:text-red-700'
                                    >
                                        <FiTrash2/>
                                    </button>
                                </td>
                            </tr>))}
                        </tbody>
                    </table>)
            default:
                return null
        }
    }

    const chartData = {
        labels: ['Ingresos', 'Gastos'], datasets: [{
            label: 'Finanzas',
            data: [filterDataByMonth(finances, 'fecha').reduce((sum, f) => sum + (f.tipo === 'ingreso' ? f.monto : 0), 0), -filterDataByMonth(finances, 'fecha').reduce(// Agregar un signo menos aquí
                (sum, f) => sum + (f.tipo === 'gasto' ? f.monto : 0), 0)],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)']
        }]
    }

    const chartOptions = {
        responsive: true, plugins: {
            legend: {
                position: 'top'
            }, title: {
                display: true, text: 'Resumen Financiero'
            }
        }, scales: {
            // Agregar esta sección para configurar los ejes
            y: {
                beginAtZero: true, ticks: {
                    callback: function (value, index, values) {
                        return '$' + Math.abs(value) // Mostrar los valores absolutos con un signo de dólar
                    }
                }
            }
        }
    }

    const generateRandomPassword = () => {
        const adjectives = ['Happy', 'Silly', 'Funny', 'Crazy', 'Lucky', 'Sunny', 'Brave', 'Kind', 'Cute', 'Cool', 'Fast', 'Smart', 'Strong', 'Wise']
        const nouns = ['Cat', 'Dog', 'Bird', 'Fish', 'Panda', 'Koala', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Laundry', 'Pencil', 'Computer', 'Phone']
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
        const noun = nouns[Math.floor(Math.random() * nouns.length)]
        const number = numbers[Math.floor(Math.random() * numbers.length)]

        const password = `${adjective}${noun}${number}`
        setGeneratedPassword(password)
    }

    const ReservationModal = ({reservation, onClose}) => {
        if (!reservation) return null

        return (<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-8 max-w-2xl w-full max-h-90vh overflow-y-auto'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-2xl font-bold'>Detalles de la Reserva</h2>
                        <button
                            onClick={onClose}
                            className='text-gray-500 hover:text-gray-700'
                        >
                            <FiX size={24}/>
                        </button>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='col-span-2 flex items-center'>
                            <FiCalendar className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Nº Reserva:</span>
                            <span className='ml-2'>{reservation.id}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiUser className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Cliente:</span>
                            <span className='ml-2'>{reservation.nombre_cliente}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiCalendar className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Fecha:</span>
                            <span className='ml-2'>{reservation.fecha_reserva}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiClock className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Hora:</span>
                            <span className='ml-2'>{reservation.hora_inicio}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiPackage className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Paquete:</span>
                            <span className='ml-2'>{reservation.nombre_paquete}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiDollarSign className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Total:</span>
                            <span className='ml-2'>${reservation.total}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiUser className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Festejado:</span>
                            <span className='ml-2'>{reservation.nombre_festejado}</span>
                        </div>
                        <div className='flex items-center'>
                            <FaBirthdayCake className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Edad:</span>
                            <span className='ml-2'>{reservation.edad_festejado} años</span>
                        </div>
                        <div className='col-span-2 flex items-center'>
                            <FiGift className='mr-2 text-indigo-600'/>
                            <span className='font-semibold'>Temática:</span>
                            <span className='ml-2'>{reservation.tematica}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiCheckCircle
                                className={`mr-2 ${reservation.cupcake ? 'text-green-600' : 'text-red-600'}`}
                            />
                            <span className='font-semibold'>Cupcake:</span>
                            <span className='ml-2'>{reservation.cupcake ? 'Sí' : 'No'}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiCheckCircle
                                className={`mr-2 ${reservation.mampara ? 'text-green-600' : 'text-red-600'}`}
                            />
                            <span className='font-semibold'>Mampara:</span>
                            <span className='ml-2'>{reservation.mampara ? 'Sí' : 'No'}</span>
                        </div>
                        <div className='flex items-center'>
                            <FiCheckCircle
                                className={`mr-2 ${reservation.piñata ? 'text-green-600' : 'text-red-600'}`}
                            />
                            <span className='font-semibold'>Piñata:</span>
                            <span className='ml-2'>{reservation.piñata ? 'Sí' : 'No'}</span>
                        </div>
                        <div className='col-span-2 flex items-start'>
                            <FiMessageSquare className='mr-2 text-indigo-600 mt-1'/>
                            <span className='font-semibold'>Comentarios:</span>
                            <span className='ml-2'>
                {reservation.comentarios || 'Sin comentarios'}
              </span>
                        </div>
                    </div>
                </div>
            </div>)
    }

    return (<div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8'>
            {isSmallScreen && showAlert && <ScreenSizeAlert/>}
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <h1 className='text-4xl font-bold mb-8 text-center text-indigo-800'>
                Panel de Control
            </h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
                <motion.div
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className='bg-white rounded-lg shadow-lg p-6'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-2xl font-semibold text-gray-800'>Usuarios</h2>
                        <FiUsers className='text-3xl text-indigo-500'/>
                    </div>
                    <p className='text-4xl font-bold text-indigo-600'>{users.length}</p>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                    className='bg-white rounded-lg shadow-lg p-6'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-2xl font-semibold text-gray-800'>Reservas</h2>
                        <FiCalendar className='text-3xl text-green-500'/>
                    </div>
                    <p className='text-4xl font-bold text-green-600'>
                        {filterDataByMonth(reservations, 'fecha_reserva').length}
                    </p>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 50}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                    className='bg-white rounded-lg shadow-lg p-6'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-2xl font-semibold text-gray-800'>Finanzas</h2>
                        <FiDollarSign className='text-3xl text-yellow-500'/>
                    </div>
                    <Bar data={chartData} options={chartOptions}/>
                </motion.div>
            </div>

            <div className='bg-white rounded-lg shadow-lg p-6'>
                <div className='flex justify-between items-center mb-4'>
                    <div className='flex space-x-4'>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'reservations' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Reservas
                        </button>
                        <button
                            onClick={() => setActiveTab('finances')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'finances' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Finanzas
                        </button>

                        <button
                            onClick={() => setActiveTab('packages')}
                            className={`px-4 py-2 rounded-lg ${activeTab === 'packages' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Paquetes
                        </button>
                    </div>
                    <button
                        onClick={handleAddItem}
                        className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 flex items-center'
                    >
                        <FiPlusCircle className='mr-2'/> Agregar
                    </button>
                </div>
                <div className='overflow-x-auto'>{renderTable()}</div>
            </div>

            <div className='mt-8 flex justify-end'>
                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(parseInt(e.target.value))}
                    className='bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                >
                    <option value={0}>Enero</option>
                    <option value={1}>Febrero</option>
                    <option value={2}>Marzo</option>
                    <option value={3}>Abril</option>
                    <option value={4}>Mayo</option>
                    <option value={5}>Junio</option>
                    <option value={6}>Julio</option>
                    <option value={7}>Agosto</option>
                    <option value={8}>Septiembre</option>
                    <option value={9}>Octubre</option>
                    <option value={10}>Noviembre</option>
                    <option value={11}>Diciembre</option>
                </select>
            </div>

            {isReservationModalOpen && (<ReservationModal
                    reservation={selectedReservation}
                    onClose={() => setIsReservationModalOpen(false)}
                />)}

            {isModalOpen && (<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
                    <div className='bg-white rounded-lg p-8 w-full max-w-4xl max-h-90vh overflow-y-auto'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-semibold'>
                                {editingItem ? 'Editar' : 'Agregar'} {activeTab.slice(0, -1)}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <FiX size={24}/>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {renderForm()}
                            <div className='flex justify-end mt-4'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 mr-2'
                                >
                                    Cancelar
                                </button>
                                <button
                                    type='submit'
                                    className='bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600'
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>)}
        </div>)
}

export default Dashboard
