const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', authMiddleware, AuthController.getAuthenticatedUser); // Nueva ruta
module.exports = router;