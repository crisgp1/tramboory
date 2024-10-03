import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';

const ReservationTable = ({
                              reservations,
                              reservationSearch,
                              setReservationSearch,
                              handleViewReservation,
                              handleEditItem,
                              handleDeleteItem,
                          }) => (
    <>
        <div className="mb-4">
            <input
                type="text"
                placeholder="Buscar reserva..."
                value={reservationSearch}
                onChange={(e) => setReservationSearch(e.target.value)}
                className="w-full p-2 border rounded"
            />
        </div>
        <table className="w-full">
            <thead>
            <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Nº Reserva</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2">{reservation.id}</td>
                    <td className="px-4 py-2">{reservation.nombre_cliente}</td>
                    <td className="px-4 py-2">{reservation.fecha_reserva}</td>
                    <td className="px-4 py-2">
              <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      reservation.estado === 'confirmada'
                          ? 'bg-green-100 text-green-800'
                          : reservation.estado === 'cancelada'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                  }`}
              >
                {reservation.estado}
              </span>
                    </td>
                    <td className="px-4 py-2">
                        <button
                            onClick={() => handleViewReservation(reservation)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                            <FiEye />
                        </button>
                        <button
                            onClick={() => handleEditItem(reservation)}
                            className="text-green-500 hover:text-green-700 mr-2"
                        >
                            <FiEdit2 />
                        </button>
                        <button
                            onClick={() => handleDeleteItem(reservation.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <FiTrash2 />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </>
);

export default ReservationTable;
