const express = require('express');
const router = express.Router();
const galeriaHomeController = require('../controllers/GaleriaHomeController');
const authMiddleware = require('../middlewares/authMiddleware');
const auditMiddleware = require('../middlewares/auditMiddleware');

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.user && req.user.tipo_usuario === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

// Rutas públicas
router.get('/', galeriaHomeController.getAllImagenes);
router.get('/promociones', galeriaHomeController.getPromociones);

// Rutas protegidas (requieren autenticación y rol de administrador)
router.get('/admin', [authMiddleware, isAdmin], galeriaHomeController.getAllImagenesAdmin);
router.get('/:id', [authMiddleware, isAdmin], galeriaHomeController.getImagenById);
router.post('/', [authMiddleware, isAdmin], galeriaHomeController.createImagen);
router.put('/:id', [authMiddleware, isAdmin], galeriaHomeController.updateImagen);
router.put('/orden/actualizar', [authMiddleware, isAdmin], galeriaHomeController.updateOrden);
router.delete('/:id', [authMiddleware, isAdmin], galeriaHomeController.deleteImagen);
router.delete('/purge/:id', [authMiddleware, isAdmin], galeriaHomeController.purgeImagen);

module.exports = router;