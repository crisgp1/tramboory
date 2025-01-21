const { Model, DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const Finanza = require('./Finanza');

class Reserva extends Model {
  async validarPagosCompletos() {
    const pagos = await this.getPagos();
    const totalPagado = pagos
      .filter(p => p.estado === 'completado')
      .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    return totalPagado >= parseFloat(this.total);
  }

  async cancelarPagosPendientes() {
    const pagos = await this.getPagos({
      where: {
        estado: 'pendiente'
      }
    });

    await Promise.all(
      pagos.map(pago => pago.update({ estado: 'fallido' }))
    );
  }

  static associate(models) {
    Reserva.belongsToMany(models.Extra, {
      through: 'reserva_extras',
      foreignKey: 'id_reserva',
      otherKey: 'id_extra',
      as: 'extras'
    });
    
    Reserva.hasMany(models.Pago, {
      foreignKey: 'id_reserva',
      as: 'pagos'
    });
  }
}

Reserva.init({
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
        // Obtener la fecha actual en la zona horaria local
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
        
        // Asegurarnos de que value esté en el formato correcto YYYY-MM-DD
        const dateValue = value instanceof Date ? value.toISOString().split('T')[0] : value;
        
        if (dateValue < today) {
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
  sequelize,
  modelName: 'Reserva',
  tableName: 'reservas',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  hooks: {
    beforeValidate: async (reserva) => {
      // Asegurarnos de que la fecha_reserva se maneje correctamente
      if (reserva.fecha_reserva) {
        // Si la fecha viene como objeto Date, la convertimos a YYYY-MM-DD
        if (reserva.fecha_reserva instanceof Date) {
          reserva.fecha_reserva = reserva.fecha_reserva.toISOString().split('T')[0];
        }
      }
    },
    beforeUpdate: async (reserva) => {
      // Si la reserva se está desactivando
      if (reserva.changed('activo') && !reserva.activo) {
        reserva.estado = 'cancelada';
        await reserva.cancelarPagosPendientes();
      }
      
      // Si se está confirmando la reserva
      if (reserva.changed('estado') && reserva.estado === 'confirmada') {
        const pagosCompletos = await reserva.validarPagosCompletos();
        if (!pagosCompletos) {
          throw new Error('No se puede confirmar la reserva sin completar el pago total');
        }
      }
      
      // Si se está cancelando la reserva
      if (reserva.changed('estado') && reserva.estado === 'cancelada') {
        await reserva.cancelarPagosPendientes();
      }
    }
  },
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