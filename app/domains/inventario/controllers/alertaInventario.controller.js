const { Op } = require('sequelize');
const sequelize = require('../../config/database');
const AlertaInventario = require('../../models/Inventory/AlertaInventario');
const MateriaPrima = require('../../models/Inventory/MateriaPrima');
const Usuario = require('../../models/Usuario');

exports.getAllAlertas = async (req, res) => {
  try {
    const { tipo, leida } = req.query;

    const where = {
      activo: true
    };

    if (tipo) {
      where.tipo_alerta = tipo;
    }

    if (leida !== undefined) {
      where.leida = leida === 'true';
    }

    const alertas = await AlertaInventario.findAll({
      where,
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuarioDestinatario',
          attributes: ['nombre']
        }
      ],
      order: [['fecha_alerta', 'DESC']]
    });

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      error: 'Error al obtener alertas',
      details: error.message
    });
  }
};

exports.getAlertaById = async (req, res) => {
  try {
    const alerta = await AlertaInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuarioDestinatario',
          attributes: ['nombre']
        }
      ]
    });

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json(alerta);
  } catch (error) {
    console.error('Error al obtener alerta:', error);
    res.status(500).json({
      error: 'Error al obtener alerta',
      details: error.message
    });
  }
};

exports.getAlertasPendientes = async (req, res) => {
  try {
    const alertas = await AlertaInventario.findAll({
      where: {
        id_usuario_destinatario: req.user.id,
        leida: false,
        activo: true
      },
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        }
      ],
      order: [['fecha_alerta', 'DESC']]
    });

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas pendientes:', error);
    res.status(500).json({
      error: 'Error al obtener alertas pendientes',
      details: error.message
    });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const alerta = await AlertaInventario.findOne({
      where: {
        id: req.params.id,
        id_usuario_destinatario: req.user.id,
        activo: true
      }
    });

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    await alerta.marcarComoLeida();
    res.json({ message: 'Alerta marcada como leída' });
  } catch (error) {
    console.error('Error al marcar alerta como leída:', error);
    res.status(500).json({
      error: 'Error al marcar alerta como leída',
      details: error.message
    });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = {
      id_usuario_destinatario: req.user.id,
      leida: false,
      activo: true
    };

    if (tipo) {
      where.tipo_alerta = tipo;
    }

    await AlertaInventario.update(
      {
        leida: true,
        fecha_lectura: new Date()
      },
      { where }
    );

    res.json({ message: 'Alertas marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar alertas como leídas:', error);
    res.status(500).json({
      error: 'Error al marcar alertas como leídas',
      details: error.message
    });
  }
};

exports.getAlertasPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { desde, hasta } = req.query;

    const where = {
      tipo_alerta: tipo,
      id_usuario_destinatario: req.user.id,
      activo: true
    };

    if (desde || hasta) {
      where.fecha_alerta = {};
      if (desde) where.fecha_alerta[Op.gte] = desde;
      if (hasta) where.fecha_alerta[Op.lte] = hasta;
    }

    const alertas = await AlertaInventario.findAll({
      where,
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        }
      ],
      order: [['fecha_alerta', 'DESC']]
    });

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas por tipo:', error);
    res.status(500).json({
      error: 'Error al obtener alertas por tipo',
      details: error.message
    });
  }
};

exports.createAlerta = async (req, res) => {
  try {
    const {
      id_materia_prima,
      tipo_alerta,
      mensaje,
      id_usuario_destinatario
    } = req.body;

    // Validaciones básicas
    if (!tipo_alerta || !mensaje) {
      return res.status(400).json({
        error: 'Tipo de alerta y mensaje son campos requeridos'
      });
    }

    // Verificar tipo de alerta válido
    const tiposValidos = ['stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido'];
    if (!tiposValidos.includes(tipo_alerta)) {
      return res.status(400).json({
        error: 'Tipo de alerta no válido'
      });
    }

    // Si se proporciona una materia prima, verificar que exista
    if (id_materia_prima) {
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
    }

    // Si se proporciona un usuario destinatario, verificar que exista
    if (id_usuario_destinatario) {
      const usuario = await Usuario.findOne({
        where: {
          id: id_usuario_destinatario,
          activo: true
        }
      });

      if (!usuario) {
        return res.status(400).json({
          error: 'Usuario destinatario no válido'
        });
      }
    }

    // Crear la alerta
    const alerta = await AlertaInventario.create({
      id_materia_prima,
      tipo_alerta,
      mensaje,
      id_usuario_destinatario: id_usuario_destinatario || req.user.id,
      fecha_alerta: new Date()
    });

    // Obtener la alerta con sus relaciones
    const alertaCompleta = await AlertaInventario.findByPk(alerta.id, {
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuarioDestinatario',
          attributes: ['nombre']
        }
      ]
    });

    res.status(201).json(alertaCompleta);
  } catch (error) {
    console.error('Error al crear alerta:', error);
    res.status(500).json({
      error: 'Error al crear alerta',
      details: error.message
    });
  }
};

