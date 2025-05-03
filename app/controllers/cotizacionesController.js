const db = require('../models');
const { sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { generateTrackingCode } = require('../utils/codeGenerator');

/**
 * Controlador para gestionar cotizaciones
 */
const cotizacionesController = {
  /**
   * Crear una nueva cotización
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  crearCotizacion: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const { 
        id_usuario, 
        id_paquete, 
        id_tematica, 
        id_mampara, 
        id_opcion_alimento,
        fecha_reserva, 
        hora_inicio, 
        hora_fin, 
        nombre_festejado, 
        edad_festejado,
        genero_festejado,
        comentarios,
        extras,
        total
      } = req.body;
      
      // Generar código de seguimiento único
      const codigoSeguimiento = generateTrackingCode('COT');
      
      // Calcular fecha de expiración (48 horas desde ahora)
      const fechaExpiracion = new Date();
      fechaExpiracion.setHours(fechaExpiracion.getHours() + 48);
      
      // Crear cotización en la base de datos usando la función SQL
      const [result] = await sequelize.query(
        `SELECT * FROM main.crear_cotizacion(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )`,
        {
          bind: [
            id_usuario,
            id_paquete,
            id_tematica || null,
            id_mampara || null,
            id_opcion_alimento || null,
            fecha_reserva,
            hora_inicio,
            hora_fin,
            nombre_festejado || null,
            edad_festejado || null,
            genero_festejado || null,
            comentarios || null,
            codigoSeguimiento,
            fechaExpiracion.toISOString(),
            total
          ],
          transaction: t
        }
      );
      
      const cotizacionId = result[0].crear_cotizacion;
      
      // Procesar extras si existen
      if (extras && extras.length > 0) {
        for (const extra of extras) {
          await sequelize.query(
            `INSERT INTO main.cotizacion_extras (
              id_cotizacion, id_extra, cantidad
            ) VALUES ($1, $2, $3)`,
            {
              bind: [cotizacionId, extra.id, extra.cantidad],
              transaction: t
            }
          );
        }
      }
      
      // Obtener la cotización completa
      const [cotizacion] = await sequelize.query(
        `SELECT * FROM main.cotizaciones WHERE id = $1`,
        {
          bind: [cotizacionId],
          transaction: t
        }
      );
      
      await t.commit();
      
      res.status(201).json({
        success: true,
        message: 'Cotización creada exitosamente',
        cotizacion: cotizacion[0]
      });
    } catch (error) {
      await t.rollback();
      console.error('Error al crear cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cotización',
        error: error.message
      });
    }
  },
  
  /**
   * Obtener todas las cotizaciones del usuario actual
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  obtenerCotizacionesUsuario: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [cotizaciones] = await sequelize.query(
        `SELECT c.*, 
          p.nombre as paquete_nombre,
          t.nombre as tematica_nombre,
          m.nombre as mampara_nombre,
          oa.nombre as opcion_alimento_nombre
        FROM main.cotizaciones c
        LEFT JOIN main.paquetes p ON c.id_paquete = p.id
        LEFT JOIN main.tematicas t ON c.id_tematica = t.id
        LEFT JOIN main.mamparas m ON c.id_mampara = m.id
        LEFT JOIN main.opciones_alimentos oa ON c.id_opcion_alimento = oa.id
        WHERE c.id_usuario = $1
        ORDER BY c.fecha_creacion DESC`,
        {
          bind: [userId]
        }
      );
      
      res.status(200).json({
        success: true,
        cotizaciones
      });
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las cotizaciones',
        error: error.message
      });
    }
  },
  
  /**
   * Obtener detalles de una cotización específica
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  obtenerCotizacion: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Obtener cotización
      const [cotizaciones] = await sequelize.query(
        `SELECT c.*, 
          p.nombre as paquete_nombre,
          t.nombre as tematica_nombre,
          m.nombre as mampara_nombre,
          oa.nombre as opcion_alimento_nombre
        FROM main.cotizaciones c
        LEFT JOIN main.paquetes p ON c.id_paquete = p.id
        LEFT JOIN main.tematicas t ON c.id_tematica = t.id
        LEFT JOIN main.mamparas m ON c.id_mampara = m.id
        LEFT JOIN main.opciones_alimentos oa ON c.id_opcion_alimento = oa.id
        WHERE c.id = $1 AND (c.id_usuario = $2 OR $3)`,
        {
          bind: [id, userId, req.user.tipo_usuario === 'admin']
        }
      );
      
      if (cotizaciones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
      }
      
      // Obtener extras de la cotización
      const [extras] = await sequelize.query(
        `SELECT ce.*, e.nombre, e.descripcion, e.precio
        FROM main.cotizacion_extras ce
        JOIN main.extras e ON ce.id_extra = e.id
        WHERE ce.id_cotizacion = $1`,
        {
          bind: [id]
        }
      );
      
      const cotizacion = {
        ...cotizaciones[0],
        extras
      };
      
      res.status(200).json({
        success: true,
        cotizacion
      });
    } catch (error) {
      console.error('Error al obtener cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la cotización',
        error: error.message
      });
    }
  },
  
  /**
   * Convertir una cotización en reserva
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  convertirAReserva: async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar que la cotización exista y pertenezca al usuario
      const [cotizaciones] = await sequelize.query(
        `SELECT * FROM main.cotizaciones 
        WHERE id = $1 AND id_usuario = $2 AND estado = 'creada'`,
        {
          bind: [id, userId],
          transaction: t
        }
      );
      
      if (cotizaciones.length === 0) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Cotización no encontrada o no disponible para conversión'
        });
      }
      
      // Convertir cotización a reserva usando la función SQL
      const [result] = await sequelize.query(
        `SELECT * FROM main.convertir_cotizacion_a_reserva($1)`,
        {
          bind: [id],
          transaction: t
        }
      );
      
      const reservaId = result[0].convertir_cotizacion_a_reserva;
      
      // Obtener la reserva creada
      const [reservas] = await sequelize.query(
        `SELECT r.*, 
          p.nombre as paquete_nombre,
          t.nombre as tematica_nombre,
          m.nombre as mampara_nombre,
          oa.nombre as opcion_alimento_nombre
        FROM main.reservas r
        LEFT JOIN main.paquetes p ON r.id_paquete = p.id
        LEFT JOIN main.tematicas t ON r.id_tematica = t.id
        LEFT JOIN main.mamparas m ON r.id_mampara = m.id
        LEFT JOIN main.opciones_alimentos oa ON r.id_opcion_alimento = oa.id
        WHERE r.id = $1`,
        {
          bind: [reservaId],
          transaction: t
        }
      );
      
      // Obtener extras de la reserva
      const [extras] = await sequelize.query(
        `SELECT re.*, e.nombre, e.descripcion, e.precio
        FROM main.reserva_extras re
        JOIN main.extras e ON re.id_extra = e.id
        WHERE re.id_reserva = $1`,
        {
          bind: [reservaId],
          transaction: t
        }
      );
      
      const reserva = {
        ...reservas[0],
        extras
      };
      
      await t.commit();
      
      res.status(200).json({
        success: true,
        message: 'Cotización convertida a reserva exitosamente',
        reserva
      });
    } catch (error) {
      await t.rollback();
      console.error('Error al convertir cotización a reserva:', error);
      res.status(500).json({
        success: false,
        message: 'Error al convertir la cotización a reserva',
        error: error.message
      });
    }
  },
  
  /**
   * Verificar disponibilidad para una cotización
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  verificarDisponibilidad: async (req, res) => {
    try {
      const { 
        fecha_reserva, 
        hora_inicio, 
        hora_fin,
        id_opcion_alimento
      } = req.body;
      
      // Verificar conflictos de horario
      const [conflictos] = await sequelize.query(
        `SELECT EXISTS (
          SELECT 1
          FROM main.reservas r
          WHERE r.fecha_reserva = $1
          AND r.estado = 'confirmada'
          AND (
            (r.hora_inicio <= $2 AND r.hora_fin > $2) OR
            (r.hora_inicio < $3 AND r.hora_fin >= $3) OR
            (r.hora_inicio >= $2 AND r.hora_fin <= $3)
          )
        ) as conflicto`,
        {
          bind: [fecha_reserva, hora_inicio, hora_fin]
        }
      );
      
      const tieneConflicto = conflictos[0].conflicto;
      
      // Verificar disponibilidad de inventario si se seleccionó opción de alimento
      let inventarioDisponible = true;
      
      if (id_opcion_alimento) {
        const [resultado] = await sequelize.query(
          `SELECT NOT EXISTS (
            SELECT 1
            FROM main.opciones_alimentos oa
            JOIN inventario.materias_primas mp ON oa.id_materia_prima = mp.id
            WHERE oa.id = $1
            AND oa.id_materia_prima IS NOT NULL
            AND mp.stock_actual < oa.cantidad
          ) as disponible`,
          {
            bind: [id_opcion_alimento]
          }
        );
        
        inventarioDisponible = resultado[0].disponible;
      }
      
      res.status(200).json({
        success: true,
        disponible: !tieneConflicto && inventarioDisponible,
        conflictoHorario: tieneConflicto,
        inventarioDisponible
      });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad',
        error: error.message
      });
    }
  }
};

module.exports = cotizacionesController;