const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');
const Tematica = require('./Tematica');

const Mampara = sequelize.define('Mamparas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_tematica: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tematicas',
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
  tableName: 'mamparas',
  schema: MODEL_SCHEMAS.Mampara,
  timestamps: false,
  indexes: [
    {
      name: 'idx_mamparas_tematica',
      fields: ['id_tematica']
    }
  ]
});

// Definir las relaciones
Mampara.belongsTo(Tematica, {
  foreignKey: 'id_tematica',
  as: 'tematica'
});

module.exports = Mampara;