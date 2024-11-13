const Tematica = require('../models/Tematica');

exports.getAllTematicas = async (req, res) => {
    try {
        const tematicas = await Tematica.findAll({ where: { activo: true } });
        res.json(tematicas);
    } catch (error) {
        console.error('Error al obtener las temáticas:', error);
        res.status(500).json({ message: "Error al obtener las temáticas", error: error.message });
    }
};

exports.getTematicaById = async (req, res) => {
    try {
        const tematica = await Tematica.findByPk(req.params.id);
        if (tematica) {
            res.json(tematica);
        } else {
            res.status(404).json({ message: "Temática no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la temática", error: error.message });
    }
};

exports.createTematica = async (req, res) => {
    try {
        const nuevaTematica = await Tematica.create(req.body);
        res.status(201).json(nuevaTematica);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la temática", error: error.message });
    }
};

exports.updateTematica = async (req, res) => {
    try {
        const [updatedRows] = await Tematica.update(req.body, {
            where: { id: req.params.id }
        });
        if (updatedRows > 0) {
            const updatedTematica = await Tematica.findByPk(req.params.id);
            res.json(updatedTematica);
        } else {
            res.status(404).json({ message: "Temática no encontrada" });
        }
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la temática", error: error.message });
    }
};

exports.deleteTematica = async (req, res) => {
    try {
        const [updated] = await Tematica.update(
            { activo: false },
            { where: { id: req.params.id } }
        );
        if (updated) {
            res.json({ message: "Temática desactivada con éxito" });
        } else {
            res.status(404).json({ message: "Temática no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la temática", error: error.message });
    }
};