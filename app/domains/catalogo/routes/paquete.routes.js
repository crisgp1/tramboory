const express = require('express');
const router = express.Router();
const paqueteController = require('../controllers/PaqueteController');

router.get('/', paqueteController.getAllPaquetes);
router.get('/:id', paqueteController.getPaqueteById);
router.post('/', paqueteController.createPaquete);
router.put('/:id', paqueteController.updatePaquete);
router.delete('/:id', paqueteController.deletePaquete);

module.exports = router;