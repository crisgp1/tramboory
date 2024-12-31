const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pagos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reservas',
      key: 'id'
    }
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
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('transferencia', 'efectivo'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
    allowNull: false,
    defaultValue: 'pendiente'
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
  tableName: 'pagos',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      name: 'idx_pagos_reserva',
      fields: ['id_reserva']
    },
    {
      name: 'idx_pagos_compuesto',
      fields: ['id_reserva', 'estado', 'fecha_pago']
    }
  ]
});

module.exports = Pago;