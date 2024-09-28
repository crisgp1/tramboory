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
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  id_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Paquetes',
      key: 'id'
    }
  },
  id_opcion_alimento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Opciones_Alimentos',
      key: 'id'
    }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.ENUM('mañana', 'tarde'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
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
  tematica: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cupcake: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  mampara: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  piñata: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'Reservas',
  timestamps: true
});


module.exports = Reserva;
