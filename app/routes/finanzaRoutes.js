const express = require('express');
const router = express.Router();
const FinanzaController = require('../controllers/FinanzaController');

router.get('/', FinanzaController.getAllFinanzas);
router.get('/:id', FinanzaController.getFinanzaById);
router.post('/', FinanzaController.createFinanza);
router.put('/:id', FinanzaController.updateFinanza);
router.delete('/:id', FinanzaController.deleteFinanza);

module.exports = router;