const { Op } = require('sequelize');
const ConversionMedida = require('../../models/Inventory/ConversionMedida');
const UnidadMedida = require('../../models/Inventory/UnidadMedida');

exports.getAllConversiones = async (req, res) => {
  try {
    const conversiones = await ConversionMedida.findAll({
      where: { activo: true },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ],
      order: [
        [{ model: UnidadMedida, as: 'unidadOrigen' }, 'nombre', 'ASC'],
        [{ model: UnidadMedida, as: 'unidadDestino' }, 'nombre', 'ASC']
      ]
    });
    res.json(conversiones);
  } catch (error) {
    console.error('Error al obtener conversiones:', error);
    res.status(500).json({
      error: 'Error al obtener conversiones',
      details: error.message
    });
  }
};

exports.getConversionById = async (req, res) => {
  try {
    const conversion = await ConversionMedida.findOne({
      where: {
        id_unidad_origen: req.params.id_origen,
        id_unidad_destino: req.params.id_destino,
        activo: true
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    if (!conversion) {
      return res.status(404).json({ error: 'Conversión no encontrada' });
    }

    res.json(conversion);
  } catch (error) {
    console.error('Error al obtener conversión:', error);
    res.status(500).json({
      error: 'Error al obtener conversión',
      details: error.message
    });
  }
};

exports.createConversion = async (req, res) => {
  try {
    const {
      id_unidad_origen,
      id_unidad_destino,
      factor_conversion
    } = req.body;

    // Validaciones básicas
    if (!id_unidad_origen || !id_unidad_destino || !factor_conversion) {
      return res.status(400).json({
        error: 'Unidad origen, unidad destino y factor de conversión son requeridos'
      });
    }

    // Verificar que las unidades existan
    const [unidadOrigen, unidadDestino] = await Promise.all([
      UnidadMedida.findOne({
        where: {
          id: id_unidad_origen,
          activo: true
        }
      }),
      UnidadMedida.findOne({
        where: {
          id: id_unidad_destino,
          activo: true
        }
      })
    ]);

    if (!unidadOrigen || !unidadDestino) {
      return res.status(400).json({
        error: 'Una o ambas unidades de medida no son válidas'
      });
    }

    // Verificar que sean del mismo tipo
    if (unidadOrigen.tipo !== unidadDestino.tipo) {
      return res.status(400).json({
        error: 'Las unidades deben ser del mismo tipo'
      });
    }

    // Verificar que no exista la conversión
    const existente = await ConversionMedida.findOne({
      where: {
        id_unidad_origen,
        id_unidad_destino,
        activo: true
      }
    });

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe una conversión entre estas unidades'
      });
    }

    const conversion = await ConversionMedida.create({
      id_unidad_origen,
      id_unidad_destino,
      factor_conversion
    });

    // Crear conversión inversa automáticamente
    await ConversionMedida.create({
      id_unidad_origen: id_unidad_destino,
      id_unidad_destino: id_unidad_origen,
      factor_conversion: 1 / factor_conversion
    });

    const conversionCompleta = await ConversionMedida.findOne({
      where: { 
        id_unidad_origen,
        id_unidad_destino
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    res.status(201).json(conversionCompleta);
  } catch (error) {
    console.error('Error al crear conversión:', error);
    res.status(500).json({
      error: 'Error al crear conversión',
      details: error.message
    });
  }
};

exports.updateConversion = async (req, res) => {
  try {
    const { factor_conversion } = req.body;
    const { id_origen, id_destino } = req.params;

    if (!factor_conversion) {
      return res.status(400).json({
        error: 'Factor de conversión es requerido'
      });
    }

    const conversion = await ConversionMedida.findOne({
      where: {
        id_unidad_origen: id_origen,
        id_unidad_destino: id_destino,
        activo: true
      }
    });

    if (!conversion) {
      return res.status(404).json({ error: 'Conversión no encontrada' });
    }

    // Actualizar conversión directa
    await conversion.update({ factor_conversion });

    // Actualizar conversión inversa
    await ConversionMedida.update(
      { factor_conversion: 1 / factor_conversion },
      {
        where: {
          id_unidad_origen: id_destino,
          id_unidad_destino: id_origen,
          activo: true
        }
      }
    );

    const conversionActualizada = await ConversionMedida.findOne({
      where: {
        id_unidad_origen: id_origen,
        id_unidad_destino: id_destino
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    res.json(conversionActualizada);
  } catch (error) {
    console.error('Error al actualizar conversión:', error);
    res.status(500).json({
      error: 'Error al actualizar conversión',
      details: error.message
    });
  }
};

exports.deleteConversion = async (req, res) => {
  try {
    const { id_origen, id_destino } = req.params;

    // Desactivar conversión directa e inversa
    const [deletedDirecta, deletedInversa] = await Promise.all([
      ConversionMedida.update(
        { activo: false },
        {
          where: {
            id_unidad_origen: id_origen,
            id_unidad_destino: id_destino,
            activo: true
          }
        }
      ),
      ConversionMedida.update(
        { activo: false },
        {
          where: {
            id_unidad_origen: id_destino,
            id_unidad_destino: id_origen,
            activo: true
          }
        }
      )
    ]);

    if (!deletedDirecta[0] && !deletedInversa[0]) {
      return res.status(404).json({ error: 'Conversión no encontrada' });
    }

    res.json({ message: 'Conversión eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar conversión:', error);
    res.status(500).json({
      error: 'Error al eliminar conversión',
      details: error.message
    });
  }
};

exports.getConversionesByUnidadOrigen = async (req, res) => {
  try {
    const { id } = req.params;

    const conversiones = await ConversionMedida.findAll({
      where: {
        id_unidad_origen: id,
        activo: true
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    res.json(conversiones);
  } catch (error) {
    console.error('Error al obtener conversiones por unidad de origen:', error);
    res.status(500).json({
      error: 'Error al obtener conversiones por unidad de origen',
      details: error.message
    });
  }
};

exports.getConversionesByUnidadDestino = async (req, res) => {
  try {
    const { id } = req.params;

    const conversiones = await ConversionMedida.findAll({
      where: {
        id_unidad_destino: id,
        activo: true
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    res.json(conversiones);
  } catch (error) {
    console.error('Error al obtener conversiones por unidad de destino:', error);
    res.status(500).json({
      error: 'Error al obtener conversiones por unidad de destino',
      details: error.message
    });
  }
};

exports.getConversionesDisponibles = async (req, res) => {
  try {
    const { id_unidad } = req.params;

    const conversiones = await ConversionMedida.findAll({
      where: {
        [Op.or]: [
          { id_unidad_origen: id_unidad },
          { id_unidad_destino: id_unidad }
        ],
        activo: true
      },
      include: [
        {
          model: UnidadMedida,
          as: 'unidadOrigen',
          attributes: ['nombre', 'abreviatura', 'tipo']
        },
        {
          model: UnidadMedida,
          as: 'unidadDestino',
          attributes: ['nombre', 'abreviatura', 'tipo']
        }
      ]
    });

    res.json(conversiones);
  } catch (error) {
    console.error('Error al obtener conversiones disponibles:', error);
    res.status(500).json({
      error: 'Error al obtener conversiones disponibles',
      details: error.message
    });
  }
};

exports.convertirCantidad = async (req, res) => {
  try {
    const { cantidad, id_unidad_origen, id_unidad_destino } = req.body;

    if (!cantidad || !id_unidad_origen || !id_unidad_destino) {
      return res.status(400).json({
        error: 'Cantidad y unidades de origen y destino son requeridas'
      });
    }

    const resultado = await ConversionMedida.convertir(
      cantidad,
      id_unidad_origen,
      id_unidad_destino
    );

    res.json({
      cantidad_original: cantidad,
      cantidad_convertida: resultado,
      unidad_origen: id_unidad_origen,
      unidad_destino: id_unidad_destino
    });
  } catch (error) {
    console.error('Error al convertir cantidad:', error);
    res.status(500).json({
      error: 'Error al convertir cantidad',
      details: error.message
    });
  }
};