const Paquete = require('../models/Paquete');

exports.getAllPaquetes = async (req, res) => {
  try {
    const paquetes = await Paquete.findAll();
    res.json(paquetes);
  } catch (error) {
    console.error('Error al obtener los paquetes:', error);
    res.status(500).json({ error: 'Error al obtener los paquetes' });
  }
};

exports.getPaqueteById = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (paquete) {
      res.json(paquete);
    } else {
      res.status(404).json({ error: 'Paquete no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el paquete:', error);
    res.status(500).json({ error: 'Error al obtener el paquete' });
  }
};

exports.createPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.create(req.body);
    res.status(201).json(paquete);
  } catch (error) {
    console.error('Error al crear el paquete:', error);
    res.status(500).json({ error: 'Error al crear el paquete' });
  }
};

exports.updatePaquete = async (req, res) => {
  try {
    const [updated] = await Paquete.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedPaquete = await Paquete.findByPk(req.params.id);
      res.json(updatedPaquete);
    } else {
      res.status(404).json({ error: 'Paquete no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el paquete:', error);
    res.status(500).json({ error: 'Error al actualizar el paquete' });
  }
};

exports.deletePaquete = async (req, res) => {
  try {
    const [updated] = await Paquete.update(
      { activo: false },
      { where: { id: req.params.id } }
    );
    if (updated) {
      res.json({ message: 'Paquete desactivado exitosamente' });
    } else {
      res.status(404).json({ error: 'Paquete no encontrado' });
    }
  } catch (error) {
    console.error('Error al desactivar el paquete:', error);
    res.status(500).json({ error: 'Error al desactivar el paquete' });
  }
};
