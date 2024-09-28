const Personalizacion = require('../models/Personalizacion');

exports.getAllPersonalizaciones = async (req, res) => {
    try {
        const personalizaciones = await Personalizacion.findAll();
        res.json(personalizaciones);
    } catch (error) {
        console.error('Error al obtener las personalizaciones:', error);
        res.status(500).json({ error: 'Error al obtener las personalizaciones' });
    }
};

exports.getPersonalizacionById = async (req, res) => {
    try {
        const personalizacion = await Personalizacion.findByPk(req.params.id);
        if (personalizacion) {
            res.json(personalizacion);
        } else {
            res.status(404).json({ error: 'Personalización no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la personalización:', error);
        res.status(500).json({ error: 'Error al obtener la personalización' });
    }
};

exports.createPersonalizacion = async (req, res) => {
    try {
        const personalizacion = await Personalizacion.create(req.body);
        res.status(201).json(personalizacion);
    } catch (error) {
        console.error('Error al crear la personalización:', error);
        res.status(500).json({ error: 'Error al crear la personalización' });
    }
};

exports.updatePersonalizacion = async (req, res) => {
    try {
        const [updated] = await Personalizacion.update(req.body, {
            where: { id: req.params.id },
        });
        if (updated) {
            const updatedPersonalizacion = await Personalizacion.findByPk(req.params.id);
            res.json(updatedPersonalizacion);
        } else {
            res.status(404).json({ error: 'Personalización no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar la personalización:', error);
        res.status(500).json({ error: 'Error al actualizar la personalización' });
    }
};

exports.deletePersonalizacion = async (req, res) => {
    try {
        const deleted = await Personalizacion.destroy({
            where: { id: req.params.id },
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Personalización no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la personalización:', error);
        res.status(500).json({ error: 'Error al eliminar la personalización' });
    }
};