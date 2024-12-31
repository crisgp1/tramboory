const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
    try {
        // Obtener el token del header o de las cookies
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'No hay token, autorización denegada' });
        }

        // Verificar token
        console.log('Token recibido:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);

        // Buscar el usuario y verificar que esté activo
        const usuario = await Usuario.findOne({
            where: {
                id: decoded.id,
                activo: true
            }
        });

        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
        }

        // Agregar el usuario completo al request para uso posterior
        req.user = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario,
            activo: usuario.activo
        };

        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = authMiddleware;