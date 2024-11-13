const Mampara = require('../models/Mampara');
const Tematica = require('../models/Tematica');

exports.getAllMamparas = async (req, res) => {
  try {
    const mamparas = await Mampara.findAll({
      where: { activo: true },
      include: [{
        model: Tematica,
        as: 'tematica',  // Usa el alias 'tematica' aquí
        attributes: ['id', 'nombre']
      }]
    });
    res.json(mamparas);
  } catch (error) {
    console.error('Error al obtener las mamparas:', error);
    res.status(500).json({ message: "Error al obtener las mamparas", error: error.message });
  }
};

exports.getMamparaById = async (req, res) => {
  try {
    const mampara = await Mampara.findByPk(req.params.id, {
      include: [{ model: Tematica, attributes: ['nombre'] }]
    });
    if (mampara) {
      res.json(mampara);
    } else {
      res.status(404).json({ message: "Mampara no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la mampara", error: error.message });
  }
};

exports.createMampara = async (req, res) => {
  try {
    const nuevaMampara = await Mampara.create(req.body);
    res.status(201).json(nuevaMampara);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la mampara", error: error.message });
  }
};

exports.updateMampara = async (req, res) => {
  try {
    const [updatedRows] = await Mampara.update(req.body, {
      where: { id: req.params.id }
    });
    if (updatedRows > 0) {
      const updatedMampara = await Mampara.findByPk(req.params.id);
      res.json(updatedMampara);
    } else {
      res.status(404).json({ message: "Mampara no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar la mampara", error: error.message });
  }
};

exports.deleteMampara = async (req, res) => {
  try {
    const deletedRows = await Mampara.destroy({
      where: { id: req.params.id }
    });
    if (deletedRows > 0) {
      res.json({ message: "Mampara eliminada con éxito" });
    } else {
      res.status(404).json({ message: "Mampara no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la mampara", error: error.message });
  }
};

exports.getMamparasByTematica = async (req, res) => {
  try {
    const mamparas = await Mampara.findAll({
      where: { id_tematica: req.params.id_tematica, activo: true },
      include: [{ model: Tematica, attributes: ['nombre'] }]
    });
    res.json(mamparas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las mamparas por temática", error: error.message });
  }
};