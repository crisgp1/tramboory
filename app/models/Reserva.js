const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_opcion_alimento: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nombre_festejado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  edad_festejado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  id_tematica: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_mampara: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Reservas',
  timestamps: false
});

module.exports = Reserva;