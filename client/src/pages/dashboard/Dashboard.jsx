import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast, ToastContainer} from 'react-toastify';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import ScreenSizeAlert from './ScreenSizeAlert';
import UserSummary from './UserSummary';
import ReservationSummary from './ReservationSummary';
import FinancialSummary from './FinancialSummary';
import TabNavigation from './TabNavigation';
import UserTable from './UserTable';
import ReservationTable from './ReservationTable';
import FinanceTable from './FinanceTable';
import PackageTable from './PackageTable';
import MonthSelector from './MonthSelector';
import ReservationModal from './ReservationModal';
import ItemModal from './ItemModal';
import UserModal from './UserModal';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [finances, setFinances] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [packages, setPackages] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [reservationSearch, setReservationSearch] = useState('');
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userReservations, setUserReservations] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            fetchData(token);
        } else {
            console.error('No se encontró token de autenticación');
            navigate('/signin');
        }
    }, [navigate]);

    useEffect(() => {
        setFilteredUsers(users.filter((user) => user.nombre.toLowerCase().includes(userSearch.toLowerCase()) || user.email.toLowerCase().includes(userSearch.toLowerCase()) || (user.id_personalizado && user.id_personalizado
            .toLowerCase()
            .includes(userSearch.toLowerCase()))));
    }, [users, userSearch]);

    useEffect(() => {
        setFilteredReservations(reservations.filter((reservation) => reservation.id.toString().includes(reservationSearch) || (reservation.nombre_festejado && reservation.nombre_festejado
            .toLowerCase()
            .includes(reservationSearch.toLowerCase()))));
    }, [reservations, reservationSearch]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchData = async (token) => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const [usersResponse, reservationsResponse, financesResponse, packagesResponse] = await Promise.all([
                axios.get('/api/usuarios', config),
                axios.get('/api/reservas', config),
                axios.get('/api/finanzas', config),
                axios.get('/api/paquetes', config),
            ]);

            setUsers(usersResponse.data);
            setReservations(reservationsResponse.data);
            setFinances(financesResponse.data);
            setPackages(packagesResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Token inválido o expirado, redirigir al inicio de sesión
               // navigate('/signin');
            } else {
                toast.error('Error al cargar los datos');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleViewReservation = (reservation) => {
        setSelectedReservation(reservation);
        setIsReservationModalOpen(true);
    };

    const filterDataByMonth = (data, dateField) => {
        return data.filter((item) => {
            const itemDate = new Date(item[dateField]);
            return itemDate.getMonth() === selectedMonth;
        });
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id) => {
        try {
            const apiRoute = apiRoutes[activeTab];

            if (!apiRoute) {
                throw new Error(`Ruta de API no definida para el tab: ${activeTab}`);
            }

            const response = await axios.delete(`${apiRoute}/${id}`);
            if (response.status === 204) {
                toast.success('Elemento eliminado con éxito');
            } else {
                toast.error('Error al eliminar el elemento');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    toast.warning('El elemento ya no existe');
                } else {
                    toast.error(`Error del servidor: ${error.response.data.message || 'Algo salió mal'}`);
                }
            } else if (error.request) {
                toast.error('No se recibió respuesta del servidor');
            } else {
                toast.error('Error al eliminar el elemento');
            }
            console.error('Error al eliminar el elemento:', error);
        } finally {
            fetchData();
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get(`/api/reservas?userId=${user.id}`, config);
            setUserReservations(response.data);
            setIsUserModalOpen(true);
        } catch (error) {
            console.error('Error fetching user reservations:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Aquí podrías redirigir al usuario a la página de inicio de sesión
                navigate('/signin');
            } else {
                toast.error('Error al cargar las reservas del usuario');
            }
            setUserReservations([]);
        }
    };

    const handleCreateReservation = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/reservas', data, {
                headers: {
                    'Content-Type': 'application/json', Authorization: `Bearer ${token}`,
                },
            });

            toast.success('Reserva creada exitosamente');
            setIsModalOpen(false);
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
        users: '/api/usuarios', reservations: '/api/reservas', finances: '/api/finanzas', packages: '/api/paquetes',
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            let response;
            let successMessage;
            let endpoint;

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
                response = await axios.put(`${endpoint}/${editingItem.id}`, data, config);
            } else {
                response = await axios.post(endpoint, data, config);
            }

            if (response && response.status === 200) {
                toast.success(successMessage);
                setIsModalOpen(false);

                try {
                    // Refrescar el token
                    const refreshResponse = await axios.post('/api/auth/refresh-token', {}, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    // Actualizar el token en el almacenamiento local y en las cookies
                    localStorage.setItem('token', refreshResponse.data.token);
                    Cookies.set('token', refreshResponse.data.token, { expires: 1 });

                    // Llamar a fetchData con el token actualizado
                    await fetchData(refreshResponse.data.token);
                } catch (error) {
                    console.error('Error al refrescar el token:', error);
                    if (error.response && error.response.status === 401) {
                        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                        navigate('/signin');
                    } else {
                        toast.error('Error al refrescar la sesión. Por favor, intenta nuevamente.');
                    }
                }
            } else {
                throw new Error('Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            if (error.response && error.response.status === 401) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                navigate('/signin');
            } else if (error.response) {
                toast.error(error.response.data.message || 'Error al procesar la solicitud');
            } else if (error.request) {
                toast.error('No se recibió respuesta del servidor');
            } else {
                toast.error('Error al procesar la solicitud');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateRandomPassword = () => {
        const adjectives = ['Happy', 'Silly', 'Funny', 'Crazy', 'Lucky', 'Sunny', 'Brave', 'Kind', 'Cute', 'Cool', 'Fast', 'Smart', 'Strong', 'Wise',];
        const nouns = ['Cat', 'Dog', 'Bird', 'Fish', 'Panda', 'Koala', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Laundry', 'Pencil', 'Computer', 'Phone',];
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const number = numbers[Math.floor(Math.random() * numbers.length)];

        const password = `${adjective}${noun}${number}`;
        setGeneratedPassword(password);
    };

    return (<div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
        {isSmallScreen && showAlert && <ScreenSizeAlert setShowAlert={setShowAlert}/>}
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
        <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">
            Panel de Control
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <UserSummary users={users}/>
            <ReservationSummary reservations={reservations} filterDataByMonth={filterDataByMonth}/>
            <FinancialSummary finances={finances} filterDataByMonth={filterDataByMonth}/>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
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
                    handleDeleteItem={handleDeleteItem}
                    handleViewUser={handleViewUser}  // Añade esta línea
                />
            )}
            {activeTab === 'reservations' && (<ReservationTable
                reservations={filteredReservations}
                reservationSearch={reservationSearch}
                setReservationSearch={setReservationSearch}
                handleViewReservation={handleViewReservation}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
            />)}
            {activeTab === 'finances' && (<FinanceTable
                finances={filterDataByMonth(finances, 'fecha')}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
            />)}
            {activeTab === 'packages' && (<PackageTable
                packages={packages}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
            />)}
        </div>

        <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}/>
        {isReservationModalOpen && (<ReservationModal
            reservation={selectedReservation}
            onClose={() => setIsReservationModalOpen(false)}
        />)}
        {isModalOpen && (<ItemModal
            activeTab={activeTab}
            editingItem={editingItem}
            setIsModalOpen={setIsModalOpen}
            handleSubmit={handleSubmit}
            generateRandomPassword={generateRandomPassword}
            generatedPassword={generatedPassword}
            users={users}
            packages={packages}
            reservations={reservations}
            loading={loading}
        />)}


    </div>);
};

export default Dashboard;