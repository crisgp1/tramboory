const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const OpcionAlimento = sequelize.define('OpcionAlimento', {
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
    precio_extra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'Opciones_Alimentos',
    timestamps: false
  });

  
module.exports = OpcionAlimento;
