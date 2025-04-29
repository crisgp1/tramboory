const sequelize = require('../config/database');

const agregarHooksAuditoria = (modelo) => {
  // Determinar schema origen para el trigger de auditoría
  const schemaOrigen = modelo.options.schema || 'public';
  
  modelo.addHook('beforeCreate', async (instance, options) => {
    // Si hay un usuario en la sesión, establecer para auditoría
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '${options.userId}', false)`);
    }
  });
  
  modelo.addHook('afterCreate', async (instance, options) => {
    // Limpiar variable después si es necesario
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '0', false)`);
    }
  });
  
  modelo.addHook('beforeUpdate', async (instance, options) => {
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '${options.userId}', false)`);
    }
  });
  
  modelo.addHook('afterUpdate', async (instance, options) => {
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '0', false)`);
    }
  });
  
  modelo.addHook('beforeDestroy', async (instance, options) => {
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '${options.userId}', false)`);
    }
  });
  
  modelo.addHook('afterDestroy', async (instance, options) => {
    if (options.userId) {
      await sequelize.query(`SELECT set_config('app.id_usuario_actual', '0', false)`);
    }
  });
};

module.exports = {
  agregarHooksAuditoria
};