import {
    FiBox, FiCalendar, FiCheckCircle,
    FiClock, FiCoffee, FiDollarSign, FiGift, FiImage, FiMessageSquare, FiPackage, FiUser,
} from 'react-icons/fi';

import {FaBirthdayCake} from "react-icons/fa";


const ReservationForm = ({editingItem, users, packages}) => (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex items-center">
        <FiUser className="mr-2 text-indigo-600"/>
        <select name="id_usuario" defaultValue={editingItem?.id_usuario || ''}
                className="w-full p-2 border rounded">
            <option value="">Seleccionar usuario</option>
            {users.map((user) => (<option key={user.id} value={user.id}>
                {user.nombre}
            </option>))}
        </select>
    </div>
    <div className="flex items-center">
        <FiPackage className="mr-2 text-indigo-600"/>
        <select
            name="id_paquete"
            defaultValue={editingItem?.id_paquete || ''}
            className="w-full p-2 border rounded"
        >
            <option value="">Seleccionar paquete</option>
            {packages.map((pkg) => (<option key={pkg.id} value={pkg.id}>
                {pkg.nombre} - ${pkg.precio}
            </option>))}
        </select>
    </div>
    <div className="flex items-center">
        <FiCalendar className="mr-2 text-indigo-600"/>
        <input
            name="fecha_reserva"
            type="date"
            defaultValue={editingItem?.fecha_reserva || ''}
            className="w-full p-2 border rounded"
        />
    </div>
    <div className="flex items-center">
        <FiClock className="mr-2 text-indigo-600"/>
        <select name="hora_inicio" defaultValue={editingItem?.hora_inicio || ''}
                className="w-full p-2 border rounded">
            <option value="">Seleccionar hora</option>
            <option value="mañana">Mañana</option>
            <option value="tarde">Tarde</option>
        </select>
    </div>
    <div className="flex items-center">
        <FiCheckCircle className="mr-2 text-indigo-600"/>
        <select name="estado" defaultValue={editingItem?.estado || ''} className="w-full p-2 border rounded">
            <option value="">Seleccionar estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
        </select>
    </div>
    <div className="flex items-center">
        <FiDollarSign className="mr-2 text-indigo-600"/>
        <input
            name="total"
            type="number"
            step="0.01"
            placeholder="Total"
            defaultValue={editingItem?.total || ''}
            className="w-full p-2 border rounded"
        />
    </div>
    <div className="flex items-center">
        <FiUser className="mr-2 text-indigo-600"/>
        <input
            name="nombre_festejado"
            placeholder="Nombre del festejado"
            defaultValue={editingItem?.nombre_festejado || ''}
            className="w-full p-2 border rounded"
        />
    </div>
    <div className="flex items-center">
        <FaBirthdayCake className="mr-2 text-indigo-600"/>
        <input
            name="edad_festejado"
            type="number"
            placeholder="Edad del festejado"
            defaultValue={editingItem?.edad_festejado || ''}
            className="w-full p-2 border rounded"
        />
    </div>
    <div className="flex items-center">
        <FiGift className="mr-2 text-indigo-600"/>
        <input
            name="tematica"
            placeholder="Temática"
            defaultValue={editingItem?.tematica || ''}
            className="w-full p-2 border rounded"
        />
    </div>
    <div className="flex items-center space-x-4">
        <div className="flex items-center">
            <FiCoffee className="mr-2 text-indigo-600"/>
            <input
                name="cupcake"
                type="checkbox"
                defaultChecked={editingItem?.cupcake || false}
                className="mr-2"
            />
            <label>Cupcake</label>
        </div>
        <div className="flex items-center">
            <FiImage className="mr-2 text-indigo-600"/>
            <input
                name="mampara"
                type="checkbox"
                defaultChecked={editingItem?.mampara || false}
                className="mr-2"
            />
            <label>Mampara</label>
        </div>
        <div className="flex items-center">
            <FiBox className="mr-2 text-indigo-600"/>
            <input
                name="piñata"
                type="checkbox"
                defaultChecked={editingItem?.piñata || false}
                className="mr-2"
            />
            <label>Piñata</label>
        </div>
    </div>
    <div className="col-span-2 flex items-start">
        <FiMessageSquare className="mr-2 text-indigo-600 mt-1"/>
        <textarea
            name="comentarios"
            placeholder="Comentarios"
            defaultValue={editingItem?.comentarios || ''}
            className="w-full p-2 border rounded"
            rows="3"
        />
    </div>
</div>);

export default ReservationForm;
