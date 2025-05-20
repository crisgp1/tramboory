const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PaqueteAlimento = require('./PaqueteAlimento');
const MODEL_SCHEMAS = require('../utils/schemaMap');

const Paquete = sequelize.define('Paquetes', {
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
  },
  precio_lunes_jueves: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  precio_viernes_domingo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
}, {
  tableName: 'paquetes',
  schema: MODEL_SCHEMAS.Paquete, // Usar 'main' como schema
  timestamps: false,
  indexes: [
    {
      name: 'idx_paquetes_paquete_alimento',
      fields: ['id_paquete_alimento']
    }
  ]
});

// Definir las relaciones
Paquete.belongsTo(PaqueteAlimento, {
  foreignKey: 'id_paquete_alimento',
  as: 'paqueteAlimento'
});

module.exports = Paquete;