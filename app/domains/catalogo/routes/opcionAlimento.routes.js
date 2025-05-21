const express = require('express');
const router = express.Router();
const opcionAlimentoController = require('../controllers/OpcionAlimentoController');

router.get('/', opcionAlimentoController.getAllOpcionesAlimento);
router.get('/:id', opcionAlimentoController.getOpcionAlimentoById);
router.post('/', opcionAlimentoController.createOpcionAlimento);
router.put('/:id', opcionAlimentoController.updateOpcionAlimento);
router.delete('/:id', opcionAlimentoController.deleteOpcionAlimento);
router.get('/turno/:turno', opcionAlimentoController.getOpcionesAlimentoByTurno);

module.exports = router;