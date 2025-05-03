const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Log para debugging más detallado
console.log('Controlador importado:', typeof cotizacionesController);
console.log('Métodos disponibles:', Object.keys(cotizacionesController));
console.log('Método crearCotizacion:', typeof cotizacionesController.crearCotizacion);
console.log('Middleware auth:', typeof authMiddleware);

/**
 * Rutas para gestionar cotizaciones
 * Base URL: /api/cotizaciones
 */

// Crear una nueva cotización
router.post('/', authMiddleware, function(req, res) {
  cotizacionesController.crearCotizacion(req, res);
});

// Obtener todas las cotizaciones del usuario actual
router.get('/', authMiddleware, function(req, res) {
  cotizacionesController.obtenerCotizacionesUsuario(req, res);
});

// Obtener detalles de una cotización específica
router.get('/:id', authMiddleware, function(req, res) {
  cotizacionesController.obtenerCotizacion(req, res);
});

// Convertir una cotización en reserva
router.post('/:id/convertir', authMiddleware, function(req, res) {
  cotizacionesController.convertirAReserva(req, res);
});

// Verificar disponibilidad para una cotización
router.post('/verificar-disponibilidad', authMiddleware, function(req, res) {
  cotizacionesController.verificarDisponibilidad(req, res);
});

module.exports = router;