const { Op } = require('sequelize');
const Lote = require('../../models/Inventory/Lote');
const MateriaPrima = require('../../models/Inventory/MateriaPrima');
const MovimientoInventario = require('../../models/Inventory/MovimientoInventario');
const AlertaInventario = require('../../models/Inventory/AlertaInventario');

exports.getAllLotes = async (req, res) => {
  try {
    const lotes = await Lote.findAll({
      where: { activo: true },
      include: [{
        model: MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre']
      }],
      order: [['fecha_caducidad', 'ASC']]
    });
    res.json(lotes);
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    res.status(500).json({
      error: 'Error al obtener lotes',
      details: error.message
    });
  }
};

exports.getLoteById = async (req, res) => {
  try {
    const lote = await Lote.findOne({
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
          model: MovimientoInventario,
          as: 'movimientos',
          where: { activo: true },
          required: false,
          limit: 5,
          order: [['fecha', 'DESC']]
        }
      ]
    });

    if (!lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    res.json(lote);
  } catch (error) {
    console.error('Error al obtener lote:', error);
    res.status(500).json({
      error: 'Error al obtener lote',
      details: error.message
    });
  }
};

exports.createLote = async (req, res) => {
  try {
    const {
      id_materia_prima,
      codigo_lote,
      fecha_produccion,
      fecha_caducidad,
      cantidad_inicial,
      costo_unitario
    } = req.body;

    // Validaciones básicas
    if (!id_materia_prima || !codigo_lote || !cantidad_inicial || !costo_unitario) {
      return res.status(400).json({
        error: 'Materia prima, código de lote, cantidad inicial y costo unitario son requeridos'
      });
    }

    // Verificar materia prima
    const materiaPrima = await MateriaPrima.findOne({
      where: {
        id: id_materia_prima,
        activo: true
      }
    });

    if (!materiaPrima) {
      return res.status(400).json({
        error: 'Materia prima no válida'
      });
    }

    // Verificar código de lote único para la materia prima
    const loteExistente = await Lote.findOne({
      where: {
        id_materia_prima,
        codigo_lote,
        activo: true
      }
    });

    if (loteExistente) {
      return res.status(409).json({
        error: 'Ya existe un lote con ese código para esta materia prima'
      });
    }

    // Validar fechas
    if (fecha_produccion && fecha_caducidad) {
      if (new Date(fecha_caducidad) <= new Date(fecha_produccion)) {
        return res.status(400).json({
          error: 'La fecha de caducidad debe ser posterior a la fecha de producción'
        });
      }
    }

    const lote = await Lote.create({
      id_materia_prima,
      codigo_lote,
      fecha_produccion,
      fecha_caducidad,
      cantidad_inicial,
      cantidad_actual: cantidad_inicial,
      costo_unitario
    });

    // Crear movimiento de entrada inicial
    await MovimientoInventario.create({
      id_materia_prima,
      id_lote: lote.id,
      tipo_movimiento: 'entrada',
      cantidad: cantidad_inicial,
      descripcion: 'Entrada inicial de lote',
      id_usuario: req.user.id
    });

    // Actualizar stock de materia prima
    await materiaPrima.increment('stock_actual', { by: cantidad_inicial });

    // Verificar si necesita alerta de caducidad
    if (fecha_caducidad) {
      const diasParaCaducar = Math.ceil(
        (new Date(fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (diasParaCaducar <= 7) {
        await AlertaInventario.crearAlertaCaducidad(materiaPrima, [req.user], diasParaCaducar);
      }
    }

    const loteConRelaciones = await Lote.findByPk(lote.id, {
      include: [{
        model: MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre']
      }]
    });

    res.status(201).json(loteConRelaciones);
  } catch (error) {
    console.error('Error al crear lote:', error);
    res.status(500).json({
      error: 'Error al crear lote',
      details: error.message
    });
  }
};

exports.updateLote = async (req, res) => {
  try {
    const {
      codigo_lote,
      fecha_produccion,
      fecha_caducidad,
      costo_unitario
    } = req.body;

    const lote = await Lote.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    // Verificar código de lote único
    if (codigo_lote && codigo_lote !== lote.codigo_lote) {
      const loteExistente = await Lote.findOne({
        where: {
          id_materia_prima: lote.id_materia_prima,
          codigo_lote,
          id: { [Op.ne]: lote.id },
          activo: true
        }
      });

      if (loteExistente) {
        return res.status(409).json({
          error: 'Ya existe un lote con ese código para esta materia prima'
        });
      }
    }

    // Validar fechas
    if (fecha_produccion && fecha_caducidad) {
      if (new Date(fecha_caducidad) <= new Date(fecha_produccion)) {
        return res.status(400).json({
          error: 'La fecha de caducidad debe ser posterior a la fecha de producción'
        });
      }
    }

    await lote.update({
      codigo_lote,
      fecha_produccion,
      fecha_caducidad,
      costo_unitario
    });

    const loteActualizado = await Lote.findByPk(lote.id, {
      include: [{
        model: MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre']
      }]
    });

    res.json(loteActualizado);
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    res.status(500).json({
      error: 'Error al actualizar lote',
      details: error.message
    });
  }
};

exports.deleteLote = async (req, res) => {
  try {
    const lote = await Lote.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    if (lote.cantidad_actual > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar un lote que aún tiene existencias'
      });
    }

    await lote.update({ activo: false });

    res.json({ message: 'Lote eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar lote:', error);
    res.status(500).json({
      error: 'Error al eliminar lote',
      details: error.message
    });
  }
};

exports.getLotesByMateriaPrima = async (req, res) => {
  try {
    const { id_materia_prima } = req.params;
    const { incluir_sin_stock } = req.query;

    const where = {
      id_materia_prima,
      activo: true
    };

    if (!incluir_sin_stock) {
      where.cantidad_actual = {
        [Op.gt]: 0
      };
    }

    const lotes = await Lote.findAll({
      where,
      order: [['fecha_caducidad', 'ASC']]
    });

    res.json(lotes);
  } catch (error) {
    console.error('Error al obtener lotes por materia prima:', error);
    res.status(500).json({
      error: 'Error al obtener lotes por materia prima',
      details: error.message
    });
  }
};

exports.getProximosACaducar = async (req, res) => {
  try {
    const diasLimite = parseInt(req.query.dias) || 7;
    const lotes = await Lote.findProximosACaducar(diasLimite);
    res.json(lotes);
  } catch (error) {
    console.error('Error al obtener lotes próximos a caducar:', error);
    res.status(500).json({
      error: 'Error al obtener lotes próximos a caducar',
      details: error.message
    });
  }
};