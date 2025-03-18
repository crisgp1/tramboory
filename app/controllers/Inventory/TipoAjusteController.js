const { Op } = require('sequelize');
const TipoAjuste = require('../../models/Inventory/TipoAjuste');
const MovimientoInventario = require('../../models/Inventory/MovimientoInventario');

exports.getAllTiposAjuste = async (req, res) => {
  try {
    const tiposAjuste = await TipoAjuste.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    res.json(tiposAjuste);
  } catch (error) {
    console.error('Error al obtener tipos de ajuste:', error);
    res.status(500).json({
      error: 'Error al obtener tipos de ajuste',
      details: error.message
    });
  }
};

exports.getTipoAjusteById = async (req, res) => {
  try {
    const tipoAjuste = await TipoAjuste.findOne({
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!tipoAjuste) {
      return res.status(404).json({ error: 'Tipo de ajuste no encontrado' });
    }

    res.json(tipoAjuste);
  } catch (error) {
    console.error('Error al obtener tipo de ajuste:', error);
    res.status(500).json({
      error: 'Error al obtener tipo de ajuste',
      details: error.message
    });
  }
};

exports.createTipoAjuste = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      afecta_costos,
      requiere_autorizacion
    } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        error: 'El nombre es requerido'
      });
    }

    // Verificar si ya existe un tipo de ajuste con el mismo nombre
    const existente = await TipoAjuste.findOne({
      where: {
        nombre,
        activo: true
      }
    });

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe un tipo de ajuste con ese nombre'
      });
    }

    const tipoAjuste = await TipoAjuste.create({
      nombre,
      descripcion,
      afecta_costos: afecta_costos || false,
      requiere_autorizacion: requiere_autorizacion || false
    });

    res.status(201).json(tipoAjuste);
  } catch (error) {
    console.error('Error al crear tipo de ajuste:', error);
    res.status(500).json({
      error: 'Error al crear tipo de ajuste',
      details: error.message
    });
  }
};

exports.updateTipoAjuste = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      afecta_costos,
      requiere_autorizacion
    } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        error: 'El nombre es requerido'
      });
    }

    // Verificar si ya existe otro tipo de ajuste con el mismo nombre
    const existente = await TipoAjuste.findOne({
      where: {
        nombre,
        id: { [Op.ne]: req.params.id },
        activo: true
      }
    });

    if (existente) {
      return res.status(409).json({
        error: 'Ya existe otro tipo de ajuste con ese nombre'
      });
    }

    const [updated] = await TipoAjuste.update(
      {
        nombre,
        descripcion,
        afecta_costos,
        requiere_autorizacion
      },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Tipo de ajuste no encontrado' });
    }

    const tipoAjuste = await TipoAjuste.findByPk(req.params.id);
    res.json(tipoAjuste);
  } catch (error) {
    console.error('Error al actualizar tipo de ajuste:', error);
    res.status(500).json({
      error: 'Error al actualizar tipo de ajuste',
      details: error.message
    });
  }
};

exports.deleteTipoAjuste = async (req, res) => {
  try {
    // Verificar si tiene movimientos asociados
    const tieneMovimientos = await MovimientoInventario.findOne({
      where: {
        id_tipo_ajuste: req.params.id,
        activo: true
      }
    });

    if (tieneMovimientos) {
      return res.status(409).json({
        error: 'No se puede eliminar el tipo de ajuste porque tiene movimientos asociados'
      });
    }

    const [deleted] = await TipoAjuste.update(
      { activo: false },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Tipo de ajuste no encontrado' });
    }

    res.json({ message: 'Tipo de ajuste eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar tipo de ajuste:', error);
    res.status(500).json({
      error: 'Error al eliminar tipo de ajuste',
      details: error.message
    });
  }
};

exports.getTiposAjusteAutorizacion = async (req, res) => {
  try {
    const tiposAjuste = await TipoAjuste.findAll({
      where: {
        activo: true,
        requiere_autorizacion: true
      },
      order: [['nombre', 'ASC']]
    });
    res.json(tiposAjuste);
  } catch (error) {
    console.error('Error al obtener tipos de ajuste que requieren autorización:', error);
    res.status(500).json({
      error: 'Error al obtener tipos de ajuste que requieren autorización',
      details: error.message
    });
  }
};

exports.getTiposAjusteCostos = async (req, res) => {
  try {
    const tiposAjuste = await TipoAjuste.findAll({
      where: {
        activo: true,
        afecta_costos: true
      },
      order: [['nombre', 'ASC']]
    });
    res.json(tiposAjuste);
  } catch (error) {
    console.error('Error al obtener tipos de ajuste que afectan costos:', error);
    res.status(500).json({
      error: 'Error al obtener tipos de ajuste que afectan costos',
      details: error.message
    });
  }
};