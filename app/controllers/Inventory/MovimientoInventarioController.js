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

// Método para registrar salida de inventario utilizando estrategia FIFO
exports.registrarSalida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id_materia_prima, cantidad, descripcion, id_tipo_ajuste } = req.body;
    
    // Validar materia prima
    const materiaPrima = await MateriaPrima.findByPk(id_materia_prima, {
      transaction
    });
    
    if (!materiaPrima) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    // Validar stock disponible
    if (materiaPrima.stock_actual < cantidad) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente para realizar la salida'
      });
    }
    
    // Obtener lotes disponibles ordenados por FIFO y fecha de caducidad
    const lotes = await Lote.findLotesDisponiblesPorMateriaPrima(id_materia_prima);
    
    if (!lotes.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No hay lotes disponibles para esta materia prima'
      });
    }
    
    // Procesar la salida de inventario por lotes
    let cantidadRestante = parseFloat(cantidad);
    const lotesAfectados = [];
    
    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;
      
      const cantidadDisponible = parseFloat(lote.cantidad_actual);
      const cantidadAUsar = Math.min(cantidadRestante, cantidadDisponible);
      cantidadRestante -= cantidadAUsar;
      
      // Actualizar lote
      await lote.actualizarCantidad(cantidadAUsar, 'salida');
      
      // Marcar lote como en uso si no lo estaba
      if (!lote.en_uso) {
        await lote.marcarEnUso();
      }
      
      lotesAfectados.push({
        id: lote.id,
        codigo: lote.codigo_lote,
        cantidad_usada: cantidadAUsar,
        dias_para_caducidad: lote.diasParaCaducidad()
      });
      
      // Registrar movimiento de inventario para este lote
      await MovimientoInventario.create({
        id_materia_prima,
        id_lote: lote.id,
        tipo_movimiento: 'salida',
        cantidad: cantidadAUsar,
        fecha: new Date(),
        descripcion,
        id_tipo_ajuste,
        id_usuario: req.usuario?.id || null
      }, { transaction });
    }
    
    // Actualizar stock en materia prima
    await materiaPrima.update({
      stock_actual: materiaPrima.stock_actual - cantidad
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Salida de inventario registrada correctamente',
      lotes_afectados: lotesAfectados,
      total_procesado: parseFloat(cantidad)
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar la salida de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la salida de inventario',
      error: error.message
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

exports.updateMovimiento = async (req, res) => {
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

    // Buscar el movimiento actual para verificar cambios en cantidad
    const movimientoActual = await MovimientoInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      transaction
    });

    if (!movimientoActual) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    // Validaciones básicas
    if (!id_materia_prima || !tipo_movimiento || !cantidad) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Materia prima, tipo de movimiento y cantidad son requeridos'
      });
    }

    if (!['entrada', 'salida'].includes(tipo_movimiento)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Tipo de movimiento inválido'
      });
    }

    // Revertir el movimiento anterior
    let materiaPrima = await MateriaPrima.findByPk(movimientoActual.id_materia_prima, { transaction });
    let loteAnterior = movimientoActual.id_lote ? await Lote.findByPk(movimientoActual.id_lote, { transaction }) : null;

    if (movimientoActual.tipo_movimiento === 'entrada') {
      if (loteAnterior) {
        await loteAnterior.decrement('cantidad_actual', {
          by: movimientoActual.cantidad,
          transaction
        });
      }
      await materiaPrima.decrement('stock_actual', {
        by: movimientoActual.cantidad,
        transaction
      });
    } else {
      if (loteAnterior) {
        await loteAnterior.increment('cantidad_actual', {
          by: movimientoActual.cantidad,
          transaction
        });
      }
      await materiaPrima.increment('stock_actual', {
        by: movimientoActual.cantidad,
        transaction
      });
    }

    // Verificar materia prima nueva
    if (id_materia_prima !== movimientoActual.id_materia_prima) {
      materiaPrima = await MateriaPrima.findOne({
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

    // Actualizar movimiento
    const [updated] = await MovimientoInventario.update({
      id_materia_prima,
      id_lote,
      id_proveedor,
      id_tipo_ajuste,
      tipo_movimiento,
      cantidad,
      descripcion
    }, {
      where: {
        id: req.params.id,
        activo: true
      },
      transaction
    });

    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    // Aplicar nuevo movimiento
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

    const movimientoActualizado = await MovimientoInventario.findByPk(req.params.id, {
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

    res.json(movimientoActualizado);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({
      error: 'Error al actualizar movimiento',
      details: error.message
    });
  }
};

exports.deleteMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Buscar el movimiento a eliminar
    const movimiento = await MovimientoInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      transaction
    });

    if (!movimiento) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    // Revertir el efecto del movimiento en el stock
    const materiaPrima = await MateriaPrima.findByPk(movimiento.id_materia_prima, { transaction });
    const lote = movimiento.id_lote ? await Lote.findByPk(movimiento.id_lote, { transaction }) : null;

    if (movimiento.tipo_movimiento === 'entrada') {
      // Si era una entrada, reducimos el stock
      if (lote) {
        // Verificar que haya suficiente stock en el lote
        if (parseFloat(lote.cantidad_actual) < parseFloat(movimiento.cantidad)) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'No se puede eliminar el movimiento porque se ha utilizado parte del stock'
          });
        }
        
        await lote.decrement('cantidad_actual', {
          by: movimiento.cantidad,
          transaction
        });
      }
      
      // Verificar que haya suficiente stock en la materia prima
      if (parseFloat(materiaPrima.stock_actual) < parseFloat(movimiento.cantidad)) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'No se puede eliminar el movimiento porque se ha utilizado parte del stock'
        });
      }
      
      await materiaPrima.decrement('stock_actual', {
        by: movimiento.cantidad,
        transaction
      });
    } else {
      // Si era una salida, aumentamos el stock
      if (lote) {
        await lote.increment('cantidad_actual', {
          by: movimiento.cantidad,
          transaction
        });
      }
      
      await materiaPrima.increment('stock_actual', {
        by: movimiento.cantidad,
        transaction
      });
    }

    // Marcar como inactivo el movimiento
    const [deleted] = await MovimientoInventario.update(
      { activo: false },
      {
        where: {
          id: req.params.id,
          activo: true
        },
        transaction
      }
    );

    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    await transaction.commit();
    res.json({ message: 'Movimiento eliminado con éxito' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({
      error: 'Error al eliminar movimiento',
      details: error.message
    });
  }
};

