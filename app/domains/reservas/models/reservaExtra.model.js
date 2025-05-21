const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');
const ReservaExtra = sequelize.define('ReservaExtras', {
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'reservas',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_extra: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'extras',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'reserva_extras',
  schema: MODEL_SCHEMAS.ReservaExtra,
  timestamps: false,
  indexes: [
    {
      name: 'idx_reserva_extras_reserva',
      fields: ['id_reserva']
    },
    {
      name: 'idx_reserva_extras_extra',
      fields: ['id_extra']
    }
  ]
});

module.exports = ReservaExtra;