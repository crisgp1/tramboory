const Reserva = require('../models/Reserva');
const Paquete = require('../models/Paquete');
const Usuario = require('../models/Usuario');
const OpcionAlimento = require('../models/OpcionAlimento');
const Tematica = require('../models/Tematica');
const Mampara = require('../models/Mampara');
const Extra = require('../models/Extra');
const Finanza = require('../models/Finanza');
const ReservaExtra = require('../models/ReservaExtra');
const { Op } = require('sequelize');

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

    // Validación de fecha
    const fechaReserva = new Date(reservaData.fecha_reserva);
    if (isNaN(fechaReserva.getTime())) {
      return res.status(400).json({ error: 'Fecha de reserva inválida' });
    }
    reservaData.fecha_reserva = fechaReserva;

    // Manejo de horarios
    // Si hora_inicio viene como string en formato HH:MM:SS, lo usamos directamente
    if (typeof reservaData.hora_inicio === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(reservaData.hora_inicio)) {
      // Establecer hora_fin basado en hora_inicio
      const horaInicio = reservaData.hora_inicio.split(':')[0];
      reservaData.hora_fin = horaInicio === '11' ? '16:00:00' : '22:00:00';
    } else {
      return res.status(400).json({ error: 'Formato de hora_inicio inválido. Debe ser HH:MM:SS' });
    }

    if (!['pendiente', 'confirmada', 'cancelada'].includes(reservaData.estado)) {
      return res.status(400).json({ error: 'estado inválido' });
    }
    
    if (isNaN(parseFloat(reservaData.total))) {
      return res.status(400).json({ error: 'total debe ser un número' });
    }
    
    if (!Number.isInteger(reservaData.edad_festejado)) {
      return res.status(400).json({ error: 'edad_festejado debe ser un número entero' });
    }

    // Verificar disponibilidad del horario
    const existingReservation = await Reserva.findOne({
      where: {
        fecha_reserva: reservaData.fecha_reserva,
        hora_inicio: reservaData.hora_inicio,
        estado: {
          [Op.in]: ['pendiente', 'confirmada']
        }
      }
    });

    if (existingReservation) {
      return res.status(409).json({ error: 'El horario seleccionado ya está ocupado' });
    }

    // Extraer los extras antes de crear la reserva
    const { extras, ...reservaDataSinExtras } = reservaData;

    // Obtener el usuario actual
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Crear la reserva con el usuario en las opciones para los hooks
    const reserva = await Reserva.create(reservaDataSinExtras, {
      user: usuario // Pasar el usuario para los hooks de auditoría
    });

    // Si hay extras, crear las relaciones en la tabla intermedia
    if (extras && Array.isArray(extras) && extras.length > 0) {
      // Verificar que cada extra existe
      const extraIds = extras.map(extra => extra.id);
      const existingExtras = await Extra.findAll({
        where: {
          id: extraIds
        }
      });

      if (existingExtras.length !== extraIds.length) {
        await reserva.destroy(); // Eliminar la reserva si hay extras inválidos
        return res.status(400).json({ error: 'Uno o más extras no existen' });
      }

      // Crear las relaciones con cantidad
      await Promise.all(extras.map(async (extra) => {
        await ReservaExtra.create({
          id_reserva: reserva.id,
          id_extra: extra.id,
          cantidad: extra.cantidad || 1 // Usar la cantidad proporcionada o 1 por defecto
        });
      }));
    }

    // Crear automáticamente una finanza asociada a la reserva creada
    if (reserva) {
      const finanzaData = {
        tipo: 'ingreso',
        monto: parseFloat(reservaData.total),
        fecha: reservaData.fecha_reserva,
        descripcion: `Ingreso por reserva para ${reservaData.nombre_festejado}`,
        id_reserva: reserva.id,
        categoria: 'Reservas',
        id_usuario: usuario.id // Agregar el id del usuario a la finanza
      };

      await Finanza.create(finanzaData);
    }

    // Obtener la reserva con sus relaciones
    const reservaCompleta = await Reserva.findOne({
      where: { id: reserva.id },
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
          attributes: ['id', 'nombre', 'descripcion', 'precio'],
          through: {
            attributes: ['cantidad']
          }
        }
      ]
    });

    res.status(201).json(reservaCompleta);
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
          attributes: ['id', 'nombre', 'descripcion', 'precio'],
          through: {
            attributes: ['cantidad']
          }
        }
      ]
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
          attributes: ['id', 'nombre', 'descripcion', 'precio'],
          through: {
            attributes: ['cantidad']
          }
        }
      ]
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
    const reservaData = req.body;
    const [updated] = await Reserva.update(reservaData, {
      where: { id: req.params.id, activo: true },
      user: req.user // Pasar el usuario para los hooks de auditoría
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
      where: { id: req.params.id },
      user: req.user // Pasar el usuario para los hooks de auditoría
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
    // Obtener el ID del usuario del objeto user añadido por el middleware de autenticación
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'Usuario no autenticado' });
    }

    const reservas = await Reserva.findAll({
      where: { 
        id_usuario: userId,
        activo: true 
      },
      attributes: ['id', 'id_paquete', 'id_opcion_alimento', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado', 'id_tematica', 'comentarios', 'activo', 'id_mampara'],
      include: [
        {
          model: Paquete,
          as: 'paquete',
          attributes: ['id', 'nombre']
        },
        { 
          model: Extra,
          as: 'extras',
          attributes: ['id', 'nombre', 'descripcion', 'precio'],
          through: {
            attributes: ['cantidad']
          }
        },
        {
          model: Tematica,
          as: 'tematicaReserva',
          attributes: ['id', 'nombre']
        },
        {
          model: Mampara,
          as: 'mampara',
          attributes: ['id', 'piezas', 'precio'],
          include: [
            { model: Tematica, as: 'tematica', attributes: ['id', 'nombre'] }
          ]
        }
      ],
      order: [['fecha_reserva', 'DESC']]
    });

    const reservasFormateadas = reservas.map(reserva => ({
      ...reserva.toJSON(),
      nombre_paquete: reserva.paquete ? reserva.paquete.nombre : 'No especificado',
      nombre_tematica: reserva.tematicaReserva ? reserva.tematicaReserva.nombre : 'No especificada'
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
      { 
        where: { id },
        user: req.user // Pasar el usuario para los hooks de auditoría
      }
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