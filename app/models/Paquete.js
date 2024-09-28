const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Paquete = sequelize.define('Paquete', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Paquetes',
  timestamps: false
});

module.exports = Paquete;
