const PaqueteAlimento = require('../models/PaqueteAlimento');

exports.getAllPaquetesAlimentos = async (req, res) => {
  try {
    const paquetesAlimentos = await PaqueteAlimento.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(paquetesAlimentos);
  } catch (error) {
    console.error('Error al obtener paquetes de alimentos:', error);
    res.status(500).json({
      error: 'Error al obtener paquetes de alimentos',
      details: error.message
    });
  }
};

exports.getPaqueteAlimentoById = async (req, res) => {
  try {
    const paqueteAlimento = await PaqueteAlimento.findByPk(req.params.id);
    if (paqueteAlimento) {
      res.json(paqueteAlimento);
    } else {
      res.status(404).json({ error: 'Paquete de alimento no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener paquete de alimento:', error);
    res.status(500).json({
      error: 'Error al obtener paquete de alimento',
      details: error.message
    });
  }
};

exports.createPaqueteAlimento = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const paqueteAlimento = await PaqueteAlimento.create({
      nombre,
      descripcion
    });

    res.status(201).json(paqueteAlimento);
  } catch (error) {
    console.error('Error al crear paquete de alimento:', error);
    res.status(500).json({
      error: 'Error al crear paquete de alimento',
      details: error.message
    });
  }
};

exports.updatePaqueteAlimento = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [updated] = await PaqueteAlimento.update({
      nombre,
      descripcion
    }, {
      where: { id: req.params.id }
    });

    if (updated) {
      const updatedPaqueteAlimento = await PaqueteAlimento.findByPk(req.params.id);
      res.json(updatedPaqueteAlimento);
    } else {
      res.status(404).json({ error: 'Paquete de alimento no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar paquete de alimento:', error);
    res.status(500).json({
      error: 'Error al actualizar paquete de alimento',
      details: error.message
    });
  }
};

exports.deletePaqueteAlimento = async (req, res) => {
  try {
    const deleted = await PaqueteAlimento.destroy({
      where: { id: req.params.id }
    });

    if (deleted) {
      res.json({ message: 'Paquete de alimento eliminado' });
    } else {
      res.status(404).json({ error: 'Paquete de alimento no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar paquete de alimento:', error);
    res.status(500).json({
      error: 'Error al eliminar paquete de alimento',
      details: error.message
    });
  }
};