const Finanza = require('../models/Finanza');

exports.getAllFinanzas = async (req, res) => {
    try {
        const finanzas = await Finanza.findAll();
        res.json(finanzas);
    } catch (error) {
        console.error('Error al obtener las finanzas:', error);
        res.status(500).json({ error: 'Error al obtener las finanzas' });
    }
};

exports.getFinanzaById = async (req, res) => {
    try {
        const finanza = await Finanza.findByPk(req.params.id);
        if (finanza) {
            res.json(finanza);
        } else {
            res.status(404).json({ error: 'Finanza no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la finanza:', error);
        res.status(500).json({ error: 'Error al obtener la finanza' });
    }
};

// FinanzaController.js
exports.createFinanza = async (req, res) => {
    try {
        let { id_reserva, tipo, monto, fecha, descripcion, archivo_prueba } = req.body;

        // Si id_reserva es una cadena vacía o undefined, establécelo como null
        if (id_reserva === '' || id_reserva === undefined) {
            id_reserva = null;
        }

        const finanza = await Finanza.create({
            id_reserva,
            tipo,
            monto,
            fecha,
            descripcion,
            archivo_prueba
        });

        res.status(201).json(finanza);
    } catch (error) {
        console.error('Error al crear la finanza:', error);
        res.status(500).json({
            error: 'Error al crear la finanza',
            details: error.message,
            stack: error.stack
        });
    }
};

exports.updateFinanza = async (req, res) => {
    try {
        const [updated] = await Finanza.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedFinanza = await Finanza.findByPk(req.params.id);
            res.json(updatedFinanza);
        } else {
            res.status(404).json({ error: 'Finanza no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar la finanza:', error);
        res.status(500).json({ error: 'Error al actualizar la finanza' });
    }
};

exports.deleteFinanza = async (req, res) => {
    try {
        const deleted = await Finanza.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Finanza no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la finanza:', error);
        res.status(500).json({ error: 'Error al eliminar la finanza' });
    }
};