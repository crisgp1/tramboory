// models/Pago.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  metodo_pago: {
    type: DataTypes.ENUM('tarjeta', 'paypal', 'transferencia', 'efectivo'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'Pagos',
  timestamps: false,
});

module.exports = Pago;
