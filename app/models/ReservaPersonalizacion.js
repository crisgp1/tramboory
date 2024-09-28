const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ReservaPersonalizacion = sequelize.define('ReservaPersonalizacion', {
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    },
    primaryKey: true
  },
  id_personalizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personalizaciones',
      key: 'id'
    },
    primaryKey: true
  }
}, {
  tableName: 'Reservas_Personalizaciones',
  timestamps: false
});
module.exports = ReservaPersonalizacion;
