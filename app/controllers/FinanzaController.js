const Finanza = require('../models/Finanza');
const Auditoria = require('../models/Auditoria');
const fs = require('fs');
const upload = require('../config/multer');
const { Op } = require('sequelize');

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
            // Obtener el historial de auditoría para esta finanza
            const auditoria = await Auditoria.findAll({
                where: {
                    transaccion: {
                        [Op.like]: `%FINANZA - ID: ${finanza.id}%`
                    }
                },
                order: [['fecha_operacion', 'DESC']]
            });
            
            res.json({
                finanza,
                historial: auditoria
            });
        } else {
            res.status(404).json({ error: 'Finanza no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la finanza:', error);
        res.status(500).json({ error: 'Error al obtener la finanza' });
    }
};

exports.createFinanza = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        console.log('Archivos recibidos:', req.files);

        const { tipo, monto, fecha, descripcion, id_reserva, categoria } = req.body;

        // Validación de campos requeridos
        if (!tipo || !monto || !fecha) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Validación del tipo
        if (tipo !== 'ingreso' && tipo !== 'gasto') {
            return res.status(400).json({ error: 'Tipo de finanza inválido' });
        }

        // Conversión y validación del monto
        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico)) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        const facturaPDF = req.files && req.files['factura_pdf'] ? req.files['factura_pdf'][0].filename : null;
        const facturaXML = req.files && req.files['factura_xml'] ? req.files['factura_xml'][0].filename : null;
        const archivoPrueba = req.files && req.files['archivo_prueba'] ? req.files['archivo_prueba'][0].filename : null;

        // Asegurarse de que tenemos el usuario
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const finanza = await Finanza.create({
            tipo,
            monto: montoNumerico,
            fecha,
            descripcion,
            id_reserva,
            id_usuario: req.user.id,
            id_categoria: categoria,
            factura_pdf: facturaPDF,
            factura_xml: facturaXML,
            archivo_prueba: archivoPrueba
        });

        // Registrar en auditoría con mensaje más corto
        await Auditoria.create({
            id_usuario: req.user.id,
            nombre_usuario: req.user.nombre,
            transaccion: `CREAR FINANZA ${finanza.id} - ${tipo} - ${montoNumerico}`
        });

        res.status(201).json(finanza);
    } catch (error) {
        console.error('Error al crear la finanza:', error);
        res.status(500).json({ error: 'Error al crear la finanza', details: error.message });
    }
};

exports.updateFinanza = async (req, res) => {
    try {
        const finanza = await Finanza.findByPk(req.params.id);
        if (!finanza) {
            return res.status(404).json({ error: 'Finanza no encontrada' });
        }

        const finanzaData = { ...req.body };

        // Convertir id_reserva vacío a null
        if (finanzaData.id_reserva === '') {
            finanzaData.id_reserva = null;
        }

        // Manejar archivos
        ['factura_pdf', 'factura_xml', 'archivo_prueba'].forEach(field => {
            if (req.files && req.files[field]) {
                // Si hay un nuevo archivo, eliminar el antiguo si existe
                if (finanza[field]) {
                    fs.unlink(finanza[field], (err) => {
                        if (err) console.error(`Error al eliminar archivo antiguo ${field}:`, err);
                    });
                }
                finanzaData[field] = req.files[field][0].path;
            }
        });

        // Asegurar que el id_usuario no cambie
        finanzaData.id_usuario = finanza.id_usuario;

        await finanza.update(finanzaData);

        // Registrar en auditoría con mensaje más corto
        await Auditoria.create({
            id_usuario: req.user.id,
            nombre_usuario: req.user.nombre,
            transaccion: `ACTUALIZAR FINANZA ${finanza.id}`
        });

        res.json(finanza);
    } catch (error) {
        console.error('Error al actualizar la finanza:', error);
        res.status(500).json({ error: 'Error al actualizar la finanza', details: error.message });
    }
};

exports.deleteFinanza = async (req, res) => {
    try {
        const { id } = req.params;
        await Finanza.update({ activo: false }, {
            where: { id }
        });

        // Registrar en auditoría con mensaje más corto
        await Auditoria.create({
            id_usuario: req.user.id,
            nombre_usuario: req.user.nombre,
            transaccion: `DESACTIVAR FINANZA ${id}`
        });

        res.status(200).json({ message: 'Finanza desactivada con éxito' });
    } catch (error) {
        console.error('Error al desactivar la finanza:', error);
        res.status(500).json({ error: 'Error al desactivar la finanza' });
    }
};

exports.getFinanzasByCategory = async (req, res) => {
    try {
        const finanzas = await Finanza.findAll({
            where: { id_categoria: req.params.categoria }
        });
        res.json(finanzas);
    } catch (error) {
        console.error('Error al obtener finanzas por categoría:', error);
        res.status(500).json({ error: 'Error al obtener finanzas por categoría' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Finanza.findAll({
            attributes: ['id_categoria'],
            group: ['id_categoria'],
            raw: true
        });
        res.json(categories.map(c => c.id_categoria));
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

exports.getFinanzaAuditoria = async (req, res) => {
    try {
        const auditoria = await Auditoria.findAll({
            where: {
                transaccion: {
                    [Op.like]: '%FINANZA%'
                }
            },
            order: [['fecha_operacion', 'DESC']]
        });
        res.json(auditoria);
    } catch (error) {
        console.error('Error al obtener la auditoría de finanzas:', error);
        res.status(500).json({ error: 'Error al obtener la auditoría de finanzas' });
    }
};

// Función auxiliar para eliminar archivos
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        }
    });
};

// Middleware para manejar errores
exports.handleError = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
};