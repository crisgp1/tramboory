const sequelize = require('../config/database');

const Paquete = require('./Paquete');
const PaqueteAlimento = require('./PaqueteAlimento');
const Personalizacion = require('./Personalizacion');
const OpcionAlimento = require('./OpcionAlimento');
const Servicio = require('./Servicio');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');
const Finanza = require('./Finanza');
const Pago = require('./Pago');
const ReservaPersonalizacion = require('./ReservaPersonalizacion');

Usuario.hasMany(Reserva, { foreignKey: 'id_usuario' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Paquete.hasMany(Reserva, { foreignKey: 'id_paquete' });
Reserva.belongsTo(Paquete, { foreignKey: 'id_paquete' });

OpcionAlimento.hasMany(Reserva, { foreignKey: 'id_opcion_alimento' });
Reserva.belongsTo(OpcionAlimento, { foreignKey: 'id_opcion_alimento' });

Reserva.belongsToMany(Personalizacion, { through: ReservaPersonalizacion, foreignKey: 'id_reserva' });
Personalizacion.belongsToMany(Reserva, { through: ReservaPersonalizacion, foreignKey: 'id_personalizacion' });

Reserva.hasMany(Finanza, { foreignKey: 'id_reserva' });
Finanza.belongsTo(Reserva, { foreignKey: 'id_reserva' });

Reserva.hasMany(Pago, { foreignKey: 'id_reserva' });
Pago.belongsTo(Reserva, { foreignKey: 'id_reserva' });

module.exports = {
  sequelize,
  Paquete,
  PaqueteAlimento,
  Personalizacion,
  OpcionAlimento,
  Servicio,
  Usuario,
  Reserva,
  Finanza,
  Pago,
  ReservaPersonalizacion
};
