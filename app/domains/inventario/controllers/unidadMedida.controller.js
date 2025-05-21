const { Op } = require('sequelize');
const UnidadMedida = require('../../models/Inventory/UnidadMedida');
const ConversionMedida = require('../../models/Inventory/ConversionMedida');
const sequelize = require('../../config/database');

exports.getAllUnidadesMedida = async (req, res) => {
  try {
    const unidades = await UnidadMedida.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    res.json(unidades);
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    res.status(500).json({
      error: 'Error al obtener unidades de medida',
      details: error.message
    });
  }
};

exports.getUnidadMedidaById = async (req, res) => {
  try {
    const unidad = await UnidadMedida.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!unidad) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }

    res.json(unidad);
  } catch (error) {
    console.error('Error al obtener unidad de medida:', error);
    res.status(500).json({
      error: 'Error al obtener unidad de medida',
      details: error.message
    });
  }
};

exports.createUnidadMedida = async (req, res) => {
  try {
    const { nombre, abreviatura, tipo } = req.body;

    // Validaciones
    if (!nombre || !abreviatura || !tipo) {
      return res.status(400).json({
        error: 'Nombre, abreviatura y tipo son campos requeridos'
      });
    }

    // Verificar tipo válido
    const tiposValidos = ['masa', 'volumen', 'unidad', 'longitud', 'area'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de unidad inválido',
        tiposValidos
      });
    }

    // Verificar si ya existe
    const existente = await UnidadMedida.findOne({
      where: {
        activo: true,
        [Op.or]: [
          { nombre },
          { abreviatura }
        ]
      }
    });

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe una unidad de medida con ese nombre o abreviatura'
      });
    }

    const unidad = await UnidadMedida.create({
      nombre,
      abreviatura,
      tipo
    });

    res.status(201).json(unidad);
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    res.status(500).json({
      error: 'Error al crear unidad de medida',
      details: error.message
    });
  }
};

exports.updateUnidadMedida = async (req, res) => {
  try {
    const { nombre, abreviatura, tipo } = req.body;

    // Validaciones
    if (!nombre || !abreviatura || !tipo) {
      return res.status(400).json({
        error: 'Nombre, abreviatura y tipo son campos requeridos'
      });
    }

    // Verificar tipo válido
    const tiposValidos = ['masa', 'volumen', 'unidad', 'longitud', 'area'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de unidad inválido',
        tiposValidos
      });
    }

    // Verificar si existe otro con el mismo nombre o abreviatura
    const existente = await UnidadMedida.findOne({
      where: {
        id: { [Op.ne]: req.params.id },
        activo: true,
        [Op.or]: [
          { nombre },
          { abreviatura }
        ]
      }
    });

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe otra unidad de medida con ese nombre o abreviatura'
      });
    }

    const [updated] = await UnidadMedida.update(req.body, {
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }

    const unidad = await UnidadMedida.findByPk(req.params.id);
    res.json(unidad);
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error);
    res.status(500).json({
      error: 'Error al actualizar unidad de medida',
      details: error.message
    });
  }
};

exports.deleteUnidadMedida = async (req, res) => {
  try {
    // Verificar si tiene conversiones asociadas
    const tieneDependencias = await ConversionMedida.findOne({
      where: {
        [Op.or]: [
          { id_unidad_origen: req.params.id },
          { id_unidad_destino: req.params.id }
        ],
        activo: true
      }
    });

    if (tieneDependencias) {
      return res.status(409).json({
        error: 'No se puede eliminar la unidad porque tiene conversiones asociadas'
      });
    }

    const [deleted] = await UnidadMedida.update(
      { activo: false },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }

    res.json({ message: 'Unidad de medida eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error);
    res.status(500).json({
      error: 'Error al eliminar unidad de medida',
      details: error.message
    });
  }
};

exports.getUnidadesByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Verificar tipo válido
    const tiposValidos = ['masa', 'volumen', 'unidad', 'longitud', 'area'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo de unidad inválido',
        tiposValidos
      });
    }

    const unidades = await UnidadMedida.findAll({
      where: {
        tipo,
        activo: true
      },
      order: [['nombre', 'ASC']]
    });

    res.json(unidades);
  } catch (error) {
    console.error('Error al obtener unidades por tipo:', error);
    res.status(500).json({
      error: 'Error al obtener unidades por tipo',
      details: error.message
    });
  }
};
