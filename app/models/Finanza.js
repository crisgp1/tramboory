const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Finanza = sequelize.define('Finanza', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Reservas',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'gasto'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  archivo_prueba: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Finanzas',
  timestamps: false
});

module.exports = Finanza;