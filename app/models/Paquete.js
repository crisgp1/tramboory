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
  precio_lunes_jueves: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precio_viernes_domingo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Paquetes',
  timestamps: false
});

module.exports = Paquete;