const sequelize = require('../config/database');

const auditMiddleware = (req, res, next) => {
  // Si el usuario está autenticado, configurar la variable para auditoría
  if (req.user && req.user.id) {
    sequelize.query(`SELECT set_config('app.id_usuario_actual', '${req.user.id}', false)`)
      .then(() => {
        next();
      })
      .catch(error => {
        console.error('Error al configurar usuario para auditoría:', error);
        next();
      });
  } else {
    next();
  }
};

module.exports = auditMiddleware;