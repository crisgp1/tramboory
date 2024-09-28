const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('tarjeta', 'paypal', 'transferencia'),
    allowNull: false
  }
}, {
  tableName: 'Pagos',
  timestamps: false
});
module.exports = Pago;
