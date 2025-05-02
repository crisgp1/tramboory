const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');

class PreReserva extends Model {}

PreReserva.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  datos_reserva: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Contiene todos los datos necesarios para crear una reserva'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha y hora en que expira la pre-reserva'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'completada', 'expirada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  sequelize,
  tableName: 'pre_reservas',
  schema: MODEL_SCHEMAS.Reserva || 'main',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      name: 'idx_pre_reservas_usuario',
      fields: ['id_usuario']
    },
    {
      name: 'idx_pre_reservas_estado',
      fields: ['estado']
    },
    {
      name: 'idx_pre_reservas_expiracion',
      fields: ['fecha_expiracion']
    }
  ],
  hooks: {
    beforeCreate: async (preReserva) => {
      // Si no se proporciona fecha de expiración, establecer por defecto 30 minutos después
      if (!preReserva.fecha_expiracion) {
        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 30);
        preReserva.fecha_expiracion = expiracion;
      }
    }
  }
});

// Método de instancia para verificar si la pre-reserva ha expirado
PreReserva.prototype.haExpirado = function() {
  if (!this.fecha_expiracion) return false;
  return new Date() > new Date(this.fecha_expiracion);
};

// Método de clase para limpiar pre-reservas expiradas
PreReserva.limpiarExpiradas = async function() {
  try {
    const expiradas = await this.update(
      { estado: 'expirada' },
      {
        where: {
          estado: 'pendiente',
          fecha_expiracion: {
            [sequelize.Op.lt]: new Date()
          }
        }
      }
    );
    
    console.log(`${expiradas[0]} pre-reservas marcadas como expiradas`);
    return expiradas[0];
  } catch (error) {
    console.error('Error al limpiar pre-reservas expiradas:', error);
    throw error;
  }
};

module.exports = PreReserva;