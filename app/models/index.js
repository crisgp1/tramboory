// models/index.js

const sequelize = require('../config/database');

const Paquete = require('./Paquete');
const PaqueteAlimento = require('./PaqueteAlimento');
const OpcionAlimento = require('./OpcionAlimento');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');
const Finanza = require('./Finanza');
const Pago = require('./Pago');
const Mampara = require('./Mampara');
const Tematica = require('./Tematica');
const Extra = require('./Extra');
const Categoria = require('./Categoria');
const ReservaExtra = require('./ReservaExtra');

// Asociaciones
Usuario.hasMany(Reserva, { foreignKey: 'id_usuario', as: 'reservas' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Paquete.hasMany(Reserva, { foreignKey: 'id_paquete', as: 'reservas' });
Reserva.belongsTo(Paquete, { foreignKey: 'id_paquete', as: 'paquete' });

OpcionAlimento.hasMany(Reserva, { foreignKey: 'id_opcion_alimento', as: 'reservasOpcionAlimento' });
Reserva.belongsTo(OpcionAlimento, { foreignKey: 'id_opcion_alimento', as: 'opcionAlimento' });

Reserva.belongsTo(Mampara, { foreignKey: 'id_mampara', as: 'mampara' });

Reserva.hasMany(Finanza, { foreignKey: 'id_reserva', as: 'finanzas' });
Finanza.belongsTo(Reserva, { foreignKey: 'id_reserva', as: 'reserva' });

Reserva.hasMany(Pago, { foreignKey: 'id_reserva', as: 'pagos' });
Pago.belongsTo(Reserva, { foreignKey: 'id_reserva', as: 'reserva' });

Tematica.hasMany(Reserva, { foreignKey: 'id_tematica', as: 'reservasTematica' });
Reserva.belongsTo(Tematica, { foreignKey: 'id_tematica', as: 'tematicaReserva' });

Tematica.hasMany(Mampara, { foreignKey: 'id_tematica', as: 'mamparas' });
Mampara.belongsTo(Tematica, { foreignKey: 'id_tematica', as: 'tematica' });

// Relación entre Reserva y Extra usando ReservaExtras como tabla intermedia
Reserva.belongsToMany(Extra, {
  through: ReservaExtra,
  foreignKey: 'id_reserva',
  otherKey: 'id_extra',
  as: 'extras'
});

Extra.belongsToMany(Reserva, {
  through: ReservaExtra,
  foreignKey: 'id_extra',
  otherKey: 'id_reserva',
  as: 'reservas'
});

module.exports = {
  sequelize,
  Paquete,
  PaqueteAlimento,
  OpcionAlimento,
  Usuario,
  Reserva,
  Finanza,
  Pago,
  Mampara,
  Tematica,
  Extra,
  Categoria,
  ReservaExtra
};