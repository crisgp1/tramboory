const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const PaqueteAlimentoController = require('../controllers/PaqueteAlimentoController');

// Middleware para verificar que el usuario es admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.tipo_usuario === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
};

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authMiddleware);
router.use(isAdmin);

// Rutas CRUD para paquetes de alimentos
router.get('/', PaqueteAlimentoController.getAllPaquetesAlimentos);
router.get('/:id', PaqueteAlimentoController.getPaqueteAlimentoById);
router.post('/', PaqueteAlimentoController.createPaqueteAlimento);
router.put('/:id', PaqueteAlimentoController.updatePaqueteAlimento);
router.delete('/:id', PaqueteAlimentoController.deletePaqueteAlimento);

module.exports = router;