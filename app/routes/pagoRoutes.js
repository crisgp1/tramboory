const express = require('express');
const router = express.Router();
const PagoController = require('../controllers/PagoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas de elementos archivados
router.get('/archived', authMiddleware, PagoController.getArchivedPagos);
router.put('/:id/reactivate', authMiddleware, PagoController.reactivatePago);

// Rutas específicas
router.put('/:id/status', authMiddleware, PagoController.updatePagoStatus);

// Rutas con parámetros
router.get('/:id', authMiddleware, PagoController.getPagoById);
router.put('/:id', authMiddleware, PagoController.updatePago);
router.delete('/:id', authMiddleware, PagoController.deletePago);

// Rutas generales
router.get('/', authMiddleware, PagoController.getAllPagos);
router.post('/', authMiddleware, PagoController.createPago);

module.exports = router;