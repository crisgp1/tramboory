const express = require('express');
const router = express.Router();
const AuditoriaController = require('../controllers/AuditoriaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta protegida que requiere autenticación
router.get('/', authMiddleware, AuditoriaController.obtenerHistorial);

module.exports = router;