const { Op } = require('sequelize');
const MovimientoInventario = require('../../models/Inventory/MovimientoInventario');
const MateriaPrima = require('../../models/Inventory/MateriaPrima');
const Lote = require('../../models/Inventory/Lote');
const TipoAjuste = require('../../models/Inventory/TipoAjuste');
const Proveedor = require('../../models/Inventory/Proveedor');
const sequelize = require('../../config/database');

exports.getAllMovimientos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;

    const where = { activo: true };
    
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha[Op.gte] = fechaInicio;
      if (fechaFin) where.fecha[Op.lte] = fechaFin;
    }

    if (tipo) {
      where.tipo_movimiento = tipo;
    }

    const movimientos = await MovimientoInventario.findAll({
      where,
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Lote,
          as: 'lote',
          attributes: ['codigo_lote']
        },
        {
          model: TipoAjuste,
          as: 'tipoAjuste',
          attributes: ['nombre']
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      error: 'Error al obtener movimientos',
      details: error.message
    });
  }
};

exports.getMovimientoById = async (req, res) => {
  try {
    const movimiento = await MovimientoInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre', 'id_unidad_medida']
        },
        {
          model: Lote,
          as: 'lote',
          attributes: ['codigo_lote', 'fecha_caducidad']
        },
        {
          model: TipoAjuste,
          as: 'tipoAjuste',
          attributes: ['nombre', 'requiere_autorizacion']
        },
        {
          model: Proveedor,
          as: 'proveedor',
          attributes: ['nombre']
        }
      ]
    });

    if (!movimiento) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    res.json(movimiento);
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    res.status(500).json({
      error: 'Error al obtener movimiento',
      details: error.message
    });
  }
};

exports.createMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      id_materia_prima,
      id_lote,
      id_proveedor,
      id_tipo_ajuste,
      tipo_movimiento,
      cantidad,
      descripcion
    } = req.body;

    // Validaciones básicas
    if (!id_materia_prima || !tipo_movimiento || !cantidad) {
      return res.status(400).json({
        error: 'Materia prima, tipo de movimiento y cantidad son requeridos'
      });
    }

    if (!['entrada', 'salida'].includes(tipo_movimiento)) {
      return res.status(400).json({
        error: 'Tipo de movimiento inválido'
      });
    }

    // Verificar materia prima
    const materiaPrima = await MateriaPrima.findOne({
      where: {
        id: id_materia_prima,
        activo: true
      },
      transaction
    });

    if (!materiaPrima) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Materia prima no válida'
      });
    }

    // Verificar lote si se proporciona
    let lote;
    if (id_lote) {
      lote = await Lote.findOne({
        where: {
          id: id_lote,
          activo: true
        },
        transaction
      });

      if (!lote) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Lote no válido'
        });
      }
    }

    // Verificar tipo de ajuste si se proporciona
    if (id_tipo_ajuste) {
      const tipoAjuste = await TipoAjuste.findOne({
        where: {
          id: id_tipo_ajuste,
          activo: true
        },
        transaction
      });

      if (!tipoAjuste) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Tipo de ajuste no válido'
        });
      }

      // Verificar autorización si es requerida
      if (tipoAjuste.requiere_autorizacion && !req.user.tipo_usuario === 'admin') {
        await transaction.rollback();
        return res.status(403).json({
          error: 'Este tipo de ajuste requiere autorización de un administrador'
        });
      }
    }

    // Verificar stock suficiente para salidas
    if (tipo_movimiento === 'salida') {
      if (lote) {
        if (parseFloat(lote.cantidad_actual) < parseFloat(cantidad)) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Stock insuficiente en el lote'
          });
        }
      } else if (parseFloat(materiaPrima.stock_actual) < parseFloat(cantidad)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Stock insuficiente'
        });
      }
    }

    // Crear movimiento
    const movimiento = await MovimientoInventario.create({
      id_materia_prima,
      id_lote,
      id_proveedor,
      id_tipo_ajuste,
      tipo_movimiento,
      cantidad,
      descripcion,
      id_usuario: req.user.id
    }, { transaction });

    // Actualizar stock
    if (tipo_movimiento === 'entrada') {
      if (lote) {
        await lote.increment('cantidad_actual', {
          by: cantidad,
          transaction
        });
      }
      await materiaPrima.increment('stock_actual', {
        by: cantidad,
        transaction
      });
    } else {
      if (lote) {
        await lote.decrement('cantidad_actual', {
          by: cantidad,
          transaction
        });
      }
      await materiaPrima.decrement('stock_actual', {
        by: cantidad,
        transaction
      });
    }

    await transaction.commit();

    const movimientoCompleto = await MovimientoInventario.findByPk(movimiento.id, {
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Lote,
          as: 'lote',
          attributes: ['codigo_lote']
        },
        {
          model: TipoAjuste,
          as: 'tipoAjuste',
          attributes: ['nombre']
        }
      ]
    });

    res.status(201).json(movimientoCompleto);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear movimiento:', error);
    res.status(500).json({
      error: 'Error al crear movimiento',
      details: error.message
    });
  }
};

exports.getMovimientosByMateriaPrima = async (req, res) => {
  try {
    const { id_materia_prima } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const where = {
      id_materia_prima,
      activo: true
    };

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha[Op.gte] = fechaInicio;
      if (fechaFin) where.fecha[Op.lte] = fechaFin;
    }

    const movimientos = await MovimientoInventario.findAll({
      where,
      include: [
        {
          model: Lote,
          as: 'lote',
          attributes: ['codigo_lote']
        },
        {
          model: TipoAjuste,
          as: 'tipoAjuste',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos por materia prima:', error);
    res.status(500).json({
      error: 'Error al obtener movimientos por materia prima',
      details: error.message
    });
  }
};

exports.getMovimientosByLote = async (req, res) => {
  try {
    const { id_lote } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const where = {
      id_lote,
      activo: true
    };

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha[Op.gte] = fechaInicio;
      if (fechaFin) where.fecha[Op.lte] = fechaFin;
    }

    const movimientos = await MovimientoInventario.findAll({
      where,
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: TipoAjuste,
          as: 'tipoAjuste',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos por lote:', error);
    res.status(500).json({
      error: 'Error al obtener movimientos por lote',
      details: error.message
    });
  }
};