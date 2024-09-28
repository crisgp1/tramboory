const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_servicio: {
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
  tableName: 'Servicios',
  timestamps: false
});
module.exports = Servicio;
