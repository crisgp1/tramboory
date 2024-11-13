const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', ReservaController.getAllReservas);
router.get('/:id', ReservaController.getReservaById);
router.post('/', ReservaController.createReserva);
router.put('/:id', ReservaController.updateReserva);
router.delete('/:id', ReservaController.deleteReserva);
router.get('/', authMiddleware, ReservaController.getReservasByUserId);
router.put('/:id/status', ReservaController.updateReservaStatus);

module.exports = router;