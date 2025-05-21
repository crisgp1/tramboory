const express = require('express');
const router = express.Router();
const FinanzaController = require('../controllers/FinanzaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas de elementos archivados
router.get('/archived', authMiddleware, FinanzaController.getArchivedFinanzas);
router.put('/:id/reactivate', authMiddleware, FinanzaController.reactivateFinanza);

// Rutas con parámetros
router.get('/:id', FinanzaController.getFinanzaById);
router.put('/:id', authMiddleware, FinanzaController.updateFinanza);
router.delete('/:id', authMiddleware, FinanzaController.deleteFinanza);

// Rutas generales
router.get('/', FinanzaController.getAllFinanzas);
router.post('/', authMiddleware, FinanzaController.createFinanza);

module.exports = router;