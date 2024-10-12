const Reserva = require('../models/Reserva');
const Paquete = require('../models/Paquete');
const Finanza = require('../models/Finanza');
const { Sequelize } = require('sequelize');
const Usuario = require('../models/Usuario');

exports.getAllReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where : {
        activo : true
        },
      attributes: ['id', 'id_usuario', 'id_paquete', 'id_opcion_alimento', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado', 'tematica', 'cupcake', 'mampara', 'piñata', 'comentarios'],
      include: [
        {
          model: Usuario,
          attributes: ['nombre', 'email']
        }
      ]
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error detallado al obtener las reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas', details: error.message });
  }
};

exports.getReservaById = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (reserva) {
      res.json(reserva);
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la reserva:', error);
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
};

exports.createReserva = async (req, res) => {
  console.log('Datos de la reserva:', req.body);
  try {
    const reserva = await Reserva.create(req.body);

    // Crear un registro en la tabla de finanzas asociado a la reserva
    await Finanza.create({
      id_reserva: reserva.id,
      tipo: 'ingreso',
      monto: reserva.total,
      fecha: reserva.fecha_reserva,
      descripcion: `Ingreso por reserva #${reserva.id}`,
    });

    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
  }
};

exports.updateReserva = async (req, res) => {
  try {
    const [updated] = await Reserva.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedReserva = await Reserva.findByPk(req.params.id);
      res.json(updatedReserva);
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar la reserva:', error);
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

exports.deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;
    await Reserva.update({ activo: false }, {
      where: { id },
      silent: true
    });
    res.status(200).json({ message: 'Reserva desactivada con éxito' });
  } catch (error) {
    console.error('Error al desactivar la reserva:', error);
    res.status(500).json({ error: 'Error al desactivar la reserva' });
  }
};


exports.getReservasByUserId = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Se requiere el ID del usuario' });
    }

    const reservas = await Reserva.findAll({
      where: { id_usuario: userId },
      attributes: ['id', 'id_paquete', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado', 'tematica', 'cupcake', 'mampara', 'piñata', 'comentarios'],
      include: [{
        model: Paquete,
        attributes: ['nombre'],
        as: 'paquete'
      }],
      order: [['fecha_reserva', 'DESC']]
    });

    const reservasFormateadas = reservas.map(reserva => ({
      ...reserva.toJSON(),
      nombre_paquete: reserva.paquete ? reserva.paquete.nombre : 'No especificado'
    }));

    res.json(reservasFormateadas);
  } catch (error) {
    console.error('Error al obtener las reservas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener las reservas del usuario', details: error.message });
  }
};