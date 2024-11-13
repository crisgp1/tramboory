import React from 'react';

const PrintableReservation = ({ reservation }) => {
    return (
        <div className="p-8">
            <style type="text/css" media="print">{`
        @page { size: auto; margin: 20mm; }
        body { font-family: Arial, sans-serif; }
        .page-break { page-break-after: always; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      `}</style>
            <h1 className="text-2xl font-bold mb-6">Detalles de la Reserva</h1>
            <table>
                <tbody>
                <tr>
                    <th>Número de Reserva</th>
                    <td>{reservation.id}</td>
                </tr>
                <tr>
                    <th>Fecha</th>
                    <td>{new Date(reservation.fecha_reserva).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <th>Hora</th>
                    <td>{reservation.hora_inicio}</td>
                </tr>
                <tr>
                    <th>Cliente</th>
                    <td>{reservation.nombre_cliente}</td>
                </tr>
                <tr>
                    <th>Teléfono</th>
                    <td>{reservation.telefono_cliente || 'No especificado'}</td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>{reservation.email_cliente || 'No especificado'}</td>
                </tr>
                <tr>
                    <th>Paquete</th>
                    <td>{reservation.nombre_paquete}</td>
                </tr>
                <tr>
                    <th>Total</th>
                    <td>${reservation.total}</td>
                </tr>
                <tr>
                    <th>Festejado</th>
                    <td>{reservation.nombre_festejado}</td>
                </tr>
                <tr>
                    <th>Edad</th>
                    <td>{reservation.edad_festejado} años</td>
                </tr>
                <tr>
                    <th>Temática</th>
                    <td>{reservation.tematica || 'No especificada'}</td>
                </tr>
                <tr>
                    <th>Extras</th>
                    <td>
                        Cupcake: {reservation.cupcake ? 'Sí' : 'No'}<br />
                        Mampara: {reservation.mampara ? 'Sí' : 'No'}<br />
                        Piñata: {reservation.piñata ? 'Sí' : 'No'}
                    </td>
                </tr>
                </tbody>
            </table>
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Comentarios</h2>
                <p>{reservation.comentarios || 'Sin comentarios'}</p>
            </div>
        </div>
    );
};

export default PrintableReservation;