exports.updateAlerta = async (req, res) => {
  try {
    const { leida } = req.body;
    
    // Encontrar la alerta
    const alerta = await AlertaInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // Actualizar solo el campo leída si se proporciona
    const campos = {};
    if (leida !== undefined) {
      campos.leida = leida;
      if (leida) {
        campos.fecha_lectura = new Date();
      } else {
        campos.fecha_lectura = null;
      }
    }

    // Si no hay campos para actualizar, retornar la alerta sin cambios
    if (Object.keys(campos).length === 0) {
      return res.json(alerta);
    }

    await alerta.update(campos);

    const alertaActualizada = await AlertaInventario.findByPk(alerta.id, {
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuarioDestinatario',
          attributes: ['nombre']
        }
      ]
    });

    res.json(alertaActualizada);
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    res.status(500).json({
      error: 'Error al actualizar alerta',
      details: error.message
    });
  }
};

exports.deleteAlerta = async (req, res) => {
  try {
    // Encontrar la alerta
    const alerta = await AlertaInventario.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    // Verificar permisos - solo el destinatario o un admin pueden eliminar una alerta
    if (alerta.id_usuario_destinatario !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ 
        error: 'No tiene permisos para eliminar esta alerta' 
      });
    }

    // Marcar como inactiva (borrado lógico)
    await alerta.update({ activo: false });

    res.json({ message: 'Alerta eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    res.status(500).json({
      error: 'Error al eliminar alerta',
      details: error.message
    });
  }
};

exports.getAlertasActivas = async (req, res) => {
  try {
    const alertas = await AlertaInventario.findAll({
      where: {
        activo: true,
        leida: false
      },
      include: [
        {
          model: MateriaPrima,
          as: 'materiaPrima',
          attributes: ['nombre']
        },
        {
          model: Usuario,
          as: 'usuarioDestinatario',
          attributes: ['nombre']
        }
      ],
      order: [['fecha_alerta', 'DESC']]
    });

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas activas:', error);
    res.status(500).json({
      error: 'Error al obtener alertas activas',
      details: error.message
    });
  }
};

exports.getResumenAlertas = async (req, res) => {
  try {
    const resumen = await AlertaInventario.findAll({
      where: {
        id_usuario_destinatario: req.user.id,
        activo: true
      },
      attributes: [
        'tipo_alerta',
        'leida',
        [sequelize.fn('COUNT', '*'), 'total']
      ],
      group: ['tipo_alerta', 'leida']
    });

    // Reorganizar el resumen por tipo de alerta
    const resumenPorTipo = {};
    resumen.forEach(item => {
      if (!resumenPorTipo[item.tipo_alerta]) {
        resumenPorTipo[item.tipo_alerta] = {
          total: 0,
          leidas: 0,
          no_leidas: 0
        };
      }
      
      resumenPorTipo[item.tipo_alerta].total += parseInt(item.dataValues.total);
      if (item.leida) {
        resumenPorTipo[item.tipo_alerta].leidas = parseInt(item.dataValues.total);
      } else {
        resumenPorTipo[item.tipo_alerta].no_leidas = parseInt(item.dataValues.total);
      }
    });

    res.json(resumenPorTipo);
  } catch (error) {
    console.error('Error al obtener resumen de alertas:', error);
    res.status(500).json({
      error: 'Error al obtener resumen de alertas',
      details: error.message
    });
  }
};