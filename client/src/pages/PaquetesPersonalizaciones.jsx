import  {useState, useEffect} from 'react';
import axios from 'axios';
import {useForm} from 'react-hook-form';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FiEdit, FiTrash2, FiPlus, FiSearch, FiSun, FiMoon} from 'react-icons/fi';
import Modal from 'react-modal';
import {CSVLink} from 'react-csv';
import {Page, Text, View, Document, StyleSheet} from '@react-pdf/renderer';

const Dashboard = () => {
    const [paquetes, setPaquetes] = useState([]);
    const [personalizaciones, setPersonalizaciones] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const {register, handleSubmit, reset} = useForm();

    useEffect(() => {
        fetchPaquetes();
        fetchPersonalizaciones();
    }, []);

    const fetchPaquetes = async () => {
        try {
            const response = await axios.get('/api/paquetes');
            setPaquetes(response.data);
        } catch (error) {
            console.error('Error al obtener los paquetes:', error);
            toast.error('Error al cargar los paquetes');
        }
    };

    const fetchPersonalizaciones = async () => {
        try {
            const response = await axios.get('/api/personalizaciones');
            setPersonalizaciones(response.data);
        } catch (error) {
            console.error('Error al obtener las personalizaciones:', error);
            toast.error('Error al cargar las personalizaciones');
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedItem(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (modalMode === 'edit') {
                await axios.put(`/api/${selectedItem.type}/${selectedItem.id}`, data);
                toast.success(`${selectedItem.type === 'paquetes' ? 'Paquete' : 'Personalización'} actualizado con éxito`);
            } else {
                await axios.post(`/api/${selectedItem.type}`, data);
                toast.success(`${selectedItem.type === 'paquetes' ? 'Paquete' : 'Personalización'} creado con éxito`);
            }
            closeModal();
            fetchPaquetes();
            fetchPersonalizaciones();
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar');
        }
    };

    const handleDelete = async (type, id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
            try {
                await axios.delete(`/api/${type}/${id}`);
                toast.success(`${type === 'paquetes' ? 'Paquete' : 'Personalización'} eliminado con éxito`);
                fetchPaquetes();
                fetchPersonalizaciones();
            } catch (error) {
                console.error('Error al eliminar:', error);
                toast.error('Error al eliminar');
            }
        }
    };

    const filteredPaquetes = paquetes.filter((paquete) =>
        paquete.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPersonalizaciones = personalizaciones.filter((personalizacion) =>
        personalizacion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const renderCSV = (data) => {
        const headers = ['ID', 'Nombre', 'Precio'];
        const csvData = data.map((item) => [item.id, item.nombre, item.precio || item.precio_adicional]);
        return {data: csvData, headers: headers};
    };

    const renderPDF = (data) => (
        <Document>
            <Page style={styles.page}>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>ID</Text>
                        <Text style={styles.tableHeader}>Nombre</Text>
                        <Text style={styles.tableHeader}>Precio</Text>
                    </View>
                    {data.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.id}</Text>
                            <Text style={styles.tableCell}>{item.nombre}</Text>
                            <Text style={styles.tableCell}>{item.precio || item.precio_adicional}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );

    return (
        <div className={`container mx-auto px-4 py-8 ${darkMode ? 'dark' : ''}`}>
            <ToastContainer/>
            <nav className="flex items-center justify-between mb-8">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</div>
                <div className="flex items-center">
                    <button
                        className="p-2 rounded-full focus:outline-none focus:shadow-outline-gray"
                        onClick={toggleDarkMode}
                        aria-label="Toggle color mode"
                    >
                        {darkMode ? (
                            <FiSun className="w-5 h-5 text-gray-800 dark:text-white"/>
                        ) : (
                            <FiMoon className="w-5 h-5 text-gray-800 dark:text-white"/>
                        )}
                    </button>
                </div>
            </nav>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Resumen de Paquetes</h3>
                    <p className="text-3xl font-bold text-blue-500">{paquetes.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Resumen de
                        Personalizaciones</h3>
                    <p className="text-3xl font-bold text-blue-500">{personalizaciones.length}</p>
                </div>
            </div>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paquetes y Personalizaciones</h2>
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                            onClick={() => openModal('create', {type: 'paquetes'})}
                        >
                            <FiPlus className="inline-block mr-2"/>
                            Nuevo Paquete
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => openModal('create', {type: 'personalizaciones'})}
                        >
                            <FiPlus className="inline-block mr-2"/>
                            Nueva Personalización
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Paquetes</h3>
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead>
                                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Nombre</th>
                                    <th className="py-3 px-6 text-left">Precio</th>
                                    <th className="py-3 px-6 text-center">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="text-gray-600 dark:text-gray-100 text-sm">
                                {filteredPaquetes.map((paquete) => (
                                    <tr key={paquete.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{paquete.nombre}</td>
                                        <td className="py-3 px-6 text-left">${paquete.precio}</td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center">
                                                <div
                                                    className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer"
                                                    onClick={() => openModal('edit', {...paquete, type: 'paquetes'})}
                                                >
                                                    <FiEdit/>
                                                </div>
                                                <div
                                                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                                                    onClick={() => handleDelete('paquetes', paquete.id)}
                                                >
                                                    <FiTrash2/>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Personalizaciones</h3>
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead>
                                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Nombre</th>
                                    <th className="py-3 px-6 text-left">Precio Adicional</th>
                                    <th className="py-3 px-6 text-center">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="text-gray-600 dark:text-gray-100 text-sm">
                                {filteredPersonalizaciones.map((personalizacion) => (
                                    <tr key={personalizacion.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{personalizacion.nombre}</td>
                                        <td className="py-3 px-6 text-left">${personalizacion.precio_adicional}</td>
                                        <td className="py-3 px-6 text-center">
                                            <div className="flex item-center justify-center">
                                                <div
                                                    className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110 cursor-pointer"
                                                    onClick={() => openModal('edit', {
                                                        ...personalizacion,
                                                        type: 'personalizaciones'
                                                    })}
                                                >
                                                    <FiEdit/>
                                                </div>
                                                <div
                                                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110 cursor-pointer"
                                                    onClick={() => handleDelete('personalizaciones', personalizacion.id)}
                                                >
                                                    <FiTrash2/>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Tu Empresa. Todos
                        los derechos reservados.</p>
                    <div>
                        <CSVLink
                            data={renderCSV(paquetes.concat(personalizaciones)).data}
                            headers={renderCSV(paquetes.concat(personalizaciones)).headers}
                            filename="datos.csv"
                            className="text-blue-500 hover:underline mr-4"
                        >
                            Exportar CSV
                        </CSVLink>
                        <button className="text-blue-500 hover:underline">Exportar PDF</button>
                    </div>
                </div>
            </footer>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel={`${modalMode === 'create' ? 'Crear' : 'Editar'} ${selectedItem?.type === 'paquetes' ? 'Paquete' : 'Personalización'}`}
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    {modalMode === 'create' ? 'Crear' : 'Editar'} {selectedItem?.type === 'paquetes' ? 'Paquete' : 'Personalización'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="nombre" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                            defaultValue={selectedItem?.nombre || ''}
                            {...register('nombre', {required: true})}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="precio" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                            {selectedItem?.type === 'paquetes' ? 'Precio' : 'Precio Adicional'}
                        </label>
                        <input
                            type="number"
                            id="precio"
                            step="0.01"
                            className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                            defaultValue={selectedItem?.precio || selectedItem?.precio_adicional || ''}
                            {...register(selectedItem?.type === 'paquetes' ? 'precio' : 'precio_adicional', {required: true})}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
                            onClick={closeModal}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            {modalMode === 'create' ? 'Crear' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        alignItems: 'center',
        height: 30,
        fontStyle: 'bold',
    },
    tableHeader: {
        width: '33.33%',
        textAlign: 'center',
        fontSize: 12,
        padding: 5,
    },
    tableCell: {
        width: '33.33%',
        textAlign: 'center',
        fontSize: 10,
        padding: 5,
    },
});
export default Dashboard;