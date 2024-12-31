const { Auditoria } = require('../models');
const { Op } = require('sequelize');

const AuditoriaController = {
  async obtenerHistorial(req, res) {
    try {
      const registros = await Auditoria.findAll({
        where: {
          fecha_operacion: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        order: [['fecha_operacion', 'DESC']],
        limit: 100
      });
      
      const formatearTransaccion = (transaccion) => {
        try {
          // Intentar parsear si es un JSON
          const data = JSON.parse(transaccion);
          if (data.operacion) {
            // Si es una operación HTTP, simplificar el mensaje
            const metodo = data.request?.method || '';
            const ruta = data.request?.path || '';
            return `${metodo} ${ruta}`;
          }
          // Si es otro tipo de JSON, retornar un mensaje genérico
          return 'Operación realizada en el sistema';
        } catch (e) {
          // Si no es JSON, retornar el mensaje original
          return transaccion;
        }
      };

      const registrosFormateados = registros.map(registro => ({
        ...registro.toJSON(),
        fecha_operacion: new Date(registro.fecha_operacion).toISOString(),
        transaccion: formatearTransaccion(registro.transaccion)
      }));

      res.json(registrosFormateados);
    } catch (error) {
      console.error('Error al obtener historial de auditoría:', error);
      
      res.status(500).json({ 
        mensaje: 'Error al obtener el historial de auditoría',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

module.exports = AuditoriaController;