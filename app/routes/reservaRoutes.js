const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas específicas primero
router.get('/user', authMiddleware, ReservaController.getReservasByUserId);
router.put('/:id/status', ReservaController.updateReservaStatus);

// Rutas con parámetros después
router.get('/:id', ReservaController.getReservaById);
router.put('/:id', ReservaController.updateReserva);
router.delete('/:id', ReservaController.deleteReserva);

// Rutas generales al final
router.get('/', ReservaController.getAllReservas);
router.post('/', ReservaController.createReserva);

module.exports = router;