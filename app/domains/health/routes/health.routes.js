const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/HealthController');
const databaseConnectionCheck = require('../middleware/databaseConnectionCheck');

// Aplicar middleware de conexión a todas las rutas de health
router.use(databaseConnectionCheck);

// Rutas para verificación de salud del sistema
router.get('/', HealthController.checkHealth);
router.get('/database', HealthController.checkDatabaseConnection);

// Ruta para reconexión manual a la base de datos (solo para administradores)
router.post('/database/reconnect', HealthController.attemptDatabaseReconnection);

module.exports = router;