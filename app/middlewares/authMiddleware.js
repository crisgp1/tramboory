const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  console.log('Token recibido:', token);

  if (!token) {
    console.log('No se proporcionó un token');
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Obtener la información completa del usuario desde la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Guardar la información completa del usuario en req.user
    req.user = usuario;
    next();
  } catch (error) {
    console.log('Error al verificar el token:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};