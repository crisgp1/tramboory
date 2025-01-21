const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const { Op } = require('sequelize');

exports.getAllPagos = async (req, res, next) => {
  try {
    const pagos = await Pago.findAll({
      where: { estado: { [Op.ne]: 'fallido' } },
      include: [
        { 
          model: Reserva,
          as: 'reservaPago',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva'],
          required: false
        }
      ],
      order: [['fecha_pago', 'DESC']],
      attributes: {
        exclude: ['updatedAt']
      }
    });

    if (!pagos) {
      return res.status(404).json({ error: 'No se encontraron pagos' });
    }

    // Transformar y validar los resultados
    const pagosFormateados = pagos.map(pago => {
      const pagoJSON = pago.toJSON();
      return {
        ...pagoJSON,
        monto: parseFloat(pagoJSON.monto || 0).toFixed(2),
        estado: pagoJSON.estado || 'pendiente',
        reservaPago: pagoJSON.reservaPago || {
          id: null,
          nombre_festejado: 'Reserva no encontrada',
          fecha_reserva: null
        }
      };
    });

    res.json(pagosFormateados);
  } catch (error) {
    console.error('Error en getAllPagos:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.getPagoById = async (req, res, next) => {
  try {
    const pago = await Pago.findOne({
      where: { 
        id: req.params.id,
        estado: { [Op.ne]: 'fallido' }
      },
      include: [
        { 
          model: Reserva,
          as: 'reservaPago',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        }
      ]
    });
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    
    res.json(pago);
  } catch (error) {
    console.error('Error en getPagoById:', {
      error: error.message,
      stack: error.stack,
      pagoId: req.params.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.createPago = async (req, res, next) => {
  try {
    const pago = await Pago.create(req.body);
    res.status(201).json(pago);
  } catch (error) {
    console.error('Error en createPago:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.updatePago = async (req, res, next) => {
  try {
    const [updated] = await Pago.update(req.body, {
      where: { 
        id: req.params.id,
        estado: { [Op.ne]: 'fallido' }
      }
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    
    const updatedPago = await Pago.findByPk(req.params.id);
    res.json(updatedPago);
  } catch (error) {
    console.error('Error en updatePago:', {
      error: error.message,
      stack: error.stack,
      pagoId: req.params.id,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.deletePago = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pago.estado === 'fallido') {
      return res.status(409).json({ error: 'El pago ya está desactivado' });
    }

    const result = await Pago.update(
      { estado: 'fallido' },
      {
        where: { 
          id: req.params.id,
          estado: { [Op.ne]: 'fallido' }
        }
      }
    );

    if (result[0] === 0) {
      const pagoActual = await Pago.findByPk(req.params.id);
      if (pagoActual.estado === 'fallido') {
        return res.status(409).json({ error: 'El pago ya fue desactivado por otro proceso' });
      }
      return res.status(500).json({ error: 'No se pudo desactivar el pago' });
    }

    res.json({ message: 'Pago desactivado con éxito' });
  } catch (error) {
    console.error('Error en deletePago:', {
      error: error.message,
      stack: error.stack,
      pagoId: req.params.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.getArchivedPagos = async (req, res, next) => {
  try {
    const pagos = await Pago.findAll({
      where: { estado: 'fallido' },
      include: [
        { 
          model: Reserva,
          as: 'reservaPago',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva'],
          required: false
        }
      ],
      order: [['fecha_pago', 'DESC']],
      attributes: {
        exclude: ['updatedAt']
      }
    });

    if (!pagos) {
      return res.status(404).json({ error: 'No se encontraron pagos archivados' });
    }

    const pagosFormateados = pagos.map(pago => {
      const pagoJSON = pago.toJSON();
      return {
        ...pagoJSON,
        monto: parseFloat(pagoJSON.monto || 0).toFixed(2),
        estado: 'fallido',
        reservaPago: pagoJSON.reservaPago || {
          id: null,
          nombre_festejado: 'Reserva no encontrada',
          fecha_reserva: null
        }
      };
    });

    res.json(pagosFormateados);
  } catch (error) {
    console.error('Error en getArchivedPagos:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.reactivatePago = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pago.estado !== 'fallido') {
      return res.status(409).json({ error: 'El pago no está desactivado' });
    }

    const result = await Pago.update(
      { estado: 'pendiente' },
      {
        where: { 
          id: req.params.id,
          estado: 'fallido'
        }
      }
    );

    if (result[0] === 0) {
      return res.status(500).json({ error: 'No se pudo reactivar el pago' });
    }

    res.json({ message: 'Pago reactivado con éxito' });
  } catch (error) {
    console.error('Error en reactivatePago:', {
      error: error.message,
      stack: error.stack,
      pagoId: req.params.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

exports.updatePagoStatus = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const [updated] = await Pago.update(
      { estado },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const updatedPago = await Pago.findByPk(req.params.id);
    res.json(updatedPago);
  } catch (error) {
    console.error('Error en updatePagoStatus:', {
      error: error.message,
      stack: error.stack,
      pagoId: req.params.id,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};
