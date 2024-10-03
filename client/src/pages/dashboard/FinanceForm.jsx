import { FiDollarSign, FiCalendar, FiFileText, FiPackage, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import CurrencyInput from '../../components/CurrencyInput';

const FinanceForm = ({ editingItem, reservations }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transacción</label>
            <div className="relative">
                <select
                    name="tipo"
                    defaultValue={editingItem?.tipo || ''}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                    <option value="">Seleccionar tipo</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                </select>
                {editingItem?.tipo === 'ingreso' ?
                    <FiArrowUpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" /> :
                    <FiArrowDownCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                }
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <CurrencyInput
                name="monto"
                defaultValue={editingItem?.monto || ''}
                placeholder="0.00"
                icon={FiDollarSign}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    name="fecha"
                    type="date"
                    defaultValue={editingItem?.fecha || ''}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reserva Asociada</label>
            <div className="relative">
                <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                    name="id_reserva"
                    defaultValue={editingItem?.id_reserva || ''}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                    <option value="">Sin reserva asociada</option>
                    {reservations.map((reserva) => (
                        <option key={reserva.id} value={reserva.id}>
                            Reserva #{reserva.id} - {new Date(reserva.fecha_reserva).toLocaleDateString()}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <div className="relative">
                <FiFileText className="absolute left-3 top-3 text-gray-400" />
                <textarea
                    name="descripcion"
                    placeholder="Detalles de la transacción"
                    defaultValue={editingItem?.descripcion || ''}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                />
            </div>
        </div>
    </div>
);

export default FinanceForm;