const Pago = require('../models/Pago');
const Reserva = require('../models/Reserva');
const PreReserva = require('../models/PreReserva');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Inicia el proceso de pago y crea una pre-reserva temporal
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
exports.iniciarProcesoPago = async (req, res, next) => {
  try {
    const { datosReserva, metodo_pago } = req.body;
    const id_usuario = req.user.id;
    
    // Verificar que se proporcionaron los datos necesarios
    if (!datosReserva || !metodo_pago) {
      return res.status(400).json({
        success: false,
        message: 'Datos insuficientes para iniciar el proceso de pago'
      });
    }
    
    // Verificar disponibilidad en la fecha/hora solicitada
    const disponible = await verificarDisponibilidad(datosReserva);
    if (!disponible) {
      return res.status(409).json({
        success: false,
        message: 'No hay disponibilidad en la fecha y hora seleccionadas'
      });
    }
    
    // Crear pre-reserva con expiración (30 minutos)
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 30);
    
    const preReserva = await PreReserva.create({
      id_usuario: id_usuario,
      datos_reserva: datosReserva,
      fecha_expiracion: expiracion,
      estado: 'pendiente'
    });
    
    // Calcular monto total
    const montoTotal = calcularMontoTotal(datosReserva);
    
    // Crear registro de pago pendiente
    const pago = await Pago.create({
      id_pre_reserva: preReserva.id,
      metodo_pago: metodo_pago,
      monto: montoTotal,
      fecha_pago: new Date(),
      estado: 'pendiente',
      es_pago_parcial: false,
      expiracion_pre_reserva: expiracion
    });
    
    // Generar datos para procesamiento con proveedor externo de pagos
    const datosPago = generarDatosProcesadorPago(pago, preReserva);
    
    res.status(201).json({
      success: true,
      pago: {
        id: pago.id,
        monto: pago.monto,
        expiracion: pago.expiracion_pre_reserva
      },
      datosProcesamiento: datosPago
    });
  } catch (error) {
    console.error('Error al iniciar proceso de pago:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

/**
 * Confirma un pago y crea la reserva definitiva
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
exports.confirmarPago = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_pago, token_transaccion, datos_transaccion } = req.body;
    
    // Buscar el pago con su pre-reserva
    const pago = await Pago.findByPk(id_pago, {
      include: [{
        model: PreReserva,
        as: 'preReserva'
      }],
      transaction
    });
    
    if (!pago) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }
    
    // Verificar si la pre-reserva ha expirado
    if (pago.haExpirado()) {
      // Actualizar estado de pre-reserva a expirada
      await pago.preReserva.update(
        { estado: 'expirada' },
        { transaction }
      );
      
      await transaction.commit();
      
      return res.status(400).json({
        success: false,
        message: 'La pre-reserva ha expirado'
      });
    }
    
    // Verificar el pago con el proveedor externo (simulado)
    const verificacion = await verificarPagoConProveedor(token_transaccion);
    
    if (!verificacion.success) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se pudo verificar el pago',
        detalles: verificacion.detalles
      });
    }
    
    // Actualizar pago como completado
    await pago.update({
      estado: 'completado',
      token_transaccion,
      datos_transaccion
    }, { transaction });
    
    // Actualizar pre-reserva como completada
    await pago.preReserva.update({
      estado: 'completada'
    }, { transaction });
    
    // Crear reserva definitiva a partir de pre-reserva
    const datosReserva = pago.preReserva.datos_reserva;
    const reserva = await Reserva.create({
      ...datosReserva,
      id_usuario: pago.preReserva.id_usuario,
      estado: 'confirmada',
      fecha_creacion: new Date(),
      codigo_seguimiento: datosReserva.codigo_seguimiento || generateTrackingCode()
    }, { transaction });
    
    // Actualizar pago con referencia a la reserva
    await pago.update({
      id_reserva: reserva.id
    }, { transaction });
    
    await transaction.commit();
    
    // Buscar la reserva completa con sus relaciones
    const reservaCompleta = await Reserva.findOne({
      where: { id: reserva.id },
      include: [
        { model: sequelize.models.Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'telefono'] },
        { model: sequelize.models.Paquete, as: 'paquete', attributes: ['id', 'nombre'] },
        { model: sequelize.models.OpcionAlimento, as: 'opcionAlimento', attributes: ['id', 'nombre'] },
        { model: sequelize.models.Tematica, as: 'tematicaReserva', attributes: ['id', 'nombre'] },
        {
          model: sequelize.models.Mampara,
          as: 'mampara',
          attributes: ['id', 'piezas', 'precio'],
          include: [
            { model: sequelize.models.Tematica, as: 'tematica', attributes: ['id', 'nombre'] }
          ]
        }
      ]
    });
    
    // Emitir evento Socket.IO para notificar a los clientes sobre la nueva reserva
    if (global.io) {
      global.io.emit('reserva_creada', reservaCompleta);
      console.log('Evento Socket.IO emitido: reserva_creada');
    }
    
    res.status(200).json({
      success: true,
      reserva: {
        id: reserva.id,
        estado: reserva.estado,
        total: reserva.total
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al confirmar pago:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

/**
 * Obtiene un pago asociado a una pre-reserva
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
exports.obtenerPagoPorPreReserva = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pago = await Pago.findOne({
      where: { id_pre_reserva: id },
      include: [{
        model: PreReserva,
        as: 'preReserva'
      }]
    });
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado para la pre-reserva indicada'
      });
    }
    
    res.json({
      success: true,
      pago: {
        id: pago.id,
        monto: pago.monto,
        estado: pago.estado,
        expiracion: pago.expiracion_pre_reserva,
        metodo_pago: pago.metodo_pago
      }
    });
  } catch (error) {
    console.error('Error al obtener pago por pre-reserva:', {
      error: error.message,
      stack: error.stack,
      preReservaId: req.params.id,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

/**
 * Verifica disponibilidad para una nueva reserva
 * @param {Object} datosReserva - Datos de la reserva a verificar
 * @returns {Promise<boolean>} - Retorna true si está disponible
 */
async function verificarDisponibilidad(datosReserva) {
  try {
    const { fecha_reserva, hora_inicio, hora_fin } = datosReserva;
    
    // Verificar que no exista otra reserva en el mismo horario
    const reservasExistentes = await Reserva.count({
      where: {
        fecha_reserva,
        estado: 'confirmada',
        [Op.or]: [
          {
            [Op.and]: [
              { hora_inicio: { [Op.lt]: hora_fin } },
              { hora_fin: { [Op.gt]: hora_inicio } }
            ]
          }
        ]
      }
    });
    
    return reservasExistentes === 0;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Calcula el monto total de la reserva
 * @param {Object} datosReserva - Datos de la reserva 
 * @returns {number} - Monto total calculado
 */
function calcularMontoTotal(datosReserva) {
  // Aquí se implementaría la lógica real de cálculo del total
  // Esta es una versión simplificada
  return datosReserva.total || 0;
}

/**
 * Genera datos para procesamiento con proveedor externo
 * @param {Object} pago - Objeto de pago 
 * @param {Object} preReserva - Objeto de pre-reserva
 * @returns {Object} - Datos para el procesador de pago
 */
function generarDatosProcesadorPago(pago, preReserva) {
  // Esta función simula la generación de datos para un procesador de pagos
  return {
    referencia: `PAY-${pago.id}-${Date.now()}`,
    monto: pago.monto,
    concepto: `Pre-reserva #${preReserva.id}`,
    expiracion: pago.expiracion_pre_reserva
  };
}

/**
 * Verifica un pago con proveedor externo
 * @param {string} token - Token de transacción a verificar
 * @returns {Object} - Resultado de la verificación
 */
async function verificarPagoConProveedor(token) {
  // Esta función simula la verificación con un proveedor externo
  return {
    success: true,
    detalles: {
      transaccion_id: token,
      estado: 'aprobado',
      fecha: new Date().toISOString()
    }
  };
}

/**
 * Genera un código de seguimiento de 10 caracteres
 * @returns {string} Código de seguimiento
 */
function generateTrackingCode() {
  // Obtener fecha actual
  const now = new Date();
  
  // Extraer componentes de fecha (2 dígitos del año, mes y día)
  const year = now.getFullYear().toString().slice(2); // 2 dígitos
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 2 dígitos
  const day = now.getDate().toString().padStart(2, '0'); // 2 dígitos
  
  // Generar parte aleatoria (4 dígitos para completar 10 caracteres en total)
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  
  // Construir código: YYMMDDXXXX (exactamente 10 caracteres)
  return `${year}${month}${day}${randomPart}`;
}

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
    // Validar datos de entrada
    const { id_reserva, monto, metodo_pago, estado } = req.body;
    
    if (!id_reserva) {
      return res.status(400).json({ error: 'El ID de reserva es requerido' });
    }
    
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número positivo' });
    }
    
    // Verificar que la reserva exista
    const reserva = await sequelize.models.Reserva.findByPk(id_reserva);
    if (!reserva) {
      return res.status(404).json({ error: `La reserva con ID ${id_reserva} no existe` });
    }
    
    // Calcular el total de pagos completados para esta reserva
    const totalPagosCompletados = parseFloat(
      await Pago.sum('monto', {
        where: {
          id_reserva,
          estado: 'completado'
        }
      }) || 0
    );
    
    // Verificar que el nuevo pago no exceda el total de la reserva
    const nuevoTotal = totalPagosCompletados + parseFloat(monto);
    const totalReserva = parseFloat(reserva.total);
    
    if (nuevoTotal > totalReserva) {
      return res.status(400).json({
        error: `El monto total de pagos (${nuevoTotal}) excede el total de la reserva (${totalReserva})`,
        detalles: {
          pagosAnteriores: totalPagosCompletados,
          nuevoPago: parseFloat(monto),
          totalCalculado: nuevoTotal,
          totalReserva
        }
      });
    }
    
    // Crear el pago
    const pago = await Pago.create(req.body);
    res.status(201).json(pago);
  } catch (error) {
    console.error('Error en createPago:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    
    // Manejar diferentes tipos de errores
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Error de validación',
        detalles: error.errors.map(e => e.message)
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Error de clave foránea. Asegúrate de que todas las referencias existan.'
      });
    }
    
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
