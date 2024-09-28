import axios from 'axios';
import Cookies from 'js-cookie';

export const fetchData = async (token, setData, setLoading, toast, navigate) => {
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

        setData({
            users: usersResponse.data,
            reservations: reservationsResponse.data,
            finances: financesResponse.data,
            packages: packagesResponse.data,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
        if (error.response && error.response.status === 401) {
            navigate('/signin');
        }
    } finally {
        setLoading(false);
    }
};

export const filterDataByMonth = (data, dateField, month) => {
    return data.filter((item) => {
        const itemDate = new Date(item[dateField]);
        return itemDate.getMonth() === month;
    });
};