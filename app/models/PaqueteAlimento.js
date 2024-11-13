const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaqueteAlimento = sequelize.define('PaqueteAlimento', {
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
  }
}, {
  tableName: 'Paquetes_Alimentos',
  timestamps: false
});

module.exports = PaqueteAlimento;