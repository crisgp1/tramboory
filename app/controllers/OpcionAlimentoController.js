const OpcionAlimento = require('../models/OpcionAlimento');

exports.getAllOpcionesAlimentos = async (req, res) => {
    try {
        const opcionesAlimentos = await OpcionAlimento.findAll();
        res.json(opcionesAlimentos);
    } catch (error) {
        console.error('Error al obtener las opciones de alimentos:', error);
        res.status(500).json({error: 'Error al obtener las opciones de alimentos'});
    }
};

