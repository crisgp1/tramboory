const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const { Op } = require('sequelize');

exports.getAllPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { estado: { [Op.ne]: 'fallido' } },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        }
      ]
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
};

exports.getPagoById = async (req, res) => {
  try {
    const pago = await Pago.findOne({
      where: { 
        id: req.params.id,
        estado: { [Op.ne]: 'fallido' }
      },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        }
      ]
    });
    if (pago) {
      res.json(pago);
    } else {
      res.status(404).json({ error: 'Pago no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el pago:', error);
    res.status(500).json({ error: 'Error al obtener el pago' });
  }
};

exports.createPago = async (req, res) => {
  try {
    const pago = await Pago.create(req.body);
    res.status(201).json(pago);
  } catch (error) {
    console.error('Error al crear el pago:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
};

exports.updatePago = async (req, res) => {
  try {
    const [updated] = await Pago.update(req.body, {
      where: { 
        id: req.params.id,
        estado: { [Op.ne]: 'fallido' }
      }
    });
    if (updated) {
      const updatedPago = await Pago.findByPk(req.params.id);
      res.json(updatedPago);
    } else {
      res.status(404).json({ error: 'Pago no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
};

exports.deletePago = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pago.estado === 'fallido') {
      return res.status(409).json({ error: 'El pago ya está desactivado' });
    }

    // Actualizar usando un bloqueo optimista
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
      } else {
        return res.status(500).json({ error: 'No se pudo desactivar el pago' });
      }
    }

    res.json({ message: 'Pago desactivado con éxito' });
  } catch (error) {
    console.error('Error al desactivar el pago:', error);
    res.status(500).json({ error: 'Error al desactivar el pago' });
  }
};

exports.getArchivedPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      where: { estado: 'fallido' },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        }
      ]
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos archivados:', error);
    res.status(500).json({ error: 'Error al obtener los pagos archivados' });
  }
};

exports.reactivatePago = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pago.estado !== 'fallido') {
      return res.status(409).json({ error: 'El pago no está desactivado' });
    }

    // Reactivar el pago
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
    console.error('Error al reactivar el pago:', error);
    res.status(500).json({ error: 'Error al reactivar el pago' });
  }
};

exports.updatePagoStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const [updated] = await Pago.update(
      { estado },
      { where: { id: req.params.id } }
    );

    if (updated) {
      const updatedPago = await Pago.findByPk(req.params.id);
      res.json(updatedPago);
    } else {
      res.status(404).json({ error: 'Pago no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado del pago:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del pago' });
  }
};