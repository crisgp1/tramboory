const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');

const PaqueteAlimento = sequelize.define('PaquetesAlimentos', {
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
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'paquetes_alimentos',
  schema: MODEL_SCHEMAS.PaqueteAlimento,
  timestamps: false
});

// Las relaciones se definen en el modelo que tiene la clave foránea
// OpcionAlimento y Paquete tienen la referencia a PaqueteAlimento
// No es necesario definir las relaciones aquí para evitar referencias circulares

module.exports = PaqueteAlimento;