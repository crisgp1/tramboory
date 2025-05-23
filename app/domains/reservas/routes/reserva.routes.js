const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas de elementos archivados
router.get('/archived', authMiddleware, ReservaController.getArchivedReservas);
router.put('/:id/reactivate', authMiddleware, ReservaController.reactivateReserva);

// Rutas específicas
router.get('/user', authMiddleware, ReservaController.getReservasByUserId);
router.put('/:id/status', authMiddleware, ReservaController.updateReservaStatus);
router.post('/block-dates', authMiddleware, ReservaController.blockDates);

// Rutas para el nuevo flujo de reserva
router.post('/initiate', authMiddleware, ReservaController.initiate);
router.post('/confirm', authMiddleware, ReservaController.confirm);

// Rutas con parámetros
router.get('/:id', ReservaController.getReservaById);
router.put('/:id', authMiddleware, ReservaController.updateReserva);
router.delete('/:id', authMiddleware, ReservaController.deleteReserva);
 
// Rutas generales
router.get('/', ReservaController.getAllReservas);
router.post('/', authMiddleware, ReservaController.createReserva);

module.exports = router;