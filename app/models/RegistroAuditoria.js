const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegistroAuditoria = sequelize.define('RegistroAuditoria', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_tabla: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipo_operacion: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_operacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  datos_anteriores: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  datos_nuevos: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  direccion_ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  agente_usuario: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'registro_auditoria',
  schema: 'tramboory',
  timestamps: false, // Ya tenemos fecha_operacion
  // No necesitamos hooks de auditoría en la tabla de auditoría
});

// Asociación con Usuario si es necesario
RegistroAuditoria.associate = (models) => {
  if (models.Usuario) {
    RegistroAuditoria.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });
  }
};

module.exports = RegistroAuditoria;