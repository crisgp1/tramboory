import React from 'react';
// Usar el alias @ para garantizar resolución correcta en Docker
import { formatDate, formatNumber } from '@/utils/formatters';

const PaymentDetails = ({ payment }) => {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium'>ID de Reserva:</h3>
        <p>{payment.id_reserva}</p>
      </div>
      <div>
        <h3 className='text-lg font-medium'>Monto:</h3>
        <p>{formatNumber(payment.monto)}</p>
      </div>
      <div>
        <h3 className='text-lg font-medium'>Fecha de Pago:</h3>
        <p>{formatDate(payment.fecha_pago)}</p>
      </div>
      <div>
        <h3 className='text-lg font-medium'>Método de Pago:</h3>
        <p>{payment.metodo_pago}</p>
      </div>

    
            
    </div>
  );
};

export default PaymentDetails;
