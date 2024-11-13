const OpcionAlimento = require('../models/OpcionAlimento');

exports.getAllOpcionesAlimento = async (req, res) => {
    try {
        const opciones = await OpcionAlimento.findAll({
            where: { disponible: true }
        });
        res.json(opciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las opciones de alimento", error: error.message });
    }
};

exports.getOpcionAlimentoById = async (req, res) => {
    try {
        const opcion = await OpcionAlimento.findByPk(req.params.id);
        if (opcion) {
            res.json(opcion);
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la opción de alimento", error: error.message });
    }
};

exports.createOpcionAlimento = async (req, res) => {
    try {
        const nuevaOpcion = await OpcionAlimento.create(req.body);
        res.status(201).json(nuevaOpcion);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la opción de alimento", error: error.message });
    }
};

exports.updateOpcionAlimento = async (req, res) => {
    try {
        const [updatedRows] = await OpcionAlimento.update(req.body, {
            where: { id: req.params.id }
        });
        if (updatedRows > 0) {
            const updatedOpcion = await OpcionAlimento.findByPk(req.params.id);
            res.json(updatedOpcion);
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la opción de alimento", error: error.message });
    }
};

exports.deleteOpcionAlimento = async (req, res) => {
    try {
        const [updated] = await OpcionAlimento.update(
            { activo: false },
            { where: { id: req.params.id } }
        );
        if (updated) {
            res.json({ message: "Opción de alimento desactivada con éxito" });
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la opción de alimento", error: error.message });
    }
};

exports.getOpcionesAlimentoByTurno = async (req, res) => {
    try {
        const { turno } = req.params;
        const opciones = await OpcionAlimento.findAll({
            where: {
                disponible: true,
                turno: [turno, 'ambos']
            }
        });
        res.json(opciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las opciones de alimento por turno", error: error.message });
    }
};