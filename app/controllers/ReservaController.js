const Reserva = require('../models/Reserva');
const Paquete = require('../models/Paquete');
const Usuario = require('../models/Usuario');
const OpcionAlimento = require('../models/OpcionAlimento');
const Tematica = require('../models/Tematica');
const Mampara = require('../models/Mampara');
const Extra = require('../models/Extra');
const Finanza = require('../models/Finanza'); 

exports.createReserva = async (req, res) => {
  try {
    console.log('Datos recibidos para crear reserva:', req.body);
    const reservaData = req.body;

    // Validación básica
    const camposRequeridos = ['id_usuario', 'id_paquete', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado'];
    for (const campo of camposRequeridos) {
      if (reservaData[campo] === undefined) {
        return res.status(400).json({ error: `El campo ${campo} es requerido` });
      }
    }

    // Validación de tipos
    if (!Number.isInteger(reservaData.id_usuario)) return res.status(400).json({ error: 'id_usuario debe ser un número entero' });
    if (!Number.isInteger(reservaData.id_paquete)) return res.status(400).json({ error: 'id_paquete debe ser un número entero' });
    if (reservaData.id_opcion_alimento && !Number.isInteger(reservaData.id_opcion_alimento)) return res.status(400).json({ error: 'id_opcion_alimento debe ser un número entero' });
    if (reservaData.id_tematica && !Number.isInteger(reservaData.id_tematica)) return res.status(400).json({ error: 'id_tematica debe ser un número entero' });
    if (!['mañana', 'tarde'].includes(reservaData.hora_inicio)) return res.status(400).json({ error: 'hora_inicio debe ser "mañana" o "tarde"' });
    if (!['pendiente', 'confirmada', 'cancelada'].includes(reservaData.estado)) return res.status(400).json({ error: 'estado inválido' });
    if (isNaN(parseFloat(reservaData.total))) return res.status(400).json({ error: 'total debe ser un número' });
    if (!Number.isInteger(reservaData.edad_festejado)) return res.status(400).json({ error: 'edad_festejado debe ser un número entero' });

    // Crear la reserva
    const reserva = await Reserva.create(reservaData);

    // Crear automáticamente una finanza asociada a la reserva creada
    if (reserva) {
      const finanzaData = {
        tipo: 'ingreso', // Tipo de finanza, por ejemplo "ingreso"
        monto: parseFloat(reservaData.total), // Monto igual al total de la reserva
        fecha: reservaData.fecha_reserva, // Fecha de la reserva
        descripcion: `Ingreso por reserva para ${reservaData.nombre_festejado}`, // Descripción de la finanza
        id_reserva: reserva.id, // Asociar la finanza a la reserva recién creada
        categoria: 'Reservas' // Categoría para la finanza (puede ser dinámica)
      };

      // Intenta crear la finanza
      await Finanza.create(finanzaData);
    }

    // Retornar la reserva creada
    res.status(201).json(reserva);
  } catch (error) {
    console.error('Error detallado al crear la reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
  }
};


exports.getAllReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { activo: true },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'telefono'] },
        { model: Paquete, as: 'paquete', attributes: ['id', 'nombre'] },
        { model: OpcionAlimento, as: 'opcionAlimento', attributes: ['id', 'nombre'] },
        { model: Tematica, as: 'tematicaReserva', attributes: ['id', 'nombre'] },
        {
          model: Mampara,
          as: 'mampara',
          attributes: ['id', 'piezas', 'precio'],
          include: [
            { model: Tematica, as: 'tematica', attributes: ['id', 'nombre'] }
          ]
        },
        {
          model: Extra,
          as: 'extras',
          attributes: ['id', 'nombre'],
          through: { attributes: [] },
        },
      ],
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener las reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

exports.getReservaById = async (req, res) => {
  try {
    const reserva = await Reserva.findOne({
      where: { id: req.params.id, activo: true },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'telefono'] },
        { model: Paquete, as: 'paquete', attributes: ['id', 'nombre'] },
        { model: OpcionAlimento, as: 'opcionAlimento', attributes: ['id', 'nombre'] },
        { model: Tematica, as: 'tematicaReserva', attributes: ['id', 'nombre'] },
        { model: Mampara, as: 'mampara', attributes: ['id', 'piezas', 'precio'] },
        {
          model: Extra,
          as: 'extras',
          attributes: ['id', 'nombre'],
          through: { attributes: [] },
        },
      ],
    });
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

exports.updateReserva = async (req, res) => {
  try {
    const [updated] = await Reserva.update(req.body, {
      where: { id: req.params.id, activo: true }
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
    const result = await Reserva.update({ activo: false }, {
      where: { id: req.params.id }
    });
    if (result[0] === 0) {
      res.status(404).json({ error: 'Reserva no encontrada' });
    } else {
      res.status(200).json({ message: 'Reserva desactivada con éxito' });
    }
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
      attributes: ['id', 'id_paquete', 'id_opcion_alimento', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado', 'tematica',   'comentarios', 'activo', 'id_mampara'],
      include: [{
        model: Paquete,
        as: 'paquete',
        attributes: ['nombre']
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

exports.updateReservaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const [updated] = await Reserva.update(
      { estado },
      { where: { id } }
    );

    if (updated) {
      const updatedReserva = await Reserva.findByPk(id);
      res.json(updatedReserva);
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado de la reserva:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
  }
};