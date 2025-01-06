// controllers/pagoController.js

const { Pago, Reserva, Usuario } = require('../models');
const sequelize = require('../config/database');

exports.createPago = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_reserva, monto, fecha_pago, metodo_pago } = req.body;

    const nuevoPago = await Pago.create({
      id_reserva,
      monto,
      fecha_pago,
      metodo_pago,
      estado: 'pendiente' // Siempre se crea como pendiente
    }, { transaction: t });

    await t.commit();
    res.status(201).json(nuevoPago);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear el pago:', error);
    res.status(500).json({ message: 'Error al crear el pago', error: error.message });
  }
};

exports.getPagos = async (req, res) => {
  try {
    const pagos = await Pago.findAll({
      include: [
        {
          model: Reserva,
          as: 'reservaPago',
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nombre', 'email'],
            },
          ],
        },
      ],
    });
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
  }
};

exports.updatePagoEstado = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'completado', 'fallido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    // Buscar el pago por ID
    const pago = await Pago.findByPk(id);
    if (!pago) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Actualizar el estado del pago
    // El trigger se encargará de actualizar el estado de la reserva
    pago.estado = estado;
    await pago.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Estado del pago actualizado con éxito', pago });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar el estado del pago:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del pago', error: error.message });
  }
};