// routes/pagoRoutes.js

const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/PagoController');

router.post('/', pagoController.createPago);
router.get('/', pagoController.getPagos);
router.put('/:id/estado', pagoController.updatePagoEstado); // Nueva ruta para actualizar el estado

module.exports = router;
