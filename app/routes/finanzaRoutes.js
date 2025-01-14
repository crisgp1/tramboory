const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FinanzaController = require('../controllers/FinanzaController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Ruta para obtener todas las finanzas
router.get('/', FinanzaController.getAllFinanzas);

// Ruta para obtener el historial de auditoría de finanzas
router.get('/auditoria', FinanzaController.getFinanzaAuditoria);

// Ruta para obtener finanzas por categoría
router.get('/categoria/:categoria', FinanzaController.getFinanzasByCategory);

// Ruta para obtener todas las categorías únicas
router.get('/categorias/all', FinanzaController.getCategories);

// Ruta para obtener una finanza específica por ID
router.get('/:id', FinanzaController.getFinanzaById);

// Ruta para crear una nueva finanza
router.post('/', upload.fields([
    { name: 'factura_pdf', maxCount: 1 },
    { name: 'factura_xml', maxCount: 1 },
    { name: 'archivo_prueba', maxCount: 1 }
]), FinanzaController.createFinanza);

// Ruta para actualizar una finanza existente
router.put('/:id', upload.fields([
    { name: 'factura_pdf', maxCount: 1 },
    { name: 'factura_xml', maxCount: 1 },
    { name: 'archivo_prueba', maxCount: 1 }
]), FinanzaController.updateFinanza);

// Ruta para eliminar una finanza
router.delete('/:id', FinanzaController.deleteFinanza);

// Manejo de errores
router.use(FinanzaController.handleError);

module.exports = router;