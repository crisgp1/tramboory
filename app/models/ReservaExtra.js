const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservaExtra = sequelize.define('ReservaExtra', {
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    }
  },
  id_extra: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Extras',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'ReservaExtras',
  timestamps: true
});

module.exports = ReservaExtra;