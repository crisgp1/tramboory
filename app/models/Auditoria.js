const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');

const Auditoria = sequelize.define('Auditoria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre_usuario: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_operacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  transaccion: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'auditoria',
  schema: MODEL_SCHEMAS.Auditoria,
  timestamps: false
});

module.exports = Auditoria;