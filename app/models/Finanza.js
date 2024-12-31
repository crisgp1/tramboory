const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Finanza = sequelize.define('Finanzas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'reservas',
      key: 'id'
    }
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'gasto'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El monto debe ser mayor a 0'
      }
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  factura_pdf: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  factura_xml: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  archivo_prueba: {
    type: DataTypes.STRING(255),
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
  tableName: 'finanzas',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

module.exports = Finanza;