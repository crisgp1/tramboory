const Reserva = require('../models/Reserva');
const Paquete = require('../models/Paquete');
const Usuario = require('../models/Usuario');
const OpcionAlimento = require('../models/OpcionAlimento');
const Tematica = require('../models/Tematica');
const Mampara = require('../models/Mampara');
const Extra = require('../models/Extra');
const Finanza = require('../models/Finanza');
const ReservaExtra = require('../models/ReservaExtra');
const Pago = require('../models/Pago');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Inicia el proceso de reserva obteniendo un ID provisional
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
exports.initiate = async (req, res, next) => {
  try {
    // Obtener el siguiente valor de la secuencia de reservas
    const { rows } = await sequelize.query(
      `SELECT nextval('main.reservas_id_seq') AS id`
    );
    
    // Devolver el ID provisional
    res.json({ reservationId: rows[0].id });
  } catch (error) {
    console.error('Error al iniciar el proceso de reserva:', error);
    next(error);
  }
};

/**
 * Confirma una reserva después de que el pago ha sido procesado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
exports.confirm = async (req, res, next) => {
  const client = await sequelize.getConnection();
  try {
    await client.query('BEGIN');
    
    const reservaData = req.body;
    
    // Validación básica
    const camposRequeridos = ['id_paquete', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado', 'reservationId'];
    for (const campo of camposRequeridos) {
      if (reservaData[campo] === undefined) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `El campo ${campo} es requerido` });
      }
    }
    
    // Extraer el ID del usuario autenticado
    let userId = req.user.id;
    
    // Solo permitir que admin pueda crear reservas para otros usuarios
    if (reservaData.id_usuario && req.user.tipo_usuario === 'admin') {
      if (!Number.isInteger(reservaData.id_usuario)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'id_usuario debe ser un número entero' });
      }
      userId = reservaData.id_usuario;
    }
    
    // Verificar disponibilidad del horario
    const existingReservation = await Reserva.findOne({
      where: {
        fecha_reserva: reservaData.fecha_reserva,
        hora_inicio: reservaData.hora_inicio,
        estado: {
          [Op.in]: ['pendiente', 'confirmada']
        },
        id: {
          [Op.ne]: reservaData.reservationId // Excluir la reserva actual
        }
      }
    });

    if (existingReservation) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'El horario seleccionado ya está ocupado' });
    }
    
    // Extraer los extras antes de crear la reserva
    const { extras, reservationId, ...reservaDataSinExtras } = reservaData;
    
    // Verificar que el usuario para el que se creará la reserva existe
    const usuario = await Usuario.findOne({
      where: {
        id: userId,
        activo: true
      }
    });
    
    if (!usuario) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
    }
    
    // Asignar explícitamente el ID del usuario autenticado a la reserva
    reservaDataSinExtras.id_usuario = userId;
    
    // Crear o actualizar la reserva con el ID proporcionado
    const [reserva, created] = await Reserva.upsert(
      {
        id: reservationId,
        ...reservaDataSinExtras
      },
      {
        user: usuario, // Pasar el usuario para los hooks de auditoría
        transaction: client
      }
    );
    
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
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Uno o más extras no existen' });
      }
      
      // Eliminar extras existentes para esta reserva
      await ReservaExtra.destroy({
        where: { id_reserva: reservationId },
        transaction: client
      });
      
      // Crear las relaciones con cantidad
      await Promise.all(extras.map(async (extra) => {
        await ReservaExtra.create({
          id_reserva: reservationId,
          id_extra: extra.id,
          cantidad: extra.cantidad || 1 // Usar la cantidad proporcionada o 1 por defecto
        }, {
          transaction: client
        });
      }));
    }
    
    // Obtener la reserva con sus relaciones
    const reservaCompleta = await Reserva.findOne({
      where: { id: reservationId },
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
      ],
      transaction: client
    });
    
    // Emitir evento Socket.IO para notificar a los clientes sobre la nueva reserva
    if (global.io) {
      global.io.emit('reserva_creada', reservaCompleta);
      console.log('Evento Socket.IO emitido: reserva_creada');
    }
    
    await client.query('COMMIT');
    res.status(201).json(reservaCompleta);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error detallado al confirmar la reserva:', error);
    next(error);
  } finally {
    client.release();
  }
};

exports.createReserva = async (req, res) => {
  try {
    console.log('Datos recibidos para crear reserva:', req.body);
    const reservaData = req.body;

    // Validación básica - quitamos id_usuario de los campos requeridos ya que lo obtendremos del token
    const camposRequeridos = ['id_paquete', 'fecha_reserva', 'hora_inicio', 'estado', 'total', 'nombre_festejado', 'edad_festejado'];
    for (const campo of camposRequeridos) {
      if (reservaData[campo] === undefined) {
        return res.status(400).json({ error: `El campo ${campo} es requerido` });
      }
    }

    // Extraer el ID del usuario autenticado del objeto req.user
    let userId = req.user.id;
    
    // Solo permitir que admin pueda crear reservas para otros usuarios
    if (reservaData.id_usuario && req.user.tipo_usuario === 'admin') {
      if (!Number.isInteger(reservaData.id_usuario)) {
        return res.status(400).json({ error: 'id_usuario debe ser un número entero' });
      }
      userId = reservaData.id_usuario;
    }
    if (!Number.isInteger(reservaData.id_paquete)) return res.status(400).json({ error: 'id_paquete debe ser un número entero' });
    if (reservaData.id_opcion_alimento && !Number.isInteger(reservaData.id_opcion_alimento)) return res.status(400).json({ error: 'id_opcion_alimento debe ser un número entero' });
    if (reservaData.id_tematica && !Number.isInteger(reservaData.id_tematica)) return res.status(400).json({ error: 'id_tematica debe ser un número entero' });

    // Validación de fecha (asumiendo que viene en formato YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reservaData.fecha_reserva)) {
      return res.status(400).json({ error: 'Fecha de reserva debe estar en formato YYYY-MM-DD' });
    }

    // No convertimos a Date para evitar problemas de zona horaria
    // La fecha se mantiene en formato YYYY-MM-DD como viene del frontend

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

    // Verificar que el usuario para el que se creará la reserva existe
    const usuario = await Usuario.findOne({
      where: { 
        id: userId,
        activo: true 
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // Asignar explícitamente el ID del usuario autenticado a la reserva
    reservaDataSinExtras.id_usuario = userId;

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

    // Emitir evento Socket.IO para notificar a los clientes sobre la nueva reserva
    if (global.io) {
      global.io.emit('reserva_creada', reservaCompleta);
      console.log('Evento Socket.IO emitido: reserva_creada');
    } else {
      console.log('Socket.IO no está disponible para emitir eventos');
    }

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
    const reservaData = { ...req.body };
    
    // Protección contra manipulación de id_usuario
    // Solo permitir que un admin pueda cambiar el id_usuario de una reserva
    if (reservaData.id_usuario && req.user.tipo_usuario !== 'admin') {
      delete reservaData.id_usuario; // Eliminar el campo si no es admin
    }
    
    const [updated] = await Reserva.update(reservaData, {
      where: { id: req.params.id, activo: true },
      user: req.user // Pasar el usuario para los hooks de auditoría
    });
    if (updated) {
      const updatedReserva = await Reserva.findByPk(req.params.id, {
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

      // Emitir evento Socket.IO para notificar a los clientes sobre la actualización
      if (global.io) {
        global.io.emit('reserva_actualizada', updatedReserva);
        console.log('Evento Socket.IO emitido: reserva_actualizada');
      } else {
        console.log('Socket.IO no está disponible para emitir eventos');
      }

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
    // Primero verificamos el estado actual de la reserva
    const reserva = await Reserva.findOne({
      where: { 
        id: req.params.id
      }
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (!reserva.activo) {
      return res.status(409).json({ error: 'La reserva ya está desactivada' });
    }

    // Usamos una transacción para asegurar la consistencia
    await sequelize.transaction(async (t) => {
      const result = await Reserva.update(
        { 
          activo: false,
          estado: 'cancelada'
        },
        {
          where: { 
            id: req.params.id,
            activo: true
          },
          user: req.user,
          transaction: t
        }
      );

      if (result[0] === 0) {
        const reservaActual = await Reserva.findOne({
          where: { id: req.params.id },
          transaction: t
        });
        
        if (!reservaActual.activo) {
          throw new Error('La reserva ya fue desactivada por otro proceso');
        } else {
          throw new Error('No se pudo desactivar la reserva');
        }
      }
    });

    // Emitir evento Socket.IO para notificar a los clientes sobre la eliminación
    if (global.io) {
      global.io.emit('reserva_eliminada', { id: req.params.id });
      console.log('Evento Socket.IO emitido: reserva_eliminada');
    } else {
      console.log('Socket.IO no está disponible para emitir eventos');
    }

    res.status(200).json({ message: 'Reserva desactivada con éxito' });
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
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email', 'telefono']
        },
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

exports.getArchivedReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      where: { activo: false },
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
        }
      ]
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener las reservas archivadas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas archivadas' });
  }
};

exports.reactivateReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (reserva.activo) {
      return res.status(409).json({ error: 'La reserva ya está activa' });
    }

    // Verificar si hay conflicto de horario antes de reactivar
    const existingReservation = await Reserva.findOne({
      where: {
        fecha_reserva: reserva.fecha_reserva,
        hora_inicio: reserva.hora_inicio,
        estado: {
          [Op.in]: ['pendiente', 'confirmada']
        },
        activo: true,
        id: {
          [Op.ne]: reserva.id
        }
      }
    });

    if (existingReservation) {
      return res.status(409).json({ 
        error: 'No se puede reactivar la reserva porque el horario ya está ocupado' 
      });
    }

    // Reactivar la reserva y sus elementos relacionados
    await sequelize.transaction(async (t) => {
      // Reactivar reserva
      await Reserva.update(
        { activo: true },
        { 
          where: { id: req.params.id },
          transaction: t
        }
      );

      // Reactivar pagos asociados
      await Pago.update(
        { estado: 'pendiente' },
        {
          where: { 
            id_reserva: req.params.id,
            estado: 'fallido'
          },
          transaction: t
        }
      );

      // Reactivar finanzas asociadas
      await Finanza.update(
        { activo: true },
        {
          where: { 
            id_reserva: req.params.id,
            activo: false
          },
          transaction: t
        }
      );
    });

    res.json({ message: 'Reserva reactivada con éxito' });
  } catch (error) {
    console.error('Error al reactivar la reserva:', error);
    res.status(500).json({ error: 'Error al reactivar la reserva' });
  }
};

exports.updateReservaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado válido
    if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Obtener la reserva con sus pagos
    const reserva = await Reserva.findOne({
      where: { id },
      include: [{
        model: Pago,
        as: 'pagos'
      }]
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Validar transición de estado
    if (estado === 'confirmada') {
      // Calcular total de pagos completados
      const totalPagado = reserva.pagos
        .filter(p => p.estado === 'completado')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);

      if (totalPagado < parseFloat(reserva.total)) {
        return res.status(400).json({ 
          error: 'No se puede confirmar la reserva sin completar el pago total',
          totalPagado,
          totalRequerido: reserva.total
        });
      }
    }

    // Si se está cancelando, marcar pagos pendientes como fallidos
    if (estado === 'cancelada') {
      await Promise.all(
        reserva.pagos
          .filter(p => p.estado === 'pendiente')
          .map(p => p.update({ estado: 'fallido' }))
      );
    }

    // Actualizar estado de la reserva
    const [updated] = await Reserva.update(
      { estado },
      { 
        where: { id },
        user: req.user
      }
    );

    if (updated) {
      // Obtener la reserva actualizada con sus relaciones
      const updatedReserva = await Reserva.findOne({
        where: { id },
        include: [{
          model: Pago,
          as: 'pagos'
        }]
      });
      
      res.json(updatedReserva);
    } else {
      res.status(404).json({ error: 'Reserva no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado de la reserva:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
  }
};

// Nuevo método para validar pagos pendientes
exports.validarPagosPendientes = async (req, res) => {
  try {
    await Pago.validarPagosPendientes();
    res.json({ message: 'Validación de pagos pendientes completada' });
  } catch (error) {
    console.error('Error al validar pagos pendientes:', error);
    res.status(500).json({ error: 'Error al validar pagos pendientes' });
  }
};

exports.blockDates = async (req, res) => {
  try {
    const { dates } = req.body;
    
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de fechas para bloquear' });
    }

    // Verificar que todas las fechas sean futuras
    const today = moment().startOf('day').format('YYYY-MM-DD');
    const invalidDates = dates.filter(date => date < today);
    if (invalidDates.length > 0) {
      return res.status(400).json({ 
        error: 'No se pueden bloquear fechas pasadas',
        invalidDates 
      });
    }

    // Buscar IDs válidos para paquete, temática y mampara
    const paquete = await Paquete.findOne({ 
      order: [['id', 'ASC']] 
    });
    
    const tematica = await Tematica.findOne({ 
      order: [['id', 'ASC']] 
    });
    
    const mampara = await Mampara.findOne({ 
      order: [['id', 'ASC']] 
    });

    if (!paquete || !tematica || !mampara) {
      return res.status(400).json({ 
        error: 'No se encontraron los datos necesarios para crear bloqueos (paquete, temática o mampara)'
      });
    }

    // Obtener el usuario autenticado para verificación y auditoría
    const userId = req.user.id;
    const usuario = await Usuario.findOne({
      where: { 
        id: userId,
        activo: true 
      }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario autenticado no encontrado o inactivo' });
    }
    
    // Crear reservas de bloqueo para ambos horarios de cada fecha
    const blockReservations = [];
    const fechasNoDisponibles = [];
    const fechasBloqueadas = [];

    for (const date of dates) {
      let fechaDisponible = true;
      
      // Verificar disponibilidad del turno mañana
      const existingMorningReservation = await Reserva.findOne({
        where: {
          fecha_reserva: date,
          hora_inicio: '11:00:00',
          estado: {
            [Op.in]: ['pendiente', 'confirmada']
          }
        }
      });

      // Verificar disponibilidad del turno tarde
      const existingEveningReservation = await Reserva.findOne({
        where: {
          fecha_reserva: date,
          hora_inicio: '17:00:00',
          estado: {
            [Op.in]: ['pendiente', 'confirmada']
          }
        }
      });

      // Si el turno mañana está disponible, crear bloqueo
      if (!existingMorningReservation) {
        blockReservations.push({
          id_usuario: userId,
          id_paquete: paquete.id,
          fecha_reserva: date,
          hora_inicio: '11:00:00',
          hora_fin: '16:00:00',
          estado: 'confirmada',
          total: 0,
          nombre_festejado: 'BLOQUEO ADMINISTRATIVO',
          edad_festejado: 1, // Cambiado de 0 a 1 para cumplir con la restricción de la base de datos
          comentarios: 'Día bloqueado por administración',
          id_tematica: tematica.id,
          id_mampara: mampara.id,
        });
      } else {
        fechaDisponible = false;
      }

      // Si el turno tarde está disponible, crear bloqueo
      if (!existingEveningReservation) {
        blockReservations.push({
          id_usuario: userId,
          id_paquete: paquete.id,
          fecha_reserva: date,
          hora_inicio: '17:00:00',
          hora_fin: '22:00:00',
          estado: 'confirmada',
          total: 0,
          nombre_festejado: 'BLOQUEO ADMINISTRATIVO',
          edad_festejado: 1, // Cambiado de 0 a 1 para cumplir con la restricción de la base de datos
          comentarios: 'Día bloqueado por administración',
          id_tematica: tematica.id,
          id_mampara: mampara.id,
        });
      } else {
        fechaDisponible = false;
      }

      // Registrar si la fecha ya tenía reservas o se bloqueó exitosamente
      if (!fechaDisponible) {
        fechasNoDisponibles.push(date);
      } else {
        fechasBloqueadas.push(date);
      }
    }

    // Si no hay reservas para crear, informar al usuario
    if (blockReservations.length === 0) {
      return res.status(409).json({
        error: 'Todas las fechas seleccionadas ya tienen reservas',
        fechasNoDisponibles
      });
    }

    // Crear todas las reservas de bloqueo
    const nuevasReservas = await Reserva.bulkCreate(blockReservations, {
      user: usuario // Pasar el objeto usuario completo para los hooks de auditoría
    });

    // Emitir evento Socket.IO para notificar a los clientes sobre los nuevos bloqueos
    if (global.io) {
      global.io.emit('fechas_bloqueadas', {
        reservas: nuevasReservas,
        fechasBloqueadas
      });
      console.log('Evento Socket.IO emitido: fechas_bloqueadas');
    } else {
      console.log('Socket.IO no está disponible para emitir eventos');
    }

    // Preparar respuesta con información detallada
    const respuesta = { 
      message: 'Fechas bloqueadas exitosamente',
      total: blockReservations.length,
      fechasBloqueadas
    };

    // Si algunas fechas no estaban disponibles, incluirlas en la respuesta
    if (fechasNoDisponibles.length > 0) {
      respuesta.advertencia = 'Algunas fechas o turnos ya tenían reservas';
      respuesta.fechasNoDisponibles = fechasNoDisponibles;
    }

    res.status(201).json(respuesta);
  } catch (error) {
    console.error('Error al bloquear fechas:', error);
    res.status(500).json({ 
      error: 'Error al bloquear fechas',
      details: error.message 
    });
  }
};