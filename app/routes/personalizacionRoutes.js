const express = require('express');
const router = express.Router();
const PersonalizacionController = require('../controllers/PersonalizacionController');

router.get('/', PersonalizacionController.getAllPersonalizaciones);
router.get('/:id', PersonalizacionController.getPersonalizacionById);
router.post('/', PersonalizacionController.createPersonalizacion);
router.put('/:id', PersonalizacionController.updatePersonalizacion);
router.delete('/:id', PersonalizacionController.deletePersonalizacion);

module.exports = router;