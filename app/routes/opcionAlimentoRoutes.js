const express = require('express');
const router = express.Router();
const OpcionAlimentoController = require('../controllers/OpcionAlimentoController');

router.get('/', OpcionAlimentoController.getAllOpcionesAlimentos);
// Agrega más rutas según sea necesario

module.exports = router;