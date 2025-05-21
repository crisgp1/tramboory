const express = require('express');
const router = express.Router();
const mamparaController = require('../controllers/MamparaController');

router.get('/', mamparaController.getAllMamparas);
router.get('/:id', mamparaController.getMamparaById);
router.post('/', mamparaController.createMampara);
router.put('/:id', mamparaController.updateMampara);
router.delete('/:id', mamparaController.deleteMampara);
router.get('/tematica/:id_tematica', mamparaController.getMamparasByTematica);

module.exports = router;