const { Op } = require('sequelize');
const MateriaPrima = require('../../models/Inventory/MateriaPrima');
const UnidadMedida = require('../../models/Inventory/UnidadMedida');
const Lote = require('../../models/Inventory/Lote');
const AlertaInventario = require('../../models/Inventory/AlertaInventario');
const MovimientoInventario = require('../../models/Inventory/MovimientoInventario');
const Usuario = require('../../models/Usuario');

exports.getAllMateriasPrimas = async (req, res) => {
  try {
    const materiasPrimas = await MateriaPrima.findAll({
      where: { activo: true },
      include: [{
        model: UnidadMedida,
        as: 'unidadMedida',
        attributes: ['nombre', 'abreviatura']
      }],
      order: [['nombre', 'ASC']]
    });
    res.json(materiasPrimas);
  } catch (error) {
    console.error('Error al obtener materias primas:', error);
    res.status(500).json({
      error: 'Error al obtener materias primas',
      details: error.message
    });
  }
};

exports.getMateriaPrimaById = async (req, res) => {
  try {
    const materiaPrima = await MateriaPrima.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadMedida',
          attributes: ['nombre', 'abreviatura']
        },
        {
          model: Lote,
          as: 'lotes',
          where: {
            activo: true,
            cantidad_actual: {
              [Op.gt]: 0
            }
          },
          required: false
        }
      ]
    });

    if (!materiaPrima) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }

    res.json(materiaPrima);
  } catch (error) {
    console.error('Error al obtener materia prima:', error);
    res.status(500).json({
      error: 'Error al obtener materia prima',
      details: error.message
    });
  }
};

exports.createMateriaPrima = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      stock_actual,
      stock_minimo,
      id_unidad_medida,
      costo_unitario,
      fecha_caducidad
    } = req.body;

    // Validaciones básicas
    if (!nombre || !id_unidad_medida) {
      return res.status(400).json({
        error: 'Nombre y unidad de medida son campos requeridos'
      });
    }

    // Verificar unidad de medida
    const unidadMedida = await UnidadMedida.findOne({
      where: {
        id: id_unidad_medida,
        activo: true
      }
    });

    if (!unidadMedida) {
      return res.status(400).json({
        error: 'Unidad de medida no válida'
      });
    }

    // Crear materia prima
    const materiaPrima = await MateriaPrima.create({
      nombre,
      descripcion,
      stock_actual: stock_actual || 0,
      stock_minimo: stock_minimo || 0,
      id_unidad_medida,
      costo_unitario: costo_unitario || 0,
      fecha_caducidad
    });

    // Si el stock inicial es mayor que 0, crear movimiento de entrada
    if (stock_actual > 0) {
      await MovimientoInventario.create({
        id_materia_prima: materiaPrima.id,
        tipo_movimiento: 'entrada',
        cantidad: stock_actual,
        descripcion: 'Stock inicial',
        id_usuario: req.user.id
      });
    }

    // Verificar si necesita alerta de stock mínimo
    if (stock_actual <= stock_minimo) {
      await AlertaInventario.crearAlertaStockBajo(materiaPrima, [req.user]);
    }

    const materiaConRelaciones = await MateriaPrima.findByPk(materiaPrima.id, {
      include: [{
        model: UnidadMedida,
        as: 'unidadMedida',
        attributes: ['nombre', 'abreviatura']
      }]
    });

    res.status(201).json(materiaConRelaciones);
  } catch (error) {
    console.error('Error al crear materia prima:', error);
    res.status(500).json({
      error: 'Error al crear materia prima',
      details: error.message
    });
  }
};

exports.updateMateriaPrima = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      stock_minimo,
      id_unidad_medida,
      costo_unitario,
      fecha_caducidad
    } = req.body;

    // Validaciones básicas
    if (!nombre || !id_unidad_medida) {
      return res.status(400).json({
        error: 'Nombre y unidad de medida son campos requeridos'
      });
    }

    // Verificar unidad de medida
    const unidadMedida = await UnidadMedida.findOne({
      where: {
        id: id_unidad_medida,
        activo: true
      }
    });

    if (!unidadMedida) {
      return res.status(400).json({
        error: 'Unidad de medida no válida'
      });
    }

    const [updated] = await MateriaPrima.update(
      {
        nombre,
        descripcion,
        stock_minimo,
        id_unidad_medida,
        costo_unitario,
        fecha_caducidad
      },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }

    const materiaPrima = await MateriaPrima.findByPk(req.params.id, {
      include: [{
        model: UnidadMedida,
        as: 'unidadMedida',
        attributes: ['nombre', 'abreviatura']
      }]
    });

    res.json(materiaPrima);
  } catch (error) {
    console.error('Error al actualizar materia prima:', error);
    res.status(500).json({
      error: 'Error al actualizar materia prima',
      details: error.message
    });
  }
};

exports.deleteMateriaPrima = async (req, res) => {
  try {
    // Verificar si tiene lotes o movimientos activos
    const tieneDependencias = await Promise.all([
      Lote.findOne({
        where: {
          id_materia_prima: req.params.id,
          activo: true,
          cantidad_actual: {
            [Op.gt]: 0
          }
        }
      }),
      MovimientoInventario.findOne({
        where: {
          id_materia_prima: req.params.id,
          activo: true
        }
      })
    ]);

    if (tieneDependencias.some(dep => dep !== null)) {
      return res.status(409).json({
        error: 'No se puede eliminar la materia prima porque tiene lotes o movimientos asociados'
      });
    }

    const [deleted] = await MateriaPrima.update(
      { activo: false },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }

    res.json({ message: 'Materia prima eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar materia prima:', error);
    res.status(500).json({
      error: 'Error al eliminar materia prima',
      details: error.message
    });
  }
};

exports.getBajoStock = async (req, res) => {
  try {
    const materiasPrimas = await MateriaPrima.findBajoStock();
    res.json(materiasPrimas);
  } catch (error) {
    console.error('Error al obtener materias primas con bajo stock:', error);
    res.status(500).json({
      error: 'Error al obtener materias primas con bajo stock',
      details: error.message
    });
  }
};

exports.getProximosACaducar = async (req, res) => {
  try {
    const diasLimite = parseInt(req.query.dias) || 7;
    const materiasPrimas = await MateriaPrima.findProximosCaducar(diasLimite);
    res.json(materiasPrimas);
  } catch (error) {
    console.error('Error al obtener materias primas próximas a caducar:', error);
    res.status(500).json({
      error: 'Error al obtener materias primas próximas a caducar',
      details: error.message
    });
  }
};

exports.getMovimientos = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const where = {
      id_materia_prima: id,
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
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos de materia prima:', error);
    res.status(500).json({
      error: 'Error al obtener movimientos de materia prima',
      details: error.message
    });
  }
};