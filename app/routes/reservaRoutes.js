const express = require('express');
const router = express.Router();
const ReservaController = require('../controllers/ReservaController');

router.get('/', ReservaController.getAllReservas);
router.get('/:id', ReservaController.getReservaById);
router.post('/', ReservaController.createReserva);
router.put('/:id', ReservaController.updateReserva);
router.delete('/:id', ReservaController.deleteReserva);

module.exports = router;