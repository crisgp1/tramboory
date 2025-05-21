const Extra = require('../models/Extra');

exports.getAllExtras = async (req, res) => {
  try {
    const extras = await Extra.findAll({ where: { activo: true } });
    res.json(extras);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los extras", error: error.message });
  }
};

exports.getExtraById = async (req, res) => {
  try {
    const extra = await Extra.findByPk(req.params.id);
    if (extra) {
      res.json(extra);
    } else {
      res.status(404).json({ message: "Extra no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el extra", error: error.message });
  }
};

exports.createExtra = async (req, res) => {
  try {
    const nuevoExtra = await Extra.create(req.body);
    res.status(201).json(nuevoExtra);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el extra", error: error.message });
  }
};

exports.updateExtra = async (req, res) => {
  try {
    const [updatedRows] = await Extra.update(req.body, {
      where: { id: req.params.id }
    });
    if (updatedRows > 0) {
      const updatedExtra = await Extra.findByPk(req.params.id);
      res.json(updatedExtra);
    } else {
      res.status(404).json({ message: "Extra no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el extra", error: error.message });
  }
};

exports.deleteExtra = async (req, res) => {
  try {
    const [updated] = await Extra.update(
      { activo: false },
      { where: { id: req.params.id } }
    );
    if (updated) {
      res.json({ message: "Extra desactivado con éxito" });
    } else {
      res.status(404).json({ message: "Extra no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al desactivar el extra", error: error.message });
  }
};