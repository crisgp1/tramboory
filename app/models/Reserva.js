const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reservas', {
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
  id_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'paquetes',
      key: 'id'
    }
  },
  id_opcion_alimento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'opciones_alimentos',
      key: 'id'
    }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterToday(value) {
        if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          throw new Error('La fecha de reserva debe ser futura');
        }
      }
    }
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },  
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '16:00:00',
    validate: {
      isAfterInicio(value) {
        if (value <= this.hora_inicio) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  nombre_festejado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  edad_festejado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  comentarios: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  id_tematica: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tematicas',
      key: 'id'
    }
  },
  id_mampara: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mamparas',
      key: 'id'
    }
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
  tableName: 'reservas',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      name: 'idx_reservas_usuario',
      fields: ['id_usuario']
    },
    {
      name: 'idx_reservas_paquete',
      fields: ['id_paquete']
    },
    {
      name: 'idx_reservas_opcion_alimento',
      fields: ['id_opcion_alimento']
    },
    {
      name: 'idx_reservas_mampara',
      fields: ['id_mampara']
    },
    {
      name: 'idx_reservas_tematica',
      fields: ['id_tematica']
    },
    {
      name: 'idx_reservas_horario',
      unique: true,
      fields: ['fecha_reserva', 'hora_inicio', 'hora_fin'],
      where: {
        estado: {
          [Op.ne]: 'cancelada'
        }
      }
    }
  ]
});

module.exports = Reserva;