// Obtener estadísticas de consumo para proyecciones
exports.obtenerEstadisticasConsumo = async (req, res) => {
  try {
    const { id_materia_prima, periodo } = req.query;
    
    // Validar parámetros
    if (!id_materia_prima) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la materia prima'
      });
    }
    
    // Definir el período de análisis (por defecto 30 días)
    const diasAnalisis = periodo ? parseInt(periodo) : 30;
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasAnalisis);
    
    // Obtener todos los movimientos de salida en el período
    const movimientos = await MovimientoInventario.findAll({
      where: {
        id_materia_prima,
        tipo_movimiento: 'salida',
        fecha: {
          [Op.gte]: fechaInicio
        },
        activo: true
      },
      order: [['fecha', 'ASC']]
    });
    
    // Calcular estadísticas de consumo
    const totalConsumido = movimientos.reduce((sum, mov) => sum + parseFloat(mov.cantidad), 0);
    const consumoDiario = totalConsumido / diasAnalisis;
    
    // Calcular tendencia de consumo (aumento o disminución)
    let tendencia = 0;
    
    if (movimientos.length > 1) {
      // Dividir en dos períodos para comparar
      const mitad = Math.floor(movimientos.length / 2);
      const primeraConsumido = movimientos.slice(0, mitad).reduce((sum, mov) => sum + parseFloat(mov.cantidad), 0);
      const segundaConsumido = movimientos.slice(mitad).reduce((sum, mov) => sum + parseFloat(mov.cantidad), 0);
      
      // Calcular porcentaje de cambio
      if (primeraConsumido > 0) {
        tendencia = ((segundaConsumido - primeraConsumido) / primeraConsumido) * 100;
      }
    }
    
    // Calcular proyección de stock
    const materiaPrima = await MateriaPrima.findByPk(id_materia_prima);
    
    const stockActual = materiaPrima ? parseFloat(materiaPrima.stock_actual) : 0;
    const diasEstimados = consumoDiario > 0 ? Math.floor(stockActual / consumoDiario) : null;
    
    // Obtener lotes próximos a caducar
    const lotesCaducidad = await Lote.findProximosACaducar(30); // Próximos 30 días
    const lotesMaterialCaducidad = lotesCaducidad.filter(lote => lote.id_materia_prima === parseInt(id_materia_prima));
    
    res.status(200).json({
      success: true,
      estadisticas: {
        total_consumido: totalConsumido,
        consumo_diario: consumoDiario,
        tendencia_porcentaje: tendencia,
        stock_actual: stockActual,
        dias_estimados: diasEstimados,
        lotes_por_caducar: lotesMaterialCaducidad.map(lote => ({
          id: lote.id,
          codigo: lote.codigo_lote,
          cantidad: lote.cantidad_actual,
          fecha_caducidad: lote.fecha_caducidad,
          dias_restantes: lote.diasParaCaducidad()
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de consumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de consumo',
      error: error.message
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