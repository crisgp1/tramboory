const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  console.log('Token recibido:', token);

  if (!token) {
    console.log('No se proporcionó un token');
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log('Error al verificar el token:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};