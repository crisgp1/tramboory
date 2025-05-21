const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriaController');

router.get('/', CategoriaController.getAllCategorias);
router.post('/', CategoriaController.createCategoria);

module.exports = router;