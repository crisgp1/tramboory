const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'uq_usuarios_email',
      msg: 'El correo electrónico ya está en uso'
    },
    validate: {
      isEmail: {
        msg: 'El formato del correo electrónico no es válido'
      }
    }
  },
  clave_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_usuario: {
    type: DataTypes.ENUM('cliente', 'admin'),
    allowNull: false
  },
  id_personalizado: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'usuarios',
  schema: MODEL_SCHEMAS.Usuario, // Usar 'usuarios' como schema
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Usuario;