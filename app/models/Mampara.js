const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tematica = require('./Tematica');

const Mampara = sequelize.define('Mampara', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_tematica: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tematica,
      key: 'id'
    }
  },
  piezas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  foto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Mamparas',
  timestamps: false
});

module.exports = Mampara;