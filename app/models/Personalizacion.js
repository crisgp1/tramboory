const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Personalizacion = sequelize.define('Personalizacion', {
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
  precio_adicional: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Personalizaciones',
  timestamps: false
});
module.exports = Personalizacion